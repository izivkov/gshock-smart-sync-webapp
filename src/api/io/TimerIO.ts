import CasioIO, { GET_SET_MODE } from "@io/CasioIO";
import { cachedIO } from "@io/CachedIO";

interface TimerData {
    hours: number;
    minutes: number;
    seconds: number;
}

export const TimerIOFunctional = {
    decode(data: number[]): TimerData {
        const hours = data[1];
        const minutes = data[2];
        const seconds = data[3];
        return { hours, minutes, seconds };
    },

    encode(secondsStr: string): number[] {
        const inSeconds = parseInt(secondsStr, 10);
        const hours = Math.floor(inSeconds / 3600);
        const minutesAndSeconds = inSeconds % 3600;
        const minutes = Math.floor(minutesAndSeconds / 60);
        const seconds = minutesAndSeconds % 60;

        return [0x18, hours, minutes, seconds, 0, 0, 0]; // 7 bytes
    }
};

let resolver: ((value: TimerData) => void) | null = null;

const TimerIO = {
    async request(requestStr: string = "18"): Promise<number> {
        const data = await cachedIO.request(requestStr, TimerIO._getTimer);
        return data.hours * 3600 + data.minutes * 60 + data.seconds;
    },

    async _getTimer(key: string): Promise<TimerData> {
        const promise = new Promise<TimerData>((resolve) => {
            resolver = resolve;
        });
        await TimerIO.sendToWatch("");
        return promise;
    },

    set(timerValue: number): void {
        cachedIO.delete("18");
        TimerIO.sendToWatchSet(JSON.stringify({ value: timerValue }));
    },

    onReceived(data: number[]): void {
        const result = TimerIOFunctional.decode(data);
        if (resolver) {
            resolver(result);
            resolver = null;
        }
    },

    async sendToWatch(message: string): Promise<void> {
        const characteristicsCode = 0x18;
        const byteArray = [characteristicsCode];
        await CasioIO.writeCmd(GET_SET_MODE.GET, byteArray);
    },

    sendToWatchSet(message: string): void {
        const seconds = JSON.parse(message).value.toString();
        const encodedData = TimerIOFunctional.encode(seconds);
        CasioIO.writeCmd(GET_SET_MODE.SET, encodedData);
    },
};

export default TimerIO;
