import CasioIO from "@io/CasioIO"
import watchNameIO from "@io/WatchNameIO"
import WorldCitiesIO from "@io/WorldCitiesIO"
import TimerIO from "@io/TimerIO"
import WatchConditionIO from "@io/WatchConditionIO"
import TimeIO from "@io/TimeIO"
import AlarmsIO from "@io/AlarmsIO"
import EventsIO from "@io/EventsIO"
import SettingsIO from "@io/SettingsIO"
import TimeAdjustmentIO from "@io/TimeAdjustmentIO"
import ButtonPressedIO from "@io/ButtonPressedIO"
import { cachedIO } from "@io/CachedIO";
import { progressEvents } from "@api/ProgressEvents"
import AppInfoIO from "@io/AppInfoIO"
import StepCounterIO from "@io/StepCounterIO"
import { watchInfo } from "./WatchInfo"
import { StepCounterData } from "@model/StepCounterData"
import Alarm from "@model/Alarm"
import { Settings } from "@model/Settings"
import WatchDataListener from "./WatchDataListener"
import { connection } from "@api/Connection"
import { generateMockStepData } from "@model/MockStepData"
import { actionsContainer, SetTimeAction, SetAlarmsAction, SetSettingsAction, SetTimerAction, SetRemindersAction, ClearStepHistoryAction } from "../actions/ActionsContainer"

const GShockAPI = {
    init: async (): Promise<boolean> => {
        CasioIO.setWriter(async (handle, value) => {
            await connection.write(handle, value);
        });
        WatchDataListener.init();
        await CasioIO.init();
        await cachedIO.init();
        await GShockAPI.getPressedButton();

        await GShockAPI.getAppInfo();
        progressEvents.onNext("WatchInitializationCompleted");
        return true;
    },

    getAppInfo: async (): Promise<any> => {
        return await AppInfoIO.request();
    },

    getWatchName: async (): Promise<any> => {
        return await watchNameIO.request();
    },

    getHomeTime: async (): Promise<string> => {
        return await watchInfo.protocol!.getHomeTime();
    },

    getWorldCities: async (cityNumber: number): Promise<any> => {
        try {
            const worldCitiesData = await WorldCitiesIO.request(cityNumber);
            return worldCitiesData;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    },

    getTimer: async (): Promise<number> => {
        return await watchInfo.protocol!.getTimer();
    },



    getBatteryLevel: async (): Promise<number> => {
        return await watchInfo.protocol!.getBatteryLevel();
    },

    getWatchTemperature: async (): Promise<number> => {
        return await watchInfo.protocol!.getWatchTemperature();
    },



    getAlarms: async (): Promise<Alarm[]> => {
        return await watchInfo.protocol!.getAlarms();
    },



    getEventFromWatch: async (eventNumber: number): Promise<any> => {
        return await EventsIO.request(eventNumber);
    },

    getEventsFromWatch: async (): Promise<any[]> => {
        const events: any[] = [];

        events.push(await EventsIO.request(1));
        events.push(await GShockAPI.getEventFromWatch(2));
        events.push(await GShockAPI.getEventFromWatch(3));
        events.push(await GShockAPI.getEventFromWatch(4));
        events.push(await GShockAPI.getEventFromWatch(5));

        return events;
    },



    setEvent: async (index: number, event: any): Promise<void> => {
        await EventsIO.setEvent(index, event);
    },

    getBasicSettings: async (): Promise<Settings> => {
        return await watchInfo.protocol!.getBasicSettings();
    },

    getTimeAdjustment: async (): Promise<any> => {
        return await watchInfo.protocol!.getTimeAdjustment();
    },

    getSettings: async (): Promise<Settings> => {
        return await watchInfo.protocol!.getSettings();
    },

    getStepCount: async (peek: boolean = true): Promise<StepCounterData> => {
        if (watchInfo.hasStepCounterMock) {
            return generateMockStepData();
        }
        return await StepCounterIO.request(peek);
    },

    getPressedButton: async (): Promise<string> => {
        const value = await ButtonPressedIO.request();
        ButtonPressedIO.put(value);
        return value;
    },

    isActionButtonPressed: (): boolean => {
        const button = ButtonPressedIO.get();
        return button === CasioIO.WATCH_BUTTON.LOWER_RIGHT;
    },

    isFindPhoneButtonPressed: (): boolean => {
        const button = ButtonPressedIO.get();
        return button === CasioIO.WATCH_BUTTON.FIND_PHONE;
    },

    isNormalButtonPressed: (): boolean => {
        const button = ButtonPressedIO.get();
        return button === CasioIO.WATCH_BUTTON.LOWER_LEFT;
    },

    isAutoTimeStarted: (): boolean => {
        const button = ButtonPressedIO.get();
        return button === CasioIO.WATCH_BUTTON.NO_BUTTON;
    },
};

export default GShockAPI;
