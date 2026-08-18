import { cachedIO } from "@io/CachedIO";
import CasioIO from "@io/CasioIO";
import { watchInfo } from "@/api/WatchInfo";

export interface WatchConditionValue {
    batteryLevel: number;
    temperature: number;
}

export const WatchConditionIOFunctional = {
    decode(data: number[]): WatchConditionValue {
        if (!data || data.length < 3) {
            return { batteryLevel: 0, temperature: 0 };
        }

        const bytes = data.slice(1);
        const batteryLevelLowerLimit = watchInfo.batteryLevelLowerLimit;
        const batteryLevelUpperLimit = watchInfo.batteryLevelUpperLimit;
        const multiplier = Math.floor(100 / (batteryLevelUpperLimit - batteryLevelLowerLimit));
        const batteryLevel = bytes[0] - batteryLevelLowerLimit;
        const batteryLevelPercent = Math.min(Math.max(batteryLevel * multiplier, 0), 100);
        const temperature = bytes[1];

        return { batteryLevel: batteryLevelPercent, temperature };
    }
};

let resolver: ((value: WatchConditionValue) => void) | null = null;

const WatchConditionIO = {
    request: async (requestStr: string = "28"): Promise<WatchConditionValue> => {
        return await cachedIO.request(requestStr, WatchConditionIO.getWatchCondition);
    },

    getWatchCondition: async (key: string): Promise<WatchConditionValue> => {
        const promise = new Promise<WatchConditionValue>((resolve) => {
            resolver = resolve;
        });
        CasioIO.request(key);
        return promise;
    },

    onReceived: (data: number[]) => {
        const result = WatchConditionIOFunctional.decode(data);
        if (resolver) {
            resolver(result);
            resolver = null;
        }
    },
};

export default WatchConditionIO;
