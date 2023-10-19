class WatchValuesCache {
    private map: Map<string, any>;

    constructor() {
        this.map = new Map();
    }

    getCached(key: string): any | null {
        const val = this.get(key);
        return val === undefined ? null : val;
    }

    put(key: string, value: any): void {
        this.map.set(key.toUpperCase(), value);
    }

    get(key: string): any | undefined {
        return this.map.get(key.toUpperCase());
    }

    remove(key: string): void {
        this.map.delete(key.toUpperCase());
    }

    clear(): void {
        this.map.clear();
    }
}

export const watchValuesCache = new WatchValuesCache();
