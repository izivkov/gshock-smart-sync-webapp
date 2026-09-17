import { IntentParser, VoiceCommandType, VoiceCommand } from "./IntentParser";
import { actionsContainer, SetAlarmsAction, SetTimerAction, SetSettingsAction, ClearAllAlarmsAction, DisableAllAlarmsAction, SetSettingsToDefaultAction } from "@api/actions/ActionsContainer";
import { progressEvents } from "@api/ProgressEvents";
import GShockAPI from "@api/GShockAPI";

export class VoiceDispatcher {
    private intentParser = new IntentParser();
    private currentReminder: any = null;

    private abandonKeywords = ["cancel", "stop", "abandon", "abort", "forget it"];

    constructor(private onListenAgain: () => void) {}

    dispatch(text: string) {
        console.log(`Voice command received: '${text}'`);

        const lowerText = text.toLowerCase();
        if (this.abandonKeywords.some(kw => lowerText.includes(kw))) {
            this.currentReminder = null;
            this.speak("Canceled");
            return;
        }

        if (this.currentReminder) {
            this.handleReminderConversation(text);
            return;
        }

        const command = this.intentParser.parse(text);
        if (!command) {
            this.speak("Command not understood");
            return;
        }

        if (command.type === VoiceCommandType.HELP) {
            const helpText = "You can send commands to your watch using natural language. " +
                "For example, 'Set alarm at 7:30 am', 'Disable all alarms', or 'Set timer to 5 minutes'. " +
                "For reminders, say 'Set reminder' and I will ask you for details. " +
                "You can also say 'Set auto light', 'Set language to Spanish', and more.";
            this.speak(helpText, () => this.onListenAgain());
            return;
        }

        if (command.type === VoiceCommandType.ADD_REMINDER) {
            this.currentReminder = command.params;
            this.handleReminderConversation(""); // Start conversation
            return;
        }

        this.executeCommand(command);
    }

    private async executeCommand(command: VoiceCommand) {
        try {
            let action;
            switch (command.type) {
                case VoiceCommandType.SET_ALARM:
                    action = actionsContainer.getAction(SetAlarmsAction);
                    action.alarmHour = command.params.hour;
                    action.alarmMinute = command.params.minute;
                    break;
                case VoiceCommandType.SET_TIMER:
                    action = actionsContainer.getAction(SetTimerAction);
                    action.timerValueS = command.params.hours * 3600 + command.params.minutes * 60 + command.params.seconds;
                    break;
                case VoiceCommandType.SET_SETTING:
                    action = actionsContainer.getAction(SetSettingsAction);
                    action.settingName = command.params.name;
                    action.settingValue = command.params.value;
                    break;
                case VoiceCommandType.CLEAR_ALL_ALARMS:
                    action = actionsContainer.getAction(ClearAllAlarmsAction);
                    break;
                case VoiceCommandType.DISABLE_ALL_ALARMS:
                    action = actionsContainer.getAction(DisableAllAlarmsAction);
                    break;
                case VoiceCommandType.SET_SETTINGS_TO_DEFAULT:
                    action = actionsContainer.getAction(SetSettingsToDefaultAction);
                    break;
            }

            if (action) {
                await action.run();
                this.speak(this.getFeedbackText(command));
            }
        } catch (e) {
            console.error("Error executing voice command", e);
            this.speak("Command failed");
        }
    }

    private handleReminderConversation(text: string) {
        const reminder = this.currentReminder;

        if (!reminder.title) {
            if (text) {
                reminder.title = text;
                this.handleReminderConversation("");
            } else {
                this.speak("What is the reminder for?", () => this.onListenAgain());
            }
            return;
        }

        if (!reminder.startDate) {
            if (text) {
                const date = this.intentParser.parseDate(text);
                if (date) {
                    reminder.startDate = date;
                    this.handleReminderConversation("");
                } else {
                    this.speak("I didn't catch the date. When should I remind you?", () => this.onListenAgain());
                }
            } else {
                this.speak("When do you want to be reminded?", () => this.onListenAgain());
            }
            return;
        }

        if (!reminder.repeatPeriod) {
            if (text) {
                const lower = text.toLowerCase();
                let repeat = null;
                if (lower.includes("week") || lower.includes("weekly")) repeat = "WEEKLY";
                else if (lower.includes("month") || lower.includes("monthly")) repeat = "MONTHLY";
                else if (lower.includes("year") || lower.includes("yearly")) repeat = "YEARLY";
                else if (lower.includes("no") || lower.includes("never") || lower.includes("once")) repeat = "NEVER";

                if (repeat) {
                    reminder.repeatPeriod = repeat;
                    this.handleReminderConversation("");
                } else {
                    this.speak("Should this repeat weekly, monthly, or yearly? Or say no.", () => this.onListenAgain());
                }
            } else {
                this.speak("Should this repeat weekly, monthly, or yearly? Or say no.", () => this.onListenAgain());
            }
            return;
        }

        // Finalize
        this.finalizeReminder(reminder);
        this.currentReminder = null;
    }

    private async finalizeReminder(reminder: any) {
        try {
            const events = await GShockAPI.getEventsFromWatch();
            const foundIndex = events.findIndex(e => !e.title.trim());
            const eventIndex = foundIndex === -1 ? 0 : foundIndex;

            const dateParts = reminder.startDate.split('-').map(Number);
            const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
            const dayOfWeek = dayNames[date.getDay()];

            const newEvent = {
                title: reminder.title,
                startDate: { year: dateParts[0], month: this.intToMonthStr(dateParts[1]), day: dateParts[2] },
                endDate: { year: dateParts[0], month: this.intToMonthStr(dateParts[1]), day: dateParts[2] },
                repeatPeriod: reminder.repeatPeriod || "NEVER",
                daysOfWeek: reminder.repeatPeriod === "WEEKLY" ? [dayOfWeek] : [],
                enabled: true,
                incompatible: false
            };

            const updatedEvents = [...events];
            updatedEvents[eventIndex] = newEvent as any;
            await GShockAPI.setEvents(updatedEvents);

            let feedback = `${reminder.title} added for ${reminder.startDate}`;
            if (reminder.repeatPeriod && reminder.repeatPeriod !== "NEVER") {
                feedback += `, repeating ${reminder.repeatPeriod.toLowerCase()}`;
            }
            this.speak(feedback);
        } catch (e) {
            console.error("Error finalizing reminder", e);
            this.speak("Failed to add reminder");
        }
    }

    private getFeedbackText(command: VoiceCommand): string {
        switch (command.type) {
            case VoiceCommandType.SET_ALARM:
                return `Alarm set for ${command.params.hour}:${String(command.params.minute).padStart(2, '0')}`;
            case VoiceCommandType.SET_TIMER:
                return "Timer set";
            case VoiceCommandType.SET_SETTING:
                return `${command.params.name} updated`;
            case VoiceCommandType.CLEAR_ALL_ALARMS:
                return "All alarms cleared";
            case VoiceCommandType.DISABLE_ALL_ALARMS:
                return "All alarms disabled";
            case VoiceCommandType.SET_SETTINGS_TO_DEFAULT:
                return "Settings reset to default";
            default:
                return "Command completed";
        }
    }

    private intToMonthStr(monthInt: number): string {
        return ["", "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"][monthInt];
    }

    public speak(text: string, onEnd?: () => void) {
        if (!window.speechSynthesis) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        if (onEnd) {
            utterance.onend = onEnd;
        }
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);

        progressEvents.onNext("VoiceFeedback", text);
    }
}
