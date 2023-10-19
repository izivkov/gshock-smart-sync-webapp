import { cachedIO } from "@io/CachedIO";
import CasioIO from "@io/CasioIO";
import Utils from "@utils/Utils";
import { watchInfo } from "@api/Watchinfo";
import WATCH_MODEL from "@api/Watchinfo";

class WatchConditionValue {
    constructor(public batteryLevel: number, public temperature: number) { }
}

const WatchConditionDecoder = {
    decodeValue(data: Uint8Array | null): WatchConditionValue {
        if (!data) {
            return new WatchConditionValue(0, 0);
        }

        const bytes = Array.from(data.slice(1));

        if (bytes.length >= 2) {
            const batteryLevelLowerLimit =
                watchInfo.model === WATCH_MODEL.GA ? 15 : 13;
            const batteryLevelUpperLimit =
                watchInfo.model === WATCH_MODEL.GA ? 20 : 19;
            const multiplier = Math.floor(100 / (batteryLevelUpperLimit - batteryLevelLowerLimit));
            const batteryLevel = bytes[0] - batteryLevelLowerLimit;
            const batteryLevelPercent = Math.min(
                Math.max(batteryLevel * multiplier, 0),
                100
            );
            const temperature = bytes[1];

            return new WatchConditionValue(batteryLevelPercent, temperature);
        }

        return new WatchConditionValue(0, 0);
    },
};

const WatchConditionIO = {
    request: async (): Promise<WatchConditionValue> => {
        return WatchConditionIO.getWatchCondition("28");
    },

    getWatchCondition: async (key: string): Promise<WatchConditionValue> => {
        CasioIO.request(key);

        const deferredResult = new Promise<WatchConditionValue>((resolve) => {
            cachedIO.resultQueue.enqueue({
                key: key,
                result: resolve,
            });
        });

        cachedIO.subscribe("CASIO_WATCH_CONDITION", (keyedData) => {
            const data = keyedData.value;
            const key = keyedData.key;

            const result = WatchConditionDecoder.decodeValue(data);
            const deferred = cachedIO.resultQueue.dequeue(key);
            if (deferred) {
                deferred(result);
            }
        });

        return await deferredResult;
    },

    toJson: (data: any) => {
        const dataCompactString = Utils.toCompactString(data);
        const json = {
            CASIO_WATCH_CONDITION: {
                key: cachedIO.createKey(dataCompactString),
                value: data,
            },
        };
        return json;
    },
};

export default WatchConditionIO;
