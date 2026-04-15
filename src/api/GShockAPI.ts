import CasioIO from "@io/CasioIO"
import watchNameIO from "@io/WatchNameIO"
import HomeTimeIO from "@io/HomeTimeIO"
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

const GShockAPI = {
    init: async (): Promise<boolean> => {
        await CasioIO.init();
        await cachedIO.init();
        await ButtonPressedIO.getPressedButton("10");

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

    getHomeTime: async (): Promise<any> => {
        try {
            const result = await HomeTimeIO.request();
            return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
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

    getTimer: async (): Promise<any> => {
        try {
            const timerValue = await TimerIO.request();
            return timerValue;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    },

    setTimer: async (timerValue: any): Promise<void> => {
        TimerIO.set(timerValue);
    },

    getBatteryLevel: async (): Promise<number> => {
        const condition = await WatchConditionIO.request();
        return condition.batteryLevel;
    },

    getWatchTemperature: async (): Promise<number> => {
        const condition = await WatchConditionIO.request();
        return condition.temperature;
    },

    setTime: async (): Promise<void> => {
        await TimeIO.setTimezone()
        await TimeIO.set();
    },

    getAlarms: async (): Promise<any> => {
        const alarms = await AlarmsIO.request();
        return alarms;
    },

    setAlarms: async (alarms: any): Promise<void> => {
        await AlarmsIO.set(alarms);
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

    getBasicSettings: async (): Promise<any> => {
        return await SettingsIO.request();
    },

    getTimeAdjustment: async (): Promise<any> => {
        return await TimeAdjustmentIO.request();
    },

    getSettings: async (): Promise<any> => {
        const settings = await GShockAPI.getBasicSettings();
        const timeAdjustment = await GShockAPI.getTimeAdjustment();
        settings.timeAdjustment = timeAdjustment;
        return settings;
    },

    setSettings: async (settings: any): Promise<void> => {
        await SettingsIO.set(settings);
        await TimeAdjustmentIO.set(settings);
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
