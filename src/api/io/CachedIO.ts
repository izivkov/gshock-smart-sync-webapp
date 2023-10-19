import { watchValuesCache } from "@io/WatchValuesCache";
import { resultQueue } from "@io/ResultQueue";
import WatchDataEvents from "@api/WatchDataEvents";

class CachedIO {
    cache = watchValuesCache;
    resultQueue = resultQueue;

    constructor() {
        this.cache = watchValuesCache;
        this.resultQueue = resultQueue;
    }

    init() {
        this.cache.clear();
        this.resultQueue.clear();
    }

    clearCache() {
        this.cache.clear();
    }

    async request(key: string, func: (s: string) => Promise<any>) {
        const value = this.cache.getCached(key);
        if (value === null) {
            const funcResult = await func(key);
            this.cache.put(key, funcResult);
            return funcResult;
        }
        return value;
    }

    delete(key: string) {
        this.cache.remove(key);
    }

    subscribe(subject: string, onDataReceived: (data: any) => void) {
        WatchDataEvents.addSubject(subject);

        // receive values from the commands we issued in start()
        WatchDataEvents.subscribe(this.constructor.name, subject, (data) => {
            onDataReceived(data);
        });
    }

    get(key: string) {
        return this.cache.get(key);
    }

    remove(key: string) {
        this.cache.remove(key);
    }

    put(key: string, value: string) {
        return this.cache.put(key, value);
    }

    createKey(shortStr: string) {
        let keyLength = 2;
        // get the first byte of the returned data, which indicates the data content.
        const startOfData = shortStr.substring(0, 2).toUpperCase();
        if (["1D", "1E", "1F", "30", "31"].includes(startOfData)) {
            keyLength = 4;
        }
        return shortStr.substring(0, keyLength).toUpperCase();
    }
}

export const cachedIO = new CachedIO();
