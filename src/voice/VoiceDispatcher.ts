import { IntentParser, VoiceCommandType, VoiceCommand } from "./IntentParser";
import { actionsContainer, SetAlarmsAction, SetTimerAction, SetSettingsAction, ClearAllAlarmsAction, DisableAllAlarmsAction, SetSettingsToDefaultAction } from "@api/actions/ActionsContainer";
import { progressEvents } from "@api/ProgressEvents";
import GShockAPI from "@api/GShockAPI";
import { speechFeedback } from "./VoiceSpeechFeedback";
import { voiceCommandManager } from "./VoiceCommandManager";
import { voiceAudioAlerts } from "./VoiceAudioAlerts";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { WatchFeatureManager, FeatureId } from "@/utils/WatchFeatureManager";

dayjs.extend(customParseFormat);

export type VoiceState = 'idle' | 'listening' | 'reminder_title' | 'reminder_date' | 'reminder_repeat';

export class VoiceDispatcher {
    private intentParser = new IntentParser();
    private currentReminder: any = null;
    private abandonKeywords = ["cancel", "stop", "abandon", "abort", "forget it"];
    private isProcessing = false;
    private isVerbose = true;

    private onStateChange?: (state: VoiceState, transcript: string, feedback: string) => void;

    constructor() {
        this.initEventListeners();
    }

    private initEventListeners() {
        progressEvents.runEventActions('VoiceDispatcher', [
            {
                label: 'Disconnected',
                action: () => {
                    if (voiceCommandManager.isSupported()) {
                        voiceCommandManager.stopListening();
                    }
                    this.currentReminder = null;
                    this.isProcessing = false;
                    this.updateUI('idle', '', 'Disconnected');
                }
            }
        ]);
    }

    public setOnStateChange(callback: (state: VoiceState, transcript: string, feedback: string) => void) {
        this.onStateChange = callback;
    }

    private updateUI(state: VoiceState, transcript = '', feedback = '') {
        this.onStateChange?.(state, transcript, feedback);
    }

    public start(isVerbose: boolean = true) {
        this.currentReminder = null;
        this.isProcessing = false;
        this.isVerbose = isVerbose;
        this.listen('listening');
    }

    public stop() {
        voiceCommandManager.stopListening();
        this.isProcessing = false;
        this.updateUI('idle', '', 'Canceled');
        speechFeedback.speak('Canceled');
    }

    private listen(nextStep: VoiceState) {
        const prompt = nextStep === 'listening' ? "Tell me what to do or say 'Help'" :
                      nextStep === 'reminder_title' ? "What is the reminder for?" :
                      nextStep === 'reminder_date' ? "When do you want to be reminded?" :
                      nextStep === 'reminder_repeat' ? "Should this repeat weekly, monthly, or yearly? Or say no." : "";

        this.updateUI(nextStep, '', '');
        this.isProcessing = false;

        const runRecognition = async () => {
            if (!this.isVerbose && nextStep === 'listening') {
                await voiceAudioAlerts.playDing();
            }

            voiceCommandManager.startListening(
                (text, isFinal) => {
                    this.updateUI(nextStep, text, '');
                    if (isFinal && !this.isProcessing) {
                        this.isProcessing = true;
                        this.dispatch(text.toLowerCase(), nextStep);
                    }
                },
                (error) => {
                    if (error === 'not-allowed') {
                        const msg = 'Microphone access denied. Please enable it in browser settings.';
                        this.updateUI('idle', '', msg);
                        speechFeedback.speak(msg);
                    } else if (error === 'no-speech') {
                        this.updateUI('idle', '', 'Listening timed out.');
                    } else {
                        const msg = 'Command not understood';
                        this.updateUI('idle', '', msg);
                        speechFeedback.speak(msg);
                    }
                    this.isProcessing = false;
                },
                () => {
                    // onEnd logic if needed
                }
            );
        };

        if (this.isVerbose || nextStep !== 'listening') {
            speechFeedback.speak(prompt, runRecognition);
        } else {
            voiceAudioAlerts.playDing();
            this.updateUI(nextStep, '', prompt);
            runRecognition();
        }
    }

    private async dispatch(text: string, currentStep: VoiceState) {
        if (this.abandonKeywords.some(kw => text.includes(kw))) {
            this.stop();
            return;
        }

        if (currentStep === 'reminder_title') {
            this.currentReminder = { title: text };
            this.listen('reminder_date');
            return;
        }

        if (currentStep === 'reminder_date') {
            const dateInfo = this.intentParser.parseDate(text);
            this.currentReminder.date = dateInfo;
            this.listen('reminder_repeat');
            return;
        }

        if (currentStep === 'reminder_repeat') {
            let repeat: any = 'NEVER';
            if (text.includes('weekly')) repeat = 'WEEKLY';
            else if (text.includes('monthly')) repeat = 'MONTHLY';
            else if (text.includes('yearly')) repeat = 'YEARLY';

            await this.finalizeReminder(this.currentReminder.title, this.currentReminder.date, repeat);
            this.currentReminder = null;
            return;
        }

        const command = this.intentParser.parse(text);
        if (!command) {
            this.updateUI('idle', text, 'Command not understood');
            speechFeedback.speak('Command not understood');
            this.isProcessing = false;
            return;
        }

        if (command.type === VoiceCommandType.HELP) {
            const helpText = "You can send commands to your watch using natural language. For example, 'Set alarm at 7:30 am' or 'Set alarm 3 hours from now', or even 'Wake me up in 2 hours', or, 'Disable all alarms'. For reminders, you can say 'Set reminder' and the app will interactively ask you about the details. When asked when, you can say something like 'Next Tuesday' or 'A week Monday'. You can also say 'Set timer to 4 minutes and 10 seconds', 'Set auto light', 'Set language to Spanish', 'Set settings to default', and so on. To abort a voice command, just say 'Cancel, abort, or stop'.";
            this.updateUI('idle', text, 'Showing help.');
            speechFeedback.speak(helpText, () => {
                this.listen('listening');
            });
            return;
        }

        if (command.type === VoiceCommandType.ADD_REMINDER) {
            if (!WatchFeatureManager.isFeatureSupported('actions.reminders')) {
                this.handleUnsupportedFeature();
                return;
            }

            if (command.params.title) {
                this.currentReminder = { title: command.params.title };
                this.listen('reminder_date');
            } else {
                this.listen('reminder_title');
            }
            return;
        }

        await this.executeCommand(command);
    }

    private handleUnsupportedFeature() {
        const msg = "Feature not supported";
        this.updateUI('idle', '', msg);
        speechFeedback.speak(msg);
        this.isProcessing = false;
    }

    private async executeCommand(command: VoiceCommand) {
        try {
            let action;
            let feedback = '';

            switch (command.type) {
                case VoiceCommandType.SET_ALARM:
                    action = actionsContainer.getAction(SetAlarmsAction);
                    action.alarmHour = command.params.hour;
                    action.alarmMinute = command.params.minute;
                    feedback = `Alarm set for ${command.params.feedback}`;
                    break;
                case VoiceCommandType.SET_TIMER:
                    action = actionsContainer.getAction(SetTimerAction);
                    action.timerValueS = command.params.totalSeconds;
                    feedback = `Timer set for ${command.params.durationStr}`;
                    break;
                case VoiceCommandType.SET_SETTING:
                    const settingName = command.params.name;
                    let featureId: FeatureId | null = null;
                    if (settingName === "auto light") featureId = "light.auto_light";
                    if (settingName === "power saving") featureId = "settings.power_saving";

                    if (featureId && !WatchFeatureManager.isFeatureSupported(featureId)) {
                        this.handleUnsupportedFeature();
                        return;
                    }

                    action = actionsContainer.getAction(SetSettingsAction);
                    action.settingName = settingName;
                    action.settingValue = command.params.value;
                    const isBool = command.params.value === "true" || command.params.value === "false";
                    const valStr = isBool ? (command.params.value === "true" ? "enabled" : "disabled") : `to ${command.params.value}`;
                    feedback = `${command.params.name} ${valStr}`;
                    break;
                case VoiceCommandType.CLEAR_ALL_ALARMS:
                    action = actionsContainer.getAction(ClearAllAlarmsAction);
                    feedback = 'All alarms cleared';
                    break;
                case VoiceCommandType.DISABLE_ALL_ALARMS:
                    action = actionsContainer.getAction(DisableAllAlarmsAction);
                    feedback = 'All alarms disabled';
                    break;
                case VoiceCommandType.SET_SETTINGS_TO_DEFAULT:
                    action = actionsContainer.getAction(SetSettingsToDefaultAction);
                    feedback = 'Settings reset to defaults';
                    break;
            }

            if (action) {
                await action.run();
                this.updateUI('idle', '', feedback);
                speechFeedback.speak(feedback);
                progressEvents.onNext('NeedToUpdateUI');
            }
        } catch (e) {
            console.error("Error executing voice command", e);
            this.updateUI('idle', '', 'Command failed');
            speechFeedback.speak('Command failed');
        } finally {
            this.isProcessing = false;
        }
    }

    private async finalizeReminder(title: string, dateInfo: any, repeat: string) {
        try {
            console.log("Finalizing reminder:", title, dateInfo, repeat);

            let eventIndex = -1;
            let targetEvent = null;

            // Find the first empty slot by checking one by one (will stop early)
            for (let i = 1; i <= 5; i++) {
                const e = await GShockAPI.getEventFromWatch(i);
                if (!e.title?.trim()) {
                    eventIndex = i - 1;
                    targetEvent = e;
                    break;
                }
            }

            // Fallback: If no empty slots, overwrite the first one
            if (eventIndex === -1) {
                eventIndex = 0;
                targetEvent = await GShockAPI.getEventFromWatch(1);
            }

            const date = { year: dateInfo.year, month: dateInfo.month, day: dateInfo.day };
            const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

            // Dayjs parsing is case-sensitive for MMMM
            const monthTitleCase = date.month.charAt(0) + date.month.slice(1).toLowerCase();
            const dateStr = `${date.year}-${monthTitleCase}-${date.day}`;
            const djsDate = dayjs(dateStr, "YYYY-MMMM-D");

            if (!djsDate.isValid()) {
                throw new Error(`Invalid date calculated: ${dateStr}`);
            }

            const dayOfWeek = dayNames[djsDate.day()];

            const updatedEvent = {
                ...targetEvent,
                title: title,
                startDate: date,
                endDate: date, // Default to startDate to match Kotlin logic
                enabled: true,
                repeatPeriod: repeat as any,
                daysOfWeek: repeat === "WEEKLY" ? [dayOfWeek as any] : []
            };

            console.log(`Saving optimized event to watch slot ${eventIndex + 1}:`, updatedEvent);
            await GShockAPI.setEvent(eventIndex, updatedEvent);

            const msg = `${title} added ${dateInfo.feedback}`;
            this.updateUI('idle', '', msg);
            speechFeedback.speak(msg);
            progressEvents.onNext('NeedToUpdateUI');
        } catch (e) {
            console.error("Error finalizing reminder:", e);
            this.updateUI('idle', '', 'Failed to add reminder');
            speechFeedback.speak('Failed to add reminder');
        } finally {
            this.isProcessing = false;
        }
    }
}

export const voiceDispatcher = new VoiceDispatcher();
