import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from 'react';
import { Box, Typography, Button, Snackbar, Alert, Stack, IconButton, Collapse, List, ListItem, ListItemText } from '@mui/material';
import WatchIcon from '@mui/icons-material/Watch';
import TimerIcon from '@mui/icons-material/Timer';
import PublicIcon from '@mui/icons-material/Public';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import SendIcon from '@mui/icons-material/Send';
import BluetoothConnectedIcon from '@mui/icons-material/BluetoothConnected';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import CloseIcon from '@mui/icons-material/Close';
import TimerInput from './TimerInput';
import StepCounterView from './StepCounterView';
import BatteryLevel from './BatteryLevel';
import DigitalClock from '../components/DigitalClock';
import GShockAPI from '@/api/GShockAPI';
import { StepCounterData } from '@model/StepCounterData';
import { ConnectionContext } from '@/App';
import { progressEvents } from '@/api/ProgressEvents';
import ScreenTitle from '../components/ScreenTitle';
import PeachCard from '../components/PeachCard';
import { WatchFeature, useWatchFeatures } from '../components/WatchFeature';
import { WatchFeatureManager } from '@/utils/WatchFeatureManager';
import { getSmartDefaultsForSettings } from '../settings/smartDefaults';
import { monthType } from '../reminders/ReminderData';
import {
    formatHomeTimeForDisplay,
    formatTemperatureFromCelsius,
    isNorthAmerica12HourClock,
    useFahrenheitForTemperature,
} from '@/utils/localeDisplay';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);

const BOTTOM_NAV_HEIGHT = '80px';

// --- Voice Recognition & Synthesis Helpers ---

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const speak = (text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) {
        onEnd?.();
        return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';
    if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
    }
    window.speechSynthesis.speak(utterance);
};

function handleSelfCorrection(text: string): string {
    const markers = ["i mean", "actually", "no wait"];
    for (const marker of markers) {
        const index = text.toLowerCase().lastIndexOf(marker);
        if (index !== -1) {
            return text.substring(index + marker.length).trim();
        }
    }
    return text;
}

function stripFillers(text: string): string {
    const fillers = ["um", "uh", "ah", "like", "so", "well"];
    let cleaned = text.toLowerCase();
    fillers.forEach(f => {
        cleaned = cleaned.replace(new RegExp(`\\b${f}\\b`, 'g'), '');
    });
    return cleaned.replace(/\s+/g, ' ').trim();
}

function parseSpokenNumber(text: string): number {
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

const timerUnitPattern = /(\d+|one|two|three|four|five|six|seven|eight|nine|ten|a|an|half)\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)/gi;
const implicitTimerPattern = /timer.*?(?:at|for|to)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)[:\s]+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i;

function parseDurationToSeconds(text: string): number {
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

    const matches = Array.from(normalized.matchAll(timerUnitPattern));
    if (matches.length === 0) return 0;

    let totalSeconds = 0;
    for (const match of matches) {
        const amountStr = match[1];
        const unit = match[2].toLowerCase();

        const amount = parseSpokenNumber(amountStr);
        const multiplier = (unit.startsWith("hour") || unit.startsWith("hr")) ? 3600 :
                          (unit.startsWith("minute") || unit.startsWith("min")) ? 60 : 1;

        totalSeconds += Math.floor(amount * multiplier);
    }
    return totalSeconds;
}

function parseTime(timeStr: string) {
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

        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
            return { hour, minute };
        }
    }

    const simpleTimeRegex = /(\d{1,2})\s*(am|pm)/i;
    const simpleMatch = normalized.match(simpleTimeRegex);
    if (simpleMatch) {
        let hour = parseInt(simpleMatch[1], 10);
        const marker = simpleMatch[2];

        if (marker === "pm" && hour < 12) hour += 12;
        if (marker === "am" && hour === 12) hour = 0;

        if (hour >= 0 && hour <= 23) {
            return { hour, minute: 0 };
        }
    }

    // Try parsing as simple numbers if they look like hours
    const digitOnlyMatch = normalized.match(/^(\d{1,2})$/);
    if (digitOnlyMatch) {
        const hour = parseInt(digitOnlyMatch[1], 10);
        if (hour >= 0 && hour <= 23) return { hour, minute: 0 };
    }

    return null;
}

function parseSpokenAlarmTime(text: string) {
    // This is now a wrapper around the more robust logic
    const time = parseTime(text);
    if (time) {
        const { hour, minute } = time;
        return { hour, minute, isRelative: false, feedback: `${hour % 12 || 12}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}` };
    }

    const durationSeconds = parseDurationToSeconds(text);
    if (durationSeconds > 0) {
        const target = dayjs().add(durationSeconds, 'second');
        return {
            hour: target.hour(),
            minute: target.minute(),
            isRelative: true,
            feedback: `in ${Math.floor(durationSeconds/3600) || ''} ${durationSeconds >= 3600 ? 'hours ' : ''}${Math.floor((durationSeconds%3600)/60) || ''} ${durationSeconds%3600 >= 60 ? 'minutes' : ''}`.replace(/\s+/g, ' ').trim() + ' from now'
        };
    }

    return null;
}

function parseSpokenDate(text: string) {
    const lower = text.toLowerCase();
    const today = dayjs().startOf('day');
    let target = today;
    let feedback = '';

    const daysOfWeekMap: Record<string, number> = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
    };

    // 1. "X weeks from [next] [Day]"
    const weeksFromPattern = /(an?|\d+|one|two|three|four|five|six|seven|eight|nine|ten)?\s*weeks?\s*(?:from\s+)?(next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i;
    const weeksMatch = lower.match(weeksFromPattern);
    if (weeksMatch) {
        const count = weeksMatch[1] ? parseSpokenNumber(weeksMatch[1]) : 1;
        const isNext = !!weeksMatch[2];
        const dayName = weeksMatch[3].toLowerCase();
        const targetDay = daysOfWeekMap[dayName];

        let d = dayjs().day(targetDay);
        if (d.isBefore(today, 'day')) d = d.add(1, 'week');

        if (isNext) d = d.add(1, 'week');
        target = d.add(count, 'week');
        feedback = `${count} week${count > 1 ? 's' : ''} from ${isNext ? 'next ' : ''}${dayName}`;
    }
    // 2. "[next] [Day]"
    else {
        let foundDay = false;
        for (const [name, dayNum] of Object.entries(daysOfWeekMap)) {
            if (lower.includes(name)) {
                let d = dayjs().day(dayNum);
                const isNext = lower.includes('next');

                if (d.isBefore(today, 'day')) {
                    d = d.add(1, 'week');
                }

                if (isNext) {
                    if (d.isSame(today, 'day')) {
                        d = d.add(1, 'week');
                    } else {
                        // In Kotlin: if today is Monday, "next Tuesday" -> upcoming Tuesday.
                        // TemporalAdjusters.next(day) moves strictly to future.
                        // My 'd' is already nextOrSame.
                        // If it's strictly in the future, 'next' usually doesn't add another week in common speech
                        // unless it's "next week's Monday".
                        // But let's follow Kotlin: d = today.with(nextOrSame(day)); if (isNext) d = d.plusWeeks(1) if target == today.
                    }
                }

                target = d;
                feedback = `${isNext ? 'next ' : ''}${name}`;
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

    return {
        year: target.year(),
        month: monthNames[target.month()],
        day: target.date(),
        feedback
    };
}

type VoiceStep = 'idle' | 'listening' | 'reminder_title' | 'reminder_date' | 'reminder_repeat';

const VoiceControlPanel: React.FC<{ isConnected: boolean }> = ({ isConnected }) => {
    const [step, setStep] = useState<VoiceStep>('idle');
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState('');
    const [showHelp, setShowHelp] = useState(false);
    const [hasMic, setHasMic] = useState<boolean | null>(null);
    const [isPermissionDenied, setIsPermissionDenied] = useState(false);
    const recognitionRef = useRef<any>(null);
    const reminderData = useRef<{ title: string, date: any }>({ title: '', date: null });

    useEffect(() => {
        async function checkHardware() {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const micExists = devices.some(device => device.kind === 'audioinput');
                setHasMic(micExists);
            } catch (e) {
                setHasMic(false);
            }
        }
        checkHardware();

        if (navigator.permissions && (navigator.permissions as any).query) {
            (navigator.permissions as any).query({ name: 'microphone' }).then((result: any) => {
                setIsPermissionDenied(result.state === 'denied');
                result.onchange = () => {
                    setIsPermissionDenied(result.state === 'denied');
                };
            }).catch(() => {});
        }
    }, []);

    const stopListening = useCallback((silent = false) => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = null;
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        if (!silent && step !== 'idle') {
            setFeedback('Canceled');
            speak('Canceled');
        }
        setStep('idle');
    }, [step]);

    const startListening = useCallback((nextStep: VoiceStep = 'listening') => {
        if (!SpeechRecognition) return;
        if (recognitionRef.current) {
            recognitionRef.current.onend = null;
            recognitionRef.current.onresult = null;
            recognitionRef.current.onerror = null;
            try { recognitionRef.current.stop(); } catch(e) {}
        }

        setStep(nextStep);
        setTranscript('');
        setFeedback('');

        const prompt = nextStep === 'listening' ? "Tell me what to do." :
                      nextStep === 'reminder_title' ? "What is the reminder for?" :
                      nextStep === 'reminder_date' ? "When do you want to be reminded?" :
                      nextStep === 'reminder_repeat' ? "Should this repeat weekly, monthly, or yearly? Or say no." : "";

        const runRecognition = () => {
            // Guard: don't start if we've already transitioned or if component unmounted
            if (recognitionRef.current && recognitionRef.current.active) return;

            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.interimResults = true;
            rec.lang = 'en-US';

            rec.onresult = (event: any) => {
                let current = event.results[event.resultIndex][0].transcript;
                current = handleSelfCorrection(current);
                setTranscript(current);
                if (event.results[event.resultIndex].isFinal) {
                    // Stop further results for this session
                    rec.onresult = null;
                    handleCommand(current.toLowerCase(), nextStep);
                }
            };

            rec.onerror = (event: any) => {
                console.warn('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    setIsPermissionDenied(true);
                    const msg = 'Microphone access denied. Please enable it in browser settings.';
                    setFeedback(msg);
                    speak(msg);
                    setStep('idle');
                } else if (event.error === 'no-speech') {
                    setFeedback('Listening timed out.');
                    setStep('idle');
                } else {
                    const msg = 'Command not understood';
                    setFeedback(msg);
                    speak(msg);
                    setStep('idle');
                }
            };

            rec.onend = () => {
                if (nextStep === 'listening') setStep('idle');
            };

            try {
                rec.start();
                recognitionRef.current = rec;
            } catch (e) {
                console.error("Recognition start failed", e);
            }
        };

        if (prompt) {
            speak(prompt, runRecognition);
        } else {
            runRecognition();
        }
    }, [step]);

    const handleCommand = async (rawText: string, currentStep: VoiceStep) => {
        const text = stripFillers(rawText);

        if (text.includes('cancel') || text.includes('abort') || text.includes('stop')) {
            setFeedback('Canceled');
            speak('Canceled');
            setStep('idle');
            return;
        }

        if (text.includes('help')) {
            const helpText = "You can send commands to your watch using natural language. For example, 'Set alarm at 7:30 am' or 'Set alarm 3 hours from now', or even 'Wake me up in 2 hours', or, 'Disable all alarms'. For reminders, you can say 'Set reminder' and the app will interactively ask you about the details. When asked when, you can say something like 'Next Tuesday' or 'A week Monday'. You can also say 'Set timer to 4 minutes and 10 seconds', 'Set auto light', 'Set language to Spanish', 'Set settings to default', and so on. To abort a voice command, just say 'Cancel, abort, or stop'.";
            setShowHelp(true);
            speak(helpText, () => {
                startListening('listening');
            });
            return;
        }

        if (currentStep === 'reminder_title') {
            reminderData.current.title = text;
            startListening('reminder_date');
            return;
        }

        if (currentStep === 'reminder_date') {
            const dateInfo = parseSpokenDate(text);
            reminderData.current.date = dateInfo;
            startListening('reminder_repeat');
            return;
        }

        if (currentStep === 'reminder_repeat') {
            let repeat: any = 'NEVER';
            if (text.includes('weekly')) repeat = 'WEEKLY';
            else if (text.includes('monthly')) repeat = 'MONTHLY';
            else if (text.includes('yearly')) repeat = 'YEARLY';

            try {
                const events = await GShockAPI.getEventsFromWatch();
                const newEvents = [...events];
                newEvents[0] = {
                    ...newEvents[0],
                    title: reminderData.current.title,
                    startDate: reminderData.current.date,
                    enabled: true,
                    repeatPeriod: repeat
                };
                await GShockAPI.setEvents(newEvents);
                const msg = `${reminderData.current.title} added ${reminderData.current.date.feedback}`;
                setFeedback(msg);
                speak(msg);
                progressEvents.onNext('NeedToUpdateUI');
            } catch (e) {
                const msg = 'Failed to add reminder';
                setFeedback(msg);
                speak(msg);
            }
            setStep('idle');
            return;
        }

        // Main commands
        if (text.includes('timer')) {
            const hMatch = text.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*hour/);
            const mMatch = text.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*minute/);
            const sMatch = text.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*second/);

            const hours = hMatch ? parseSpokenNumber(hMatch[1]) : 0;
            const minutes = mMatch ? parseSpokenNumber(mMatch[1]) : 0;
            const seconds = sMatch ? parseSpokenNumber(sMatch[1]) : 0;

            let totalSeconds = hours * 3600 + minutes * 60 + seconds;
            let durationParts = [];
            if (hours > 0) durationParts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
            if (minutes > 0) durationParts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
            if (seconds > 0) durationParts.push(`${seconds} second${seconds > 1 ? 's' : ''}`);
            let durationStr = durationParts.join(' and ');

            if (totalSeconds === 0) {
                // Slower implicit regex: "timer 4 10" or "timer at 4 10"
                const implicitMatch = text.match(/timer.*?(?:at|for|to)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*[:\s]+\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i);
                if (implicitMatch) {
                    const m = parseSpokenNumber(implicitMatch[1]);
                    const s = parseSpokenNumber(implicitMatch[2]);
                    totalSeconds = m * 60 + s;
                    durationStr = `${m} minutes and ${s} seconds`;
                }
            }

            if (totalSeconds > 0) {
                await GShockAPI.setTimer(totalSeconds);
                const msg = `Timer set for ${durationStr}`;
                setFeedback(msg);
                speak(msg);
                progressEvents.onNext('NeedToUpdateUI');
            } else {
                const msg = 'Command not understood';
                setFeedback(msg);
                speak(msg);
            }
        } else if (text.includes('disable all alarms') || text.includes('turn off all alarms')) {
            const alarms = await GShockAPI.getAlarms();
            alarms.forEach(a => a.enabled = false);
            await GShockAPI.setAlarms(alarms);
            const msg = 'All alarms disabled';
            setFeedback(msg);
            speak(msg);
            progressEvents.onNext('NeedToUpdateUI');
        } else if (text.includes('clear all alarms')) {
            const alarms = await GShockAPI.getAlarms();
            alarms.forEach(a => { a.enabled = false; a.hour = 0; a.minute = 0; });
            await GShockAPI.setAlarms(alarms);
            const msg = 'All alarms cleared';
            setFeedback(msg);
            speak(msg);
            progressEvents.onNext('NeedToUpdateUI');
        } else if (text.includes('alarm') || text.includes('wake me up')) {
            let timeString = text;
            const patterns = [
                /(?:set|wake me up|create)(?: an?)? alarm (?:at|for|to|in) (.*)/i,
                /wake me up (?:at|in) (.*)/i,
                /alarm (?:at|for|to|in) (.*)/i
            ];
            for (const p of patterns) {
                const m = text.match(p);
                if (m) { timeString = m[1]; break; }
            }

            const res = parseSpokenAlarmTime(timeString);
            if (res) {
                const { hour, minute, feedback: timeStr } = res;
                const alarms = await GShockAPI.getAlarms();
                let slotIndex = alarms.findIndex(a => !a.enabled);
                if (slotIndex === -1) slotIndex = 0;
                alarms[slotIndex] = { ...alarms[slotIndex], hour, minute, enabled: true };
                await GShockAPI.setAlarms(alarms);
                const msg = `Alarm set for ${timeStr}`;
                setFeedback(msg);
                speak(msg);
                progressEvents.onNext('NeedToUpdateUI');
            } else {
                const msg = 'Command not understood';
                setFeedback(msg);
                speak(msg);
            }
        } else if (text.includes('auto light')) {
            const settings = await GShockAPI.getSettings();
            settings.autoLight = !text.includes('off') && !text.includes('disable');
            await GShockAPI.setSettings(settings);
            const msg = `Auto Light ${settings.autoLight ? 'enabled' : 'disabled'}`;
            setFeedback(msg);
            speak(msg);
            progressEvents.onNext('NeedToUpdateUI');
        } else if (text.includes('power saving')) {
            const settings = await GShockAPI.getSettings();
            settings.powerSavingMode = !text.includes('off') && !text.includes('disable');
            await GShockAPI.setSettings(settings);
            const msg = `Power Saving ${settings.powerSavingMode ? 'enabled' : 'disabled'}`;
            setFeedback(msg);
            speak(msg);
            progressEvents.onNext('NeedToUpdateUI');
        } else if (text.includes('button sound') || text.includes('button tone')) {
            const settings = await GShockAPI.getSettings();
            settings.buttonTone = !text.includes('off') && !text.includes('disable');
            await GShockAPI.setSettings(settings);
            const msg = `Button sound ${settings.buttonTone ? 'enabled' : 'disabled'}`;
            setFeedback(msg);
            speak(msg);
            progressEvents.onNext('NeedToUpdateUI');
        } else if (text.includes('language')) {
            const languages: any[] = ['English', 'Spanish', 'French', 'German', 'Italian', 'Russian'];
            let matched = '';
            for (const lang of languages) {
                if (text.includes(lang.toLowerCase())) { matched = lang; break; }
            }
            if (matched) {
                const settings = await GShockAPI.getSettings();
                settings.language = matched as any;
                await GShockAPI.setSettings(settings);
                const msg = `Language set to ${matched}`;
                setFeedback(msg);
                speak(msg);
                progressEvents.onNext('NeedToUpdateUI');
            } else {
                const msg = 'Command not understood';
                setFeedback(msg);
                speak(msg);
            }
        } else if (text.includes('disable all reminders') || text.includes('clear reminders')) {
            const events = await GShockAPI.getEventsFromWatch();
            events.forEach(e => e.enabled = false);
            await GShockAPI.setEvents(events);
            const msg = 'All reminders disabled';
            setFeedback(msg);
            speak(msg);
            progressEvents.onNext('NeedToUpdateUI');
        } else if (text.includes('reminder')) {
            startListening('reminder_title');
            return;
        } else if (text.includes('reset settings') || text.includes('apply defaults') || text.includes('settings to default')) {
            const current = await GShockAPI.getSettings();
            const patch = await getSmartDefaultsForSettings({
                autoLight: current.autoLight,
                buttonTone: current.buttonTone,
                dateFormat: current.dateFormat as any,
                language: current.language as any,
                lightDuration: current.lightDuration as any,
                powerSavingMode: current.powerSavingMode,
                timeAdjustment: current.timeAdjustment ?? true,
                timeFormat: current.timeFormat as any
            });
            await GShockAPI.setSettings({ ...current, ...patch });
            const msg = 'Settings reset to defaults';
            setFeedback(msg);
            speak(msg);
            progressEvents.onNext('NeedToUpdateUI');
        } else {
            const msg = 'Command not understood';
            setFeedback(msg);
            speak(msg);
        }
        setStep('idle');
    };

    if (!SpeechRecognition) return null;

    const micDisabled = !isConnected || hasMic === false;

    return (
        <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                {hasMic === false && (
                    <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 600, mr: 1 }}>
                        NO MIC FOUND
                    </Typography>
                )}
                {isPermissionDenied && (
                    <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 600, mr: 1 }}>
                        MIC BLOCKED
                    </Typography>
                )}
                <IconButton
                    size="small"
                    onClick={() => step === 'idle' ? startListening() : stopListening()}
                    sx={{ color: isPermissionDenied ? '#f44336' : step !== 'idle' ? '#f44336' : '#8B5E3C' }}
                    disabled={micDisabled}
                >
                    {step !== 'idle' ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
                </IconButton>
                <IconButton size="small" onClick={() => setShowHelp(!showHelp)} sx={{ color: '#8B5E3C' }}>
                    <HelpOutlineIcon fontSize="small" />
                </IconButton>
            </Box>

            <Collapse in={step !== 'idle' || !!feedback || showHelp || isPermissionDenied}>
                <Box sx={{
                    mt: 1, p: 1.5, borderRadius: '12px',
                    bgcolor: 'rgba(139, 94, 60, 0.05)',
                    border: '1px dashed rgba(139, 94, 60, 0.2)'
                }}>
                    {showHelp ? (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#8B5E3C' }}>VOICE COMMANDS</Typography>
                                <IconButton size="small" onClick={() => setShowHelp(false)}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>
                            </Box>
                            <List dense disablePadding>
                                {[
                                    '“Set alarm at 7:30 am”', '“Disable all alarms”',
                                    '“Set timer for 5 minutes”', '“Turn on auto light”',
                                    '“Disable power saving”', '“Create reminder”',
                                    '“Reset settings”'
                                ].map(cmd => (
                                    <ListItem key={cmd} disablePadding><ListItemText primary={cmd} primaryTypographyProps={{ fontSize: '0.75rem', color: '#7A5C44' }} /></ListItem>
                                ))}
                            </List>
                        </Box>
                    ) : (
                        <>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: (step !== 'idle' || isPermissionDenied) ? '#f44336' : '#8B5E3C', display: 'block', mb: 0.5 }}>
                                {isPermissionDenied ? 'MICROPHONE BLOCKED' :
                                 step === 'listening' ? 'LISTENING...' :
                                 step === 'reminder_title' ? 'SAY REMINDER TITLE...' :
                                 step === 'reminder_date' ? 'SAY START DATE (e.g. Oct 15)...' : 'READY'}
                            </Typography>
                            {isPermissionDenied && (
                                <Typography sx={{ fontSize: '0.75rem', color: '#7A5C44', mb: 1 }}>
                                    Please enable microphone access in your browser settings to use voice commands.
                                </Typography>
                            )}
                            {transcript && (
                                <Typography sx={{ fontSize: '0.85rem', color: '#2D1A0E', fontStyle: 'italic', mb: 1 }}>
                                    "{transcript}"
                                </Typography>
                            )}
                            {feedback && (
                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#8B5E3C' }}>
                                    {feedback}
                                </Typography>
                            )}
                        </>
                    )}
                </Box>
            </Collapse>
        </Box>
    );
};

const WatchNameCard: React.FC<{ isConnected: boolean, batteryLevel: number }> = ({ isConnected, batteryLevel }) => {
    const { getWatchName } = useWatchName();
    return (
        <PeachCard sx={{ p: 1.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: '8px',
                        bgcolor: 'rgba(139, 94, 60, 0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <WatchIcon sx={{ color: '#8B5E3C', fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, color: '#2D1A0E', fontSize: '0.95rem', lineHeight: 1 }}>
                            {getWatchName() || 'G-Shock'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                            <BluetoothConnectedIcon sx={{ fontSize: 10, color: isConnected ? '#4CAF50' : '#f44336' }} />
                            <Typography variant="caption" sx={{ color: isConnected ? '#4CAF50' : '#f44336', fontWeight: 600, fontSize: '0.65rem' }}>
                                {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <BatteryLevel level={batteryLevel} />
            </Box>
            <VoiceControlPanel isConnected={isConnected} />
        </PeachCard>
    );
};

const useWatchName = () => {
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        const actions = [
            { label: 'DeviceName', action: () => setRefresh(prev => prev + 1) },
            { label: 'Disconnect', action: () => setRefresh(prev => prev + 1) },
        ];

        progressEvents.runEventActions('WatchNameHook', actions);
        return () => progressEvents.stop('WatchNameHook');
    }, []);

    return {
        getWatchName: () => WatchFeatureManager.getWatchName(),
    };
};

const LocalTimeCard: React.FC<{ timeZone: string, onSync: () => void }> = ({ timeZone, onSync }) => (
    <PeachCard sx={{ p: 1.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#8B5E3C', textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
            Phone Time
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
                <DigitalClock size="medium" showSeconds={true} />
                <Typography sx={{ fontSize: '0.7rem', color: '#7A5C44', mt: 0.2 }}>
                    {timeZone.split('/').pop()?.replace('_', ' ')}
                </Typography>
            </Box>
            <Button
                variant="contained" size="small" onClick={onSync}
                startIcon={<SendIcon sx={{ fontSize: '0.9rem !important' }} />}
                sx={{ borderRadius: 100, px: 2, height: 32, textTransform: 'none', fontWeight: 600, boxShadow: '0 2px 8px rgba(139, 94, 60, 0.25)' }}
            >
                Send to Watch
            </Button>
        </Box>
    </PeachCard>
);

const TimerCard: React.FC<{ timerValue: { hours: number, minutes: number, seconds: number }, setTimerValue: React.Dispatch<React.SetStateAction<{ hours: number, minutes: number, seconds: number }>>, onSetTimer: () => void }> = ({ timerValue, setTimerValue, onSetTimer }) => (
    <PeachCard sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
            <TimerIcon sx={{ fontSize: 16, color: '#8B5E3C' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#8B5E3C', textTransform: 'uppercase' }}>
                Timer
            </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <TimerInput initialValue={timerValue} onUpdate={setTimerValue} />
            <Button
                variant="contained" size="small" onClick={onSetTimer}
                startIcon={<SendIcon sx={{ fontSize: '0.9rem !important' }} />}
                sx={{ borderRadius: 100, px: 2, height: 32, textTransform: 'none', fontWeight: 600, boxShadow: '0 2px 8px rgba(139, 94, 60, 0.25)' }}
            >
                Send to Watch
            </Button>
        </Box>
    </PeachCard>
);

const HomeTimeCard: React.FC<{ homeTime: string, use12HourClock: boolean }> = ({ homeTime, use12HourClock }) => (
    <PeachCard sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <PublicIcon sx={{ fontSize: 14, color: '#8B5E3C' }} />
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#8B5E3C', textTransform: 'uppercase' }}>
                Watch
            </Typography>
        </Box>
        <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#2D1A0E', fontFamily: 'monospace' }}>
            {formatHomeTimeForDisplay(homeTime || undefined, use12HourClock)}
        </Typography>
    </PeachCard>
);

const TemperatureCard: React.FC<{ tempShown: { text: string, unit: string } }> = ({ tempShown }) => (
    <PeachCard sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, justifyContent: 'flex-end', pr: 1.5 }}>
            <ThermostatIcon sx={{ fontSize: 14, color: '#8B5E3C' }} />
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#8B5E3C', textTransform: 'uppercase' }}>
                Temp
            </Typography>
        </Box>
        <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#2D1A0E', fontFamily: 'monospace', textAlign: 'right', pr: 1.5 }}>
            {tempShown.text}{tempShown.unit}
        </Typography>
    </PeachCard>
);

const Time: React.FC = () => {
    const { isConnected } = useContext(ConnectionContext);
    const { isFeatureSupported } = useWatchFeatures();
    const [timerValue, setTimerValue] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [homeTime, setHomeTime] = useState<string>("");
    const [batteryLevel, setBatteryLevel] = useState<number>(0);
    const [temperature, setTemperature] = useState<number>(0);
    const [stepData, setStepData] = useState<StepCounterData>(StepCounterData.unavailable());
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

    const refreshWatchData = useCallback(async () => {
        if (!isConnected) return;
        try {
            const timerSeconds = await GShockAPI.getTimer();
            setTimerValue({
                hours: Math.floor(timerSeconds / 3600),
                minutes: Math.floor((timerSeconds % 3600) / 60),
                seconds: timerSeconds % 60
            });
            const ht = await GShockAPI.getHomeTime();
            setHomeTime(ht);
            const temp = await GShockAPI.getWatchTemperature();
            setTemperature(temp);
            const level = await GShockAPI.getBatteryLevel();
            setBatteryLevel(level);
            if (isFeatureSupported('time.step_counter')) {
                const steps = await GShockAPI.getStepCount();
                setStepData(steps);
            }
        } catch (error) {
            console.error("Watch refresh failed:", error);
        }
    }, [isConnected]);

    useEffect(() => {
        refreshWatchData();
    }, [isConnected, refreshWatchData]);

    useEffect(() => {
        const actions = [
            { label: 'NeedToUpdateUI', action: refreshWatchData },
        ];
        progressEvents.runEventActions('TimePageRefresh', actions);
        return () => progressEvents.stop('TimePageRefresh');
    }, [refreshWatchData]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isConnected && isFeatureSupported('time.step_counter')) {
            interval = setInterval(async () => {
                try {
                    const data = await GShockAPI.getStepCount();
                    setStepData(data);
                } catch (e) {
                    console.error("Step polling failed", e);
                }
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isConnected, isFeatureSupported]);

    const handleSetTime = async () => {
        try {
            await GShockAPI.setTime();
            setSnackbarMessage('Time synced');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            progressEvents.onNext('NeedToUpdateUI');
        } catch (error) {
            setSnackbarMessage('Sync failed');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleSetTimer = async () => {
        try {
            const timeInSeconds = timerValue.hours * 3600 + timerValue.minutes * 60 + timerValue.seconds;
            await GShockAPI.setTimer(timeInSeconds);
            setSnackbarMessage('Timer set');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            progressEvents.onNext('NeedToUpdateUI');
        } catch (error) {
            setSnackbarMessage('Timer failed');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const use12HourClock = useMemo(() => isNorthAmerica12HourClock(), []);
    const fahrenheitTemp = useFahrenheitForTemperature();
    const tempShown = formatTemperatureFromCelsius(temperature, fahrenheitTemp);

    return (
        <Box sx={{
            width: '100%',
            height: { xs: '100dvh', md: '100%' },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.default',
            pb: { xs: BOTTOM_NAV_HEIGHT, md: 0 }
        }}>
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                px: { xs: 1.5, sm: 3, md: 4 },
                pt: 2,
                pb: 2
            }}>
                <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                    <ScreenTitle title="Time" />

                    <Stack spacing={1.5} sx={{ width: '100%' }}>
                        <WatchNameCard 
                            isConnected={isConnected}
                            batteryLevel={batteryLevel} 
                        />
                        
                        <LocalTimeCard 
                            timeZone={timeZone} 
                            onSync={handleSetTime} 
                        />
                        
                        <TimerCard 
                            timerValue={timerValue} 
                            setTimerValue={setTimerValue} 
                            onSetTimer={handleSetTimer} 
                        />

                        <WatchFeature id="time.step_counter">
                            <StepCounterView stepData={stepData} />
                        </WatchFeature>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                            <HomeTimeCard 
                                homeTime={homeTime} 
                                use12HourClock={use12HourClock} 
                            />

                            <WatchFeature id="time.temperature">
                                <TemperatureCard tempShown={tempShown} />
                            </WatchFeature>
                        </Box>
                    </Stack>
                </Box>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Time;
