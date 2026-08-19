import Alarm from "@model/Alarm";
import { Settings } from "@model/Settings";
import { TimeAdjustmentInfo } from "@api/TimeAdjustmentInfo";

export interface WatchProtocol {
    dataReceivedHandlers: Record<number, (data: string) => void>;

    extractKey(data: string): number | null;
    unwrapPayload(data: string, key: number): string;
    getWatchConditionRequest(): string;
    setTime(timeMs?: number, offset?: number): Promise<void>;
    getTimer(): Promise<number>;
    setTimer(timerValue: number): Promise<void>;
    getTimerRequest(): string;
    getTimerSize(): number;
    getHomeTime(): Promise<string>;
    getBatteryLevel(): Promise<number>;
    getWatchTemperature(): Promise<number>;
    getAlarms(): Promise<Alarm[]>;
    setAlarms(alarms: Alarm[]): Promise<void>;
    getSettings(): Promise<Settings>;
    setSettings(settings: Settings): Promise<void>;
    getBasicSettings(): Promise<Settings>;
    getTimeAdjustment(): Promise<TimeAdjustmentInfo>;
}
