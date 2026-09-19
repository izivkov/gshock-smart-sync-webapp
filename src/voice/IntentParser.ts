import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { monthType } from "@/pages/reminders/ReminderData";

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);

export enum VoiceCommandType {
    SET_ALARM,
    CLEAR_ALL_ALARMS,
    DISABLE_ALL_ALARMS,
    SET_TIMER,
    SET_SETTING,
    ADD_REMINDER,
    HELP,
    SET_SETTINGS_TO_DEFAULT
}

export interface VoiceCommand {
    type: VoiceCommandType;
    params?: any;
}

export class IntentParser {
    private timerKeywordPattern = /timer/i;
    private timerUnitPattern = /(\d+|one|two|three|four|five|six|seven|eight|nine|ten|a|an|half)\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)/gi;
    private implicitTimerPattern = /timer.*?(?:at|for|to)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*[:\s]+\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i;

    private helpPattern = /help/i;

    private clearAlarmsPattern = /(?:clear|reset)\s*(?:all\s*)?alarms?/i;
    private disableAlarmsPattern = /(?:disable|turn off|stop)\s*(?:all\s*)?alarms?/i;

    private alarmPatterns = [
        /(?:set|wake me up|create)(?: an?)? alarm (?:at|for|to|in) (.*)/i,
        /wake me up (?:at|in) (.*)/i,
        /alarm (?:at|for|to|in) (.*)/i
    ];

    private reminderPatterns = [
        /(?:remind me|add (?:a |an )?(?:new )?(?:reminder|event)|create (?:a |an )?(?:new )?(?:reminder|event)|set (?:a |an )?(?:new )?(?:reminder|event)|new reminder)(?: (?:to )?(.*))?/i
    ];

    private languagePattern = /(?:set|change)?\s*(?:the\s*)?language\s*(?:to)?\s*(english|spanish|french|german|italian|russian)/i;
    private buttonTonePattern = /(turn (on|off)|enable|disable|change|set)\s*(?:the\s*)?(button sound|button tone|sound)\s*(?:to)?\s*(on|off)?/i;
    private lightDurationPattern = /light\s*duration/i;
    private settingsDefaultPattern = /(?:set|change|reset)?\s*(?:the\s*)?settings(?:\s*(?:to)?\s*defaults?)?/i;

    private fillerRegex = /\b(um|uh|mm|ah|er|like|so|well)\b/gi;
    private correctionMarkers = ["i mean", "actually", "no wait", "sorry", "i meant"];

    public parse(rawText: string): VoiceCommand | null {
        let text = this.handleSelfCorrection(rawText);
        text = this.stripFillers(text).toLowerCase();

        // 1. Help
        if (this.helpPattern.test(text)) {
            return { type: VoiceCommandType.HELP };
        }

        // 2. Timer
        if (this.timerKeywordPattern.test(text)) {
            let totalSeconds = this.parseDurationToSeconds(text);
            let durationStr = '';

            if (totalSeconds === 0) {
                const implicitMatch = text.match(this.implicitTimerPattern);
                if (implicitMatch) {
                    const min = this.parseSpokenNumber(implicitMatch[1]);
                    const sec = this.parseSpokenNumber(implicitMatch[2]);
                    totalSeconds = min * 60 + sec;
                    durationStr = `${min} minutes and ${sec} seconds`;
                }
            } else {
                durationStr = this.getDurationString(totalSeconds);
            }

            if (totalSeconds > 0) {
                return {
                    type: VoiceCommandType.SET_TIMER,
                    params: {
                        totalSeconds,
                        durationStr,
                        hours: Math.floor(totalSeconds / 3600),
                        minutes: Math.floor((totalSeconds % 3600) / 60),
                        seconds: totalSeconds % 60
                    }
                };
            }
        }

        // 3. Alarm / Wake me up
        if (this.clearAlarmsPattern.test(text)) {
            return { type: VoiceCommandType.CLEAR_ALL_ALARMS };
        }
        if (this.disableAlarmsPattern.test(text)) {
            return { type: VoiceCommandType.DISABLE_ALL_ALARMS };
        }

        for (const p of this.alarmPatterns) {
            const match = text.match(p);
            if (match) {
                const timeString = match[1];
                const res = this.parseSpokenAlarmTime(timeString);
                if (res) {
                    return {
                        type: VoiceCommandType.SET_ALARM,
                        params: { hour: res.hour, minute: res.minute, feedback: res.feedback }
                    };
                }
            }
        }

        // 4. Settings
        if (this.settingsDefaultPattern.test(text) || text.includes('settings to default')) {
            return { type: VoiceCommandType.SET_SETTINGS_TO_DEFAULT };
        }

        const langMatch = text.match(this.languagePattern);
        if (langMatch) {
            const lang = langMatch[1].charAt(0).toUpperCase() + langMatch[1].slice(1);
            return { type: VoiceCommandType.SET_SETTING, params: { name: "language", value: lang } };
        }

        const btnToneMatch = text.match(this.buttonTonePattern);
        if (btnToneMatch) {
            const action = btnToneMatch[1].toLowerCase();
            const stateSuffix = btnToneMatch[3]?.toLowerCase();
            const enabled = stateSuffix === "on" || action.includes("on") || action.includes("enable");
            return { type: VoiceCommandType.SET_SETTING, params: { name: "button tone", value: enabled.toString() } };
        }

        if (this.lightDurationPattern.test(text)) {
            const isLong = /long/i.test(text);
            const isShort = /short/i.test(text);
            // Matched "light duration" explicitly: never fall through to the
            // generic auto-light toggle below, even if short/long wasn't given.
            return isLong || isShort
                ? { type: VoiceCommandType.SET_SETTING, params: { name: "light duration", value: isLong ? "long" : "short" } }
                : null;
        }

        if (/auto light|light/i.test(text)) {
            const enabled = !/off|disable|disabled/i.test(text);
            return { type: VoiceCommandType.SET_SETTING, params: { name: "auto light", value: enabled.toString() } };
        }
        if (/power saving|power save/i.test(text)) {
            const enabled = !/off|disable|disabled/i.test(text);
            return { type: VoiceCommandType.SET_SETTING, params: { name: "power saving", value: enabled.toString() } };
        }

        // 5. Reminder
        for (const p of this.reminderPatterns) {
            const match = text.match(p);
            if (match) {
                return { type: VoiceCommandType.ADD_REMINDER, params: { title: match[1] || "" } };
            }
        }

        return null;
    }

    public handleSelfCorrection(text: string): string {
        let result = text;
        for (const marker of this.correctionMarkers) {
            const lastIndex = result.toLowerCase().lastIndexOf(marker);
            if (lastIndex !== -1) {
                const corrected = result.substring(lastIndex + marker.length).trim();
                if (corrected.length > 0) {
                    result = corrected;
                }
            }
        }
        return result;
    }

    public stripFillers(text: string): string {
        return text.replace(this.fillerRegex, "").replace(/\s+/g, " ").trim();
    }

    public parseSpokenNumber(text: string): number {
        const numberWords: { [key: string]: number } = {
            zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
            six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
            a: 1, an: 1, half: 0.5
        };
        const cleaned = text.trim().toLowerCase();
        const match = cleaned.match(/^\d+$/);
        if (match) return parseInt(match[0], 10);
        return numberWords[cleaned] ?? 0;
    }

    public parseDurationToSeconds(text: string): number {
        const normalized = text.toLowerCase()
            .replace("an hour and a half", "90 minutes")
            .replace("a hour and a half", "90 minutes")
            .replace("one hour and a half", "90 minutes")
            .replace("half an hour", "30 minutes")
            .replace("half a hour", "30 minutes")
            .replace("an hour", "1 hour")
            .replace("a hour", "1 hour")
            .replace("a minute", "1 minute")
            .replace("a second", "1 second");

        const matches = Array.from(normalized.matchAll(this.timerUnitPattern));
        if (matches.length === 0) return 0;

        let totalSeconds = 0;
        for (const match of matches) {
            const amountStr = match[1];
            const unit = match[2].toLowerCase();

            const amount = this.parseSpokenNumber(amountStr);
            const multiplier = (unit.startsWith("hour") || unit.startsWith("hr")) ? 3600 :
                              (unit.startsWith("minute") || unit.startsWith("min")) ? 60 : 1;

            totalSeconds += Math.floor(amount * multiplier);
        }
        return totalSeconds;
    }

    private getDurationString(totalSeconds: number): string {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        let parts = [];
        if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
        if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
        if (seconds > 0) parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`);
        return parts.join(' and ');
    }

    private parseTime(timeStr: string) {
        const normalized = timeStr.trim().toLowerCase()
            .replace(/\s+/g, " ")
            .replace(/([ap])\.?m\.?/g, "$1m")
            .replace(/ap$/g, "am")
            .replace(/ap\s/g, "am ")
            .replace(/\.$/, "");

        const fullTimeRegex = /(\d{1,2}):(\d{2})\s*(am|pm)?/i;
        const fullMatch = normalized.match(fullTimeRegex);
        if (fullMatch) {
            let hour = parseInt(fullMatch[1], 10);
            const minute = parseInt(fullMatch[2], 10);
            const marker = fullMatch[3];
            if (marker === "pm" && hour < 12) hour += 12;
            if (marker === "am" && hour === 12) hour = 0;
            if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) return { hour, minute };
        }

        const simpleTimeRegex = /(\d{1,2})\s*(am|pm)/i;
        const simpleMatch = normalized.match(simpleTimeRegex);
        if (simpleMatch) {
            let hour = parseInt(simpleMatch[1], 10);
            const marker = simpleMatch[2];
            if (marker === "pm" && hour < 12) hour += 12;
            if (marker === "am" && hour === 12) hour = 0;
            if (hour >= 0 && hour <= 23) return { hour, minute: 0 };
        }

        const digitOnlyMatch = normalized.match(/^(\d{1,2})$/);
        if (digitOnlyMatch) {
            const hour = parseInt(digitOnlyMatch[1], 10);
            if (hour >= 0 && hour <= 23) return { hour, minute: 0 };
        }
        return null;
    }

    private parseSpokenAlarmTime(text: string) {
        const time = this.parseTime(text);
        if (time) {
            const { hour, minute } = time;
            return { hour, minute, feedback: `${hour % 12 || 12}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}` };
        }

        const durationSeconds = this.parseDurationToSeconds(text);
        if (durationSeconds > 0) {
            const target = dayjs().add(durationSeconds, 'second');
            return {
                hour: target.hour(),
                minute: target.minute(),
                feedback: `in ${this.getDurationString(durationSeconds)} from now`
            };
        }
        return null;
    }

    public parseDate(text: string) {
        const lower = text.toLowerCase();
        const today = dayjs().startOf('day');
        let target = today;
        let feedback = '';

        const daysOfWeekMap: Record<string, number> = {
            sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
        };

        const weeksFromPattern = /(an?|\d+|one|two|three|four|five|six|seven|eight|nine|ten)?\s*weeks?\s*(?:from\s+)?(next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i;
        const weeksMatch = lower.match(weeksFromPattern);
        if (weeksMatch) {
            const countStr = weeksMatch[1]?.toLowerCase();
            const isNext = !!weeksMatch[2];
            const dayName = weeksMatch[3].toLowerCase();

            const count = (!countStr || countStr === "a" || countStr === "an") ? 1 : this.parseSpokenNumber(countStr);
            const targetDay = daysOfWeekMap[dayName];

            let d = today.day(targetDay);
            if (d.isBefore(today, 'day')) d = d.add(1, 'week');
            if (isNext) d = d.add(1, 'week');

            target = d.add(count, 'week');
            feedback = `${count === 1 ? 'a' : count} week${count > 1 ? 's' : ''} from ${isNext ? 'next ' : ''}${dayName}`;
        } else {
            let foundDay = false;
            for (const [name, dayNum] of Object.entries(daysOfWeekMap)) {
                if (lower.includes(name)) {
                    let d = today.day(dayNum);
                    if (d.isBefore(today, 'day')) d = d.add(1, 'week');

                    if (lower.includes("next")) {
                        if (d.isSame(today, 'day')) {
                            d = d.add(1, 'week');
                        } else {
                            d = d.add(1, 'week');
                        }
                    }

                    target = d;
                    feedback = `${lower.includes("next") ? 'next ' : ''}${name}`;
                    foundDay = true;
                    break;
                }
            }

            if (!foundDay) {
                if (lower.includes('tomorrow')) {
                    target = today.add(1, 'day');
                    feedback = 'tomorrow';
                } else if (lower.includes('today')) {
                    target = today;
                    feedback = 'today';
                } else {
                    const months: Record<string, number> = {
                        january: 0, feb: 1, february: 1, march: 2, april: 3, may: 4, june: 5,
                        july: 6, august: 7, sep: 8, september: 8, october: 9, november: 10, december: 11
                    };
                    let month: number | null = null;
                    for (const [m, val] of Object.entries(months)) {
                        if (lower.includes(m)) { month = val; break; }
                    }
                    const dayMatch = lower.match(/\d+/);
                    if (month !== null && dayMatch) {
                        target = today.month(month).date(parseInt(dayMatch[0], 10));
                        if (target.isBefore(today, 'day')) target = target.add(1, 'year');
                        feedback = `for ${target.format('MMMM D')}`;
                    } else {
                        target = today;
                        feedback = 'today';
                    }
                }
            }
        }

        const monthNames: monthType[] = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        const monthName = monthNames[target.month()];

        return {
            year: target.year(),
            month: monthName,
            day: target.date(),
            feedback,
            iso: target.format('YYYY-MM-DD')
        };
    }
}
