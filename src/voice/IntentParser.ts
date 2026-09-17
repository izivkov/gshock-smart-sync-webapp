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
    private clearAlarmsPatterns = [
        /clear (?:all )?alarms?/i,
        /delete (?:all )?alarms?/i,
        /remove (?:all )?alarms?/i
    ];

    private disableAlarmsPatterns = [
        /disable (?:all )?alarms?/i,
        /turn off (?:all )?alarms?/i,
        /stop (?:all )?alarms?/i
    ];

    private alarmPatterns = [
        /(?:set|wake me up|create)(?: an?)? alarm (?:at|for|to|in) (.*)/i,
        /wake me up (?:at|in) (.*)/i,
        /set alarm for (.*)/i,
        /set an alarm for (.*)/i,
        /alarm (?:at|in) (.*)/i
    ];

    private timerKeywordPattern = /timer/i;

    private timerUnitPattern = /(\d+|one|two|three|four|five|six|seven|eight|nine|ten|a|an|half)\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)/i;

    private implicitTimerPattern = /timer.*?(?:at|for|to)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)[:\s]+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i;

    private languagePattern = /(?:set|change)?\s*(?:the\s*)?language\s*(?:to)?\s*(english|spanish|french|german|italian|russian)/i;
    private timeFormatPattern = /(?:set|change)?\s*(?:the\s*)?time format\s*(?:to)?\s*(12|24) (?:hours?|hrs?)?/i;
    private dateFormatPattern = /(?:set|change)?\s*(?:the\s*)?date format\s*(?:to)?\s*(month day|day month|month-day|day-month)/i;
    private lightDurationPattern = /(?:set|change)?\s*(?:the\s*)?(?:light|illumination) (?:duration|period)\s*(?:to)?\s*(1\.5|2|3|4|5) (?:seconds?|secs?)?/i;
    private buttonTonePattern = /(turn (on|off)|enable|disable|change|set)\s*(?:the\s*)?(button sound|button tone|sound)\s*(?:to)?\s*(on|off)?/i;
    private settingsDefaultPattern = /(?:set|change|reset)?\s*(?:the\s*)?settings(?:\s*(?:to)?\s*defaults?)?/i;
    private helpPattern = /help/i;

    private reminderPatterns = [
        /(?:remind me|add (?:a |an )?(?:new )?(?:reminder|event)|create (?:a |an )?(?:new )?(?:reminder|event)|set (?:a |an )?(?:new )?(?:reminder|event)|new reminder)(?: (?:to )?(.*))?/i
    ];

    private fillerRegex = /\b(um|uh|mm|ah|er|like)\b/gi;
    private correctionMarkers = ["i mean", "actually", "no wait", "sorry", "i meant"];

    parse(text: string): VoiceCommand | null {
        let processedText = this.handleSelfCorrection(text);
        processedText = this.stripFillers(processedText);

        const cleanedText = processedText.trim().replace(/\.$/, "").toLowerCase();

        // 1. Timer
        if (this.timerKeywordPattern.test(cleanedText)) {
            const durationSeconds = this.parseDurationToSeconds(cleanedText);
            if (durationSeconds > 0) {
                return {
                    type: VoiceCommandType.SET_TIMER,
                    params: {
                        hours: Math.floor(durationSeconds / 3600),
                        minutes: Math.floor((durationSeconds % 3600) / 60),
                        seconds: durationSeconds % 60
                    }
                };
            }

            const implicitMatch = cleanedText.match(this.implicitTimerPattern);
            if (implicitMatch) {
                const min = parseInt(implicitMatch[1]) || this.wordToNumber(implicitMatch[1]);
                const sec = parseInt(implicitMatch[2]) || this.wordToNumber(implicitMatch[2]);
                if (min !== null && sec !== null) {
                    return {
                        type: VoiceCommandType.SET_TIMER,
                        params: { hours: 0, minutes: min, seconds: sec }
                    };
                }
            }
        }

        // 2. Alarm
        if (this.clearAlarmsPatterns.some(p => p.test(cleanedText))) {
            return { type: VoiceCommandType.CLEAR_ALL_ALARMS };
        }

        if (this.helpPattern.test(cleanedText)) {
            return { type: VoiceCommandType.HELP };
        }

        if (this.disableAlarmsPatterns.some(p => p.test(cleanedText))) {
            return { type: VoiceCommandType.DISABLE_ALL_ALARMS };
        }

        for (const p of this.alarmPatterns) {
            const match = cleanedText.match(p);
            if (match) {
                const timeString = match[1];
                const time = this.parseTime(timeString);
                if (time) {
                    return {
                        type: VoiceCommandType.SET_ALARM,
                        params: { hour: time.hour, minute: time.minute }
                    };
                }

                const durationSeconds = this.parseDurationToSeconds(timeString);
                if (durationSeconds > 0) {
                    const now = new Date();
                    const target = new Date(now.getTime() + durationSeconds * 1000);
                    return {
                        type: VoiceCommandType.SET_ALARM,
                        params: { hour: target.getHours(), minute: target.getMinutes() }
                    };
                }
            }
        }

        // 3. Reminder
        for (const p of this.reminderPatterns) {
            const match = cleanedText.match(p);
            if (match) {
                const payload = match[1] || "";
                const { title, date } = this.extractTitleAndDate(payload);
                const repeat = this.extractRepeat(payload);
                return {
                    type: VoiceCommandType.ADD_REMINDER,
                    params: { title, startDate: date, repeatPeriod: repeat }
                };
            }
        }

        // 4. Settings
        const langMatch = cleanedText.match(this.languagePattern);
        if (langMatch) {
            const lang = langMatch[1].charAt(0).toUpperCase() + langMatch[1].slice(1);
            return { type: VoiceCommandType.SET_SETTING, params: { name: "language", value: lang } };
        }

        const timeFmtMatch = cleanedText.match(this.timeFormatPattern);
        if (timeFmtMatch) {
            return { type: VoiceCommandType.SET_SETTING, params: { name: "time format", value: timeFmtMatch[1] + "h" } };
        }

        const dateFmtMatch = cleanedText.match(this.dateFormatPattern);
        if (dateFmtMatch) {
            const format = dateFmtMatch[1].replace("-", " ") === "month day" ? "MM:DD" : "DD:MM";
            return { type: VoiceCommandType.SET_SETTING, params: { name: "date format", value: format } };
        }

        const lightDurMatch = cleanedText.match(this.lightDurationPattern);
        if (lightDurMatch) {
            return { type: VoiceCommandType.SET_SETTING, params: { name: "light duration", value: lightDurMatch[1] + "s" } };
        }

        const btnToneMatch = cleanedText.match(this.buttonTonePattern);
        if (btnToneMatch) {
            const action = btnToneMatch[1].toLowerCase();
            const stateSuffix = btnToneMatch[3]?.toLowerCase();
            const enabled = stateSuffix === "on" || action.includes("on") || action.includes("enable");
            return { type: VoiceCommandType.SET_SETTING, params: { name: "button tone", value: enabled.toString() } };
        }

        if (this.settingsDefaultPattern.test(cleanedText)) {
            return { type: VoiceCommandType.SET_SETTINGS_TO_DEFAULT };
        }

        if (/auto light|power saving|light|power save/i.test(cleanedText)) {
            const target = /auto light|light/i.test(cleanedText) ? "auto light" : "power saving";
            const enabled = !/off|disable|disabled/i.test(cleanedText);
            return { type: VoiceCommandType.SET_SETTING, params: { name: target, value: enabled.toString() } };
        }

        return null;
    }

    private handleSelfCorrection(text: string): string {
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

    private stripFillers(text: string): string {
        return text.replace(this.fillerRegex, "").replace(/\s+/g, " ").trim();
    }

    private extractTitleAndDate(payload: string): { title: string, date: string | null } {
        const onInAtPattern = /(.*) (?:on|in|at) (.*)/i;
        const match = payload.match(onInAtPattern);

        if (match) {
            const title = match[1].trim();
            const dateStr = match[2].trim();
            const date = this.parseDate(dateStr);
            if (date) return { title, date };
        }
        return { title: payload.trim(), date: null };
    }

    private extractRepeat(payload: string): string | null {
        const lower = payload.toLowerCase();
        if (lower.includes("every week") || lower.includes("weekly")) return "WEEKLY";
        if (lower.includes("every month") || lower.includes("monthly")) return "MONTHLY";
        if (lower.includes("every year") || lower.includes("yearly")) return "YEARLY";
        if (lower.includes("no repeat") || lower.includes("once")) return "NEVER";
        return null;
    }

    public parseDate(text: string): string | null {
        const lower = text.toLowerCase();
        const now = new Date();

        if (lower.includes("tomorrow")) {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            return d.toISOString().split('T')[0];
        }
        if (lower.includes("today")) return now.toISOString().split('T')[0];

        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        for (let i = 0; i < days.length; i++) {
            if (lower.includes(days[i])) {
                const d = new Date();
                const dayOffset = (i - d.getDay() + 7) % 7 || 7;
                d.setDate(d.getDate() + dayOffset);
                if (lower.includes("next")) d.setDate(d.getDate() + 7);
                return d.toISOString().split('T')[0];
            }
        }

        return null;
    }

    private parseDurationToSeconds(text: string): number {
        const normalized = text.toLowerCase()
            .replace(/an hour and a half/g, "90 minutes")
            .replace(/half an hour/g, "30 minutes")
            .replace(/an hour/g, "1 hour")
            .replace(/a minute/g, "1 minute");

        const regex = /(\d+|one|two|three|four|five|six|seven|eight|nine|ten|a|an|half)\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)/gi;
        let totalSeconds = 0;
        let match;
        while ((match = regex.exec(normalized)) !== null) {
            const amountStr = match[1];
            const unit = match[2].toLowerCase();

            const amount = amountStr === "half" ? 0.5 : (parseInt(amountStr) || this.wordToNumber(amountStr) || 0);
            const multiplier = unit.startsWith("hour") || unit.startsWith("hr") ? 3600 : (unit.startsWith("minute") || unit.startsWith("min") ? 60 : 1);
            totalSeconds += amount * multiplier;
        }
        return totalSeconds;
    }

    private wordToNumber(word: string): number | null {
        const map: Record<string, number> = { "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10, "a": 1, "an": 1 };
        return map[word.toLowerCase()] ?? null;
    }

    private parseTime(timeStr: string): { hour: number, minute: number } | null {
        const normalized = timeStr.trim().toLowerCase().replace(/\s+/g, " ").replace(/([ap])\.?m\.?/g, "$1m");

        const fullTime = normalized.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/);
        if (fullTime) {
            let hour = parseInt(fullTime[1]);
            const minute = parseInt(fullTime[2]);
            const marker = fullTime[3];
            if (marker === "pm" && hour < 12) hour += 12;
            if (marker === "am" && hour === 12) hour = 0;
            return { hour, minute };
        }

        const simpleTime = normalized.match(/(\d{1,2})\s*(am|pm)/);
        if (simpleTime) {
            let hour = parseInt(simpleTime[1]);
            const marker = simpleTime[2];
            if (marker === "pm" && hour < 12) hour += 12;
            if (marker === "am" && hour === 12) hour = 0;
            return { hour, minute: 0 };
        }

        return null;
    }
}
