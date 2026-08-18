import { Alarm } from "@api/Alarms";
import { Settings } from "@api/Settings";
import { TimeAdjustmentInfo } from "@api/TimeAdjustmentInfo";

export interface WatchProtocol {
    dataReceivedHandlers: Record<number, (data: string) => void>;

    extractKey(data: string): number | null;
    unwrapPayload(data: string, key: number): string;
    getWatchConditionRequest(): string;
    setTime(timeMs?: number, offset?: number): Promise<void>;
    getTimer(): Promise<number>;
    setTimer(timerValue: number): void;
    getTimerRequest(): string;
    getTimerSize(): number;
    getHomeTime(): Promise<string>;
    getBatteryLevel(): Promise<number>;
    getWatchTemperature(): Promise<number>;
    getAlarms(): Promise<Alarm[]>;
    setAlarms(alarms: Alarm[]): void;
    getSettings(): Promise<Settings>;
    setSettings(settings: Settings): void;
    getBasicSettings(): Promise<Settings>;
    getTimeAdjustment(): Promise<TimeAdjustmentInfo>;
}
