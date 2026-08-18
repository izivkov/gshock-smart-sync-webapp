import { cachedIO } from "@io/CachedIO";
import Utils from "@utils/Utils";
import CasioIO from "@io/CasioIO";

export const WatchNameIOFunctional = {
    decode(data: number[]): string {
        return Utils.trimNonAsciiCharacters(Utils.toAsciiString(data, 3));
    }
};

let resolver: ((value: string) => void) | null = null;

const WatchNameIO = {
    async request(): Promise<string> {
        return await cachedIO.request("23", WatchNameIO.getWatchName);
    },

    async getWatchName(key: string): Promise<string> {
        const promise = new Promise<string>((resolve) => {
            resolver = resolve;
        });
        CasioIO.request(key);
        return promise;
    },

    onReceived(data: number[]) {
        const result = WatchNameIOFunctional.decode(data);
        if (resolver) {
            resolver(result);
            resolver = null;
        }
    },
}

export default WatchNameIO;
