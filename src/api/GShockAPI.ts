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
import { StepCounterData } from "./StepCounterData"
import { Alarm } from "./Alarms"
import { Settings } from "./Settings"
import WatchDataListener from "./WatchDataListener"
import { connection } from "@api/Connection"
import { generateMockStepData } from "./utils/MockStepData"

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

    setTimer: (timerValue: number): void => {
        watchInfo.protocol!.setTimer(timerValue);
    },

    getBatteryLevel: async (): Promise<number> => {
        return await watchInfo.protocol!.getBatteryLevel();
    },

    getWatchTemperature: async (): Promise<number> => {
        return await watchInfo.protocol!.getWatchTemperature();
    },

    setTime: async (timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone): Promise<void> => {
        await TimeIO.setTimezone(timeZone);
        await watchInfo.protocol!.setTime();
    },

    getAlarms: async (): Promise<Alarm[]> => {
        return await watchInfo.protocol!.getAlarms();
    },

    setAlarms: (alarms: Alarm[]): void => {
        watchInfo.protocol!.setAlarms(alarms);
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

    setEvents: async (events: any[]): Promise<void> => {
        await EventsIO.setEvents(events);
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

    setSettings: (settings: Settings): void => {
        watchInfo.protocol!.setSettings(settings);
    },

    getStepCount: async (): Promise<StepCounterData> => {
        if (watchInfo.hasStepCounterMock) {
            return generateMockStepData();
        }
        return await StepCounterIO.request();
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
