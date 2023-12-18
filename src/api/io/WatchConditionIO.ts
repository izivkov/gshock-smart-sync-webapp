import { cachedIO } from "@io/CachedIO";
import CasioIO from "@io/CasioIO";
import Utils from "@utils/Utils";
import { watchInfo } from "@/api/WatchInfo";
import WATCH_MODEL from "@/api/WatchInfo";

class WatchConditionValue {
    constructor(public batteryLevel: number, public temperature: number) { }
}

let deferredResult: Promise<WatchConditionValue>;
let resolver: ((value?: WatchConditionValue | PromiseLike<WatchConditionValue>) => void);

const WatchConditionDecoder = {
    decodeValue(data: Uint8Array | null): WatchConditionValue {
        if (!data) {
            return new WatchConditionValue(0, 0);
        }

        const bytes = Array.from(data.slice(1));

        if (bytes.length >= 2) {
            const batteryLevelLowerLimit =
                watchInfo.model === WATCH_MODEL.GA ? 15 : 9;
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

        deferredResult = new Promise<WatchConditionValue>((resolve) => {
            resolver = resolve as ((value?: WatchConditionValue | PromiseLike<WatchConditionValue>) => void);
        });

        return deferredResult
    },

    onReceved: (data: any) => {
        const result = WatchConditionDecoder.decodeValue(data);
        resolver!(result);
    },
};

export default WatchConditionIO;
