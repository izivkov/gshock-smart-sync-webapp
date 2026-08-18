import { watchValuesCache } from "@io/WatchValuesCache";
import { resultQueue } from "@io/ResultQueue";

class CachedIO {
    cache = watchValuesCache;
    resultQueue = resultQueue;
    private pendingRequests = new Map<string, Promise<any>>();

    constructor() {
        this.cache = watchValuesCache;
        this.resultQueue = resultQueue;
    }

    init() {
        this.cache.clear();
        this.resultQueue.clear();
        this.pendingRequests.clear();
    }

    clearCache() {
        this.cache.clear();
        this.pendingRequests.clear();
    }

    async request(key: string, func: (s: string) => Promise<any>) {
        const value = this.cache.getCached(key);
        if (value !== null) {
            return value;
        }

        const pending = this.pendingRequests.get(key);
        if (pending) {
            return pending;
        }

        const promise = (async () => {
            try {
                const funcResult = await func(key);
                this.cache.put(key, funcResult);
                return funcResult;
            } finally {
                this.pendingRequests.delete(key);
            }
        })();

        this.pendingRequests.set(key, promise);
        return promise;
    }

    delete(key: string) {
        this.cache.remove(key);
        this.pendingRequests.delete(key);
    }

    get(key: string) {
        return this.cache.get(key);
    }

    remove(key: string) {
        this.cache.remove(key);
        this.pendingRequests.delete(key);
    }

    put(key: string, value: any) {
        return this.cache.put(key, value);
    }

    createKey(shortStr: string) {
        let keyLength = 2;
        const startOfData = shortStr.substring(0, 2).toUpperCase();
        if (["1D", "1E", "1F", "30", "31"].includes(startOfData)) {
            keyLength = 4;
        }
        return shortStr.substring(0, keyLength).toUpperCase();
    }
}

export const cachedIO = new CachedIO();
