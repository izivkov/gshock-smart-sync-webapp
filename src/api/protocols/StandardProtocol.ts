import { Alarm } from "@api/Alarms";
import { Settings } from "@api/Settings";
import { TimeAdjustmentInfo } from "@api/TimeAdjustmentInfo";
import { WatchProtocol } from "./WatchProtocol";
import { CasioConstants } from "@api/CasioConstants";
import AlarmsIO from "@io/AlarmsIO";
import DstForWorldCitiesIO from "@io/DstForWorldCitiesIO";
import EventsIO from "@io/EventsIO";
import TimerIO from "@io/TimerIO";
import WorldCitiesIO from "@io/WorldCitiesIO";
import DstWatchStateIO from "@io/DstWatchStateIO";
import WatchNameIO from "@io/WatchNameIO";
import WatchConditionIO from "@io/WatchConditionIO";
import AppInfoIO from "@io/AppInfoIO";
import ButtonPressedIO from "@io/ButtonPressedIO";
import SettingsIO from "@io/SettingsIO";
import TimeAdjustmentIO from "@io/TimeAdjustmentIO";
import StepCounterIO from "@io/StepCounterIO";
import GwBx5600TimeIO from "@io/GwBx5600TimeIO";
import RunActionsIO from "@io/RunActionsIO";
import ErrorIO from "@io/ErrorIO";
import UnknownIO from "@io/UnknownIO";
import HomeTimeIO from "@io/HomeTimeIO";
import HomeTimeIOFunctional from "@io/HomeTimeIOFunctional";
import TimeIO from "@io/TimeIO";
import Utils from "@utils/Utils";

export class StandardProtocol implements WatchProtocol {
    get dataReceivedHandlers(): Record<number, (data: string) => void> {
        return {
            [CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_ALM]: (data) => AlarmsIO.onReceived(data as any),
            [CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_ALM2]: (data) => AlarmsIO.onReceived(data as any),
            [CasioConstants.CHARACTERISTICS.CASIO_DST_SETTING]: (data) => DstForWorldCitiesIO.onReceived(data as any),
            [CasioConstants.CHARACTERISTICS.CASIO_REMINDER_TIME]: (data) => EventsIO.onReceived(data as any),
            [CasioConstants.CHARACTERISTICS.CASIO_REMINDER_TITLE]: (data) => EventsIO.onReceivedTitle(data as any),
            [CasioConstants.CHARACTERISTICS.CASIO_TIMER]: (data) => TimerIO.onReceived(data as any),
            [CasioConstants.CHARACTERISTICS.CASIO_WORLD_CITIES]: (data) => WorldCitiesIO.onReceived(data as any),
            [CasioConstants.CHARACTERISTICS.CASIO_DST_WATCH_STATE]: (data) => DstWatchStateIO.onReceived(data as any),
            [CasioConstants.CHARACTERISTICS.CASIO_WATCH_NAME]: (data) => WatchNameIO.onReceived(data as any),
            [CasioConstants.CHARACTERISTICS.CASIO_WATCH_CONDITION]: (data) => WatchConditionIO.onReceived(data as any),
            [CasioConstants.CHARACTERISTICS.CASIO_APP_INFORMATION]: (data) => AppInfoIO.onReceived(data as any),
            [CasioConstants.CHARACTERISTICS.CASIO_BLE_FEATURES]: (data) => ButtonPressedIO.onReceived(data as any),
            [CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_BASIC]: (data) => SettingsIO.onReceived(data as any),
            [CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_BLE]: (data) => TimeAdjustmentIO.onReceived(data as any),
            [CasioConstants.CHARACTERISTICS.CASIO_ACTIVITY_RECORD]: (data) => StepCounterIO.onReceived(data as any),
            [CasioConstants.CHARACTERISTICS.ERROR]: (data) => ErrorIO.onReceived(data as any),
            [CasioConstants.CHARACTERISTICS.FIND_PHONE]: (data) => RunActionsIO.onReceived(data as any),
            [CasioConstants.CHARACTERISTICS.CMD_SET_TIMEMODE]: (data) => UnknownIO.onReceived(data as any),
            [CasioConstants.CHARACTERISTICS.CASIO_HOME_TIME]: (data) => HomeTimeIO.onReceived(data as any),
            [CasioConstants.CHARACTERISTICS.GW_BX5600_SP_DATA_HEADER_03]: (data) => GwBx5600TimeIO.onReceivedStep2(data as any),
            [CasioConstants.CHARACTERISTICS.GW_BX5600_SP_DATA_HEADER_05]: (data) => GwBx5600TimeIO.onReceivedStep1(data as any),
            [CasioConstants.CHARACTERISTICS.GW_BX5600_SP_DATA_HEADER_06]: (data) => GwBx5600TimeIO.onReceivedStep3(data as any),
        };
    }

    extractKey(data: string): number | null {
        try {
            return Utils.hexToBytes(data)[0];
        } catch (e) {
            return null;
        }
    }

    unwrapPayload(data: string, key: number): string {
        return data;
    }

    getWatchConditionRequest(): string {
        return "28";
    }

    async setTime(timeMs?: number, offset?: number): Promise<void> {
        await TimeIO.set();
    }

    async getTimer(): Promise<number> {
        return await TimerIO.request(this.getTimerRequest());
    }

    setTimer(timerValue: number): void {
        TimerIO.set(timerValue);
    }

    getTimerRequest(): string {
        return "18";
    }

    getTimerSize(): number {
        return 7;
    }

    async getHomeTime(): Promise<string> {
        const raw = await WorldCitiesIO.request(0);
        return HomeTimeIOFunctional.parseHomeCity(raw, 2);
    }

    async getBatteryLevel(): Promise<number> {
        const condition = await WatchConditionIO.request(this.getWatchConditionRequest());
        return condition.batteryLevel;
    }

    async getWatchTemperature(): Promise<number> {
        const condition = await WatchConditionIO.request(this.getWatchConditionRequest());
        return condition.temperature;
    }

    async getAlarms(): Promise<Alarm[]> {
        return await AlarmsIO.request();
    }

    setAlarms(alarms: Alarm[]): void {
        AlarmsIO.set(alarms);
    }

    async getSettings(): Promise<Settings> {
        const basic = await SettingsIO.request();
        const timeAdj = await TimeAdjustmentIO.request();
        return {
            ...basic,
            timeAdjustment: timeAdj.isTimeAdjustmentSet,
            adjustmentTimeMinutes: timeAdj.adjustmentTimeMinutes,
        };
    }

    setSettings(settings: Settings): void {
        SettingsIO.set(settings);
        TimeAdjustmentIO.set(settings);
    }

    async getBasicSettings(): Promise<Settings> {
        return await SettingsIO.request() as any;
    }

    async getTimeAdjustment(): Promise<TimeAdjustmentInfo> {
        const info = await TimeAdjustmentIO.request();
        return info;
    }
}

export const standardProtocol = new StandardProtocol();
