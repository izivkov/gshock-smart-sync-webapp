import CasioIO from "@io/CasioIO";
import Utils from "@utils/Utils";
import { cachedIO } from "@io/CachedIO";
import { connection } from "@api/Connection";

interface TimerData {
    hours: number;
    minutes: number;
    seconds: number;
}

const TimerIO = {
    async request(): Promise<number> {
        const key = `18`;
        const timerValue = await cachedIO.request(key, this._getTimer);
        return timerValue;
    },

    async _getTimer(key: string): Promise<number> {
        CasioIO.request(key);

        const getTimer = (data: Uint8Array): TimerData => {
            return TimerDecoder.decodeValue(data);
        };

        const deferredResult = new Promise<number>((resolve) => {
            cachedIO.resultQueue.enqueue({
                key,
                result: resolve,
            });
        });

        cachedIO.subscribe("CASIO_TIMER", (keyedData) => {
            const data = keyedData.value;
            const resultKey = keyedData.key;

            const deferredResult = cachedIO.resultQueue.dequeue(resultKey);
            if (deferredResult) {
                deferredResult(getTimer(data));
            }
        });

        const result = await deferredResult;
        return result;
    },

    set(timerValue: number): void {
        const key = "18";
        cachedIO.delete(key);
        connection.sendMessage(`{"action": "SET_TIMER", "value": ${timerValue}}`);
    },

    toJson(data: any): Record<string, any> {
        const json: Record<string, any> = {};
        const dataStr = Utils.toCompactString(data);
        const dataJson = { key: cachedIO.createKey(dataStr), value: data };
        json["CASIO_TIMER"] = dataJson;
        return json;
    },

    async sendToWatch(message: string): Promise<void> {
        const characteristicsCode = 0x18;
        const byteArray: any = Utils.byteArray(characteristicsCode);
        await CasioIO.writeCmd(0x000c, byteArray);
    },

    sendToWatchSet(message: string): void {
        const seconds = JSON.parse(message).value.toString();
        const encodedData = TimerEncoder.encode(seconds);
        CasioIO.writeCmd(0x000e, encodedData);
    },
};

const TimerDecoder = {
    decodeValue(data: Uint8Array): TimerData {
        const timerIntArray = data;

        const hours = timerIntArray[1];
        const minutes = timerIntArray[2];
        const seconds = timerIntArray[3];

        const inSeconds = hours * 3600 + minutes * 60 + seconds;
        return { hours, minutes, seconds };
    },
};

const TimerEncoder = {
    encode(secondsStr: string): number[] {
        const inSeconds = parseInt(secondsStr, 10);
        const hours = Math.floor(inSeconds / 3600);
        const minutesAndSeconds = inSeconds % 3600;
        const minutes = Math.floor(minutesAndSeconds / 60);
        const seconds = minutesAndSeconds % 60;

        const arr = new Uint8Array(7);
        arr[0] = 0x18;
        arr[1] = hours;
        arr[2] = minutes;
        arr[3] = seconds;

        return Array.from(arr);
    },
};

export default TimerIO;
