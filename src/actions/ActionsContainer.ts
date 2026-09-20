import { Action, RunEnvironment, RunMode } from "./Action";
import GShockAPI from "@api/GShockAPI";
import Alarm from "@model/Alarm";
import { Settings } from "@model/Settings";
import { PhoneFinder } from "@pages/home/PhoneFinder";
import { watchInfo } from "@api/WatchInfo";
import TimeIO from "@io/TimeIO";
import AlarmsIO from "@io/AlarmsIO";
import SettingsIO from "@io/SettingsIO";
import TimeAdjustmentIO from "@io/TimeAdjustmentIO";
import TimerIO from "@io/TimerIO";
import EventsIO from "@io/EventsIO";

export { Action, RunEnvironment, RunMode };

export class SetTimeAction extends Action {
    constructor() {
        super("Set Time", true, RunMode.ASYNC);
    }

    async run() {
        console.log("Running SetTimeAction");
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        await TimeIO.setTimezone(timeZone);
        await watchInfo.protocol!.setTime();
    }

    shouldRun(runEnvironment: RunEnvironment): boolean {
        return runEnvironment === RunEnvironment.AUTO_TIME_ADJUSTMENT ||
               runEnvironment === RunEnvironment.ACTION_BUTTON_PRESSED ||
               runEnvironment === RunEnvironment.VOICE_COMMAND;
    }
}

export class SetRemindersAction extends Action {
    constructor() {
        super("Set Reminders", true, RunMode.ASYNC);
    }

    async run(payload?: any[]) {
        console.log("Running SetRemindersAction");
        const reminders = payload || await GShockAPI.getEventsFromWatch();
        await EventsIO.setEvents(reminders);
    }

    shouldRun(runEnvironment: RunEnvironment): boolean {
        const supported = watchInfo.hasReminders;
        return (runEnvironment === RunEnvironment.VOICE_COMMAND ||
                runEnvironment === RunEnvironment.DIRECT_INVOCATION) && supported;
    }
}

export class SetAlarmsAction extends Action {
    public alarmHour: number = 8;
    public alarmMinute: number = 0;

    constructor() {
        super("Set Alarms", true, RunMode.ASYNC);
    }

    async run(payload?: Alarm[]) {
        console.log("Running SetAlarmsAction");
        if (payload) {
            await AlarmsIO.set(payload);
        } else {
            // Voice command path: upsert one alarm
            const alarms = await GShockAPI.getAlarms();
            const alarmCount = watchInfo.alarmCount;
            const alarmList = [...alarms].slice(0, alarmCount);

            const existingIndex = alarmList.findIndex(a => a.hour === this.alarmHour && a.minute === this.alarmMinute);
            if (existingIndex !== -1) {
                alarmList[existingIndex] = { ...alarmList[existingIndex], enabled: true };
            } else {
                const indexToUpdate = alarmList.findIndex(a => !a.enabled);
                const targetIndex = indexToUpdate === -1 ? 0 : indexToUpdate;
                alarmList[targetIndex] = {
                    ...alarmList[targetIndex],
                    hour: this.alarmHour,
                    minute: this.alarmMinute,
                    enabled: true,
                };
            }
            await AlarmsIO.set(alarmList);
        }
    }

    shouldRun(runEnvironment: RunEnvironment): boolean {
        return runEnvironment === RunEnvironment.VOICE_COMMAND ||
               runEnvironment === RunEnvironment.DIRECT_INVOCATION;
    }
}

export class ClearAllAlarmsAction extends Action {
    constructor() {
        super("Clear All Alarms", true, RunMode.ASYNC);
    }

    async run() {
        console.log("Running ClearAllAlarmsAction");
        const alarms = await GShockAPI.getAlarms();
        const updatedAlarms = alarms.map(a => ({ ...a, enabled: false, hour: 0, minute: 0 }));
        await AlarmsIO.set(updatedAlarms);
    }

    shouldRun(runEnvironment: RunEnvironment): boolean {
        return runEnvironment === RunEnvironment.VOICE_COMMAND;
    }
}

export class DisableAllAlarmsAction extends Action {
    constructor() {
        super("Disable All Alarms", true, RunMode.ASYNC);
    }

    async run() {
        console.log("Running DisableAllAlarmsAction");
        const alarms = await GShockAPI.getAlarms();
        const updatedAlarms = alarms.map(a => ({ ...a, enabled: false }));
        await AlarmsIO.set(updatedAlarms);
    }

    shouldRun(runEnvironment: RunEnvironment): boolean {
        return runEnvironment === RunEnvironment.VOICE_COMMAND;
    }
}

export class SetSettingsAction extends Action {
    public settingName: string = "";
    public settingValue: string = "";

    constructor() {
        super("Set Settings", true, RunMode.ASYNC);
    }

    async run(payload?: Settings) {
        console.log("Running SetSettingsAction");
        if (payload) {
            await SettingsIO.set(payload);
            await TimeAdjustmentIO.set(payload);
        } else {
            // Voice command path: update one field
            const current = await GShockAPI.getSettings();
            let toSend = { ...current };

            const val = this.settingValue.toLowerCase();
            const isTrue = val === "true" || val === "on" || val === "enable" || val === "enabled";

            switch (this.settingName) {
                case "auto light": toSend.autoLight = isTrue; break;
                case "power saving": toSend.powerSavingMode = isTrue; break;
                case "language": toSend.language = this.settingValue as any; break;
                case "time format": toSend.timeFormat = this.settingValue as any; break;
                case "date format": toSend.dateFormat = this.settingValue as any; break;
                case "light duration": toSend.lightDuration = this.settingValue as any; break;
                case "button tone":
                    toSend.buttonTone = isTrue;
                    toSend.keyVibration = isTrue;
                    break;
            }
            await SettingsIO.set(toSend);
            await TimeAdjustmentIO.set(toSend);
        }
    }

    shouldRun(runEnvironment: RunEnvironment): boolean {
        return runEnvironment === RunEnvironment.VOICE_COMMAND ||
               runEnvironment === RunEnvironment.DIRECT_INVOCATION;
    }
}

export class SetSettingsToDefaultAction extends Action {
    constructor() {
        super("Set Settings to Default", true, RunMode.ASYNC);
    }

    async run() {
        console.log("Running SetSettingsToDefaultAction");
        // Simplified smart defaults logic for the action
        const settings: Settings = {
            timeFormat: "12h",
            buttonTone: true,
            autoLight: false,
            powerSavingMode: false,
            lightDuration: "2s",
            dateFormat: "MM:DD",
            language: "English",
            timeAdjustment: true,
        };
        await SettingsIO.set(settings);
await TimeAdjustmentIO.set(settings);
    }

    shouldRun(runEnvironment: RunEnvironment): boolean {
        return runEnvironment === RunEnvironment.VOICE_COMMAND;
    }
}

export class SetTimerAction extends Action {
    public timerValueS: number = 0;

    constructor() {
        super("Set Timer", true, RunMode.ASYNC);
    }

    async run(payload?: number) {
        console.log("Running SetTimerAction");
        const val = payload !== undefined ? payload : this.timerValueS;
        await TimerIO.set(val);
    }

    shouldRun(runEnvironment: RunEnvironment): boolean {
        return runEnvironment === RunEnvironment.VOICE_COMMAND ||
               runEnvironment === RunEnvironment.DIRECT_INVOCATION;
    }
}

export class ClearStepHistoryAction extends Action {
    constructor() {
        super("Clear Step History", true, RunMode.ASYNC);
    }

    async run() {
        console.log("Running ClearStepHistoryAction");
        await GShockAPI.getStepCount(false); // peek = false clears history
    }

    shouldRun(runEnvironment: RunEnvironment): boolean {
        return runEnvironment === RunEnvironment.DIRECT_INVOCATION;
    }
}

export class FindPhoneAction extends Action {
    constructor() {
        super("Find Phone", true, RunMode.SYNC);
    }

    run() {
        console.log("Running FindPhoneAction");
        PhoneFinder.ring();
    }

    shouldRun(runEnvironment: RunEnvironment): boolean {
        return runEnvironment === RunEnvironment.FIND_PHONE_PRESSED ||
               runEnvironment === RunEnvironment.ACTION_BUTTON_PRESSED ||
               runEnvironment === RunEnvironment.VOICE_COMMAND;
    }
}

class ActionsContainer {
    private actions: Action[] = [];

    constructor() {
        this.actions = [
            new SetTimeAction(),
            new SetRemindersAction(),
            new SetAlarmsAction(),
            new ClearAllAlarmsAction(),
            new DisableAllAlarmsAction(),
            new SetSettingsAction(),
            new SetSettingsToDefaultAction(),
            new SetTimerAction(),
            new ClearStepHistoryAction(),
            new FindPhoneAction(),
        ];
    }

    getActions(): Action[] {
        return this.actions;
    }

    getAction<T extends Action>(type: new (...args: any[]) => T): T {
        const action = this.actions.find(a => a instanceof type);
        if (!action) {
            throw new Error(`Action ${type.name} not found`);
        }
        return action as T;
    }

    async runActions(runEnvironment: RunEnvironment, payload?: any) {
        const actionsToRun = this.actions.filter(a => a.shouldRun(runEnvironment));
        for (const action of actionsToRun) {
            try {
                await action.run(payload);
            } catch (e) {
                console.error(`Failed to run action ${action.title}`, e);
            }
        }
    }

    async runActionsForActionButton() {
        await this.runActions(RunEnvironment.ACTION_BUTTON_PRESSED);
    }

    async runActionForConnection() {
        await this.runActions(RunEnvironment.NORMAL_CONNECTION);
    }

    async runActionsForAutoTimeSetting() {
        await this.runActions(RunEnvironment.AUTO_TIME_ADJUSTMENT);
    }

    async runActionFindPhone() {
        await this.runActions(RunEnvironment.FIND_PHONE_PRESSED);
    }
}

export const actionsContainer = new ActionsContainer();
