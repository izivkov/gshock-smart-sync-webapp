import { watchInfo } from "@/api/WatchInfo";
import { cachedIO } from "./CachedIO";
import CasioIO from "./CasioIO";

let resolver: ((value: any) => void) | null = null;

const HomeTimeIO = {
    async request(): Promise<string> {
        return watchInfo.protocol!.getHomeTime();
    },

    async requestRaw(slot: number): Promise<any> {
        const key = `240${slot}`;
        return cachedIO.request(key, (k) => {
            const promise = new Promise<any>((resolve) => {
                resolver = resolve;
            });
            CasioIO.request(k);
            return promise;
        });
    },

    onReceived(data: any) {
        if (resolver) {
            resolver(data);
            resolver = null;
        }
    }
};

export default HomeTimeIO;
