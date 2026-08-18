import { cachedIO } from "@io/CachedIO";
import Utils from "@utils/Utils";
import CasioIO, { GET_SET_MODE } from "@io/CasioIO";

export const AppInfoIOFunctional = {
    shouldSetDefaultAppInfo(data: number[]): boolean {
        const compact = Utils.toCompactString(data);
        return compact.toUpperCase() === "22FFFFFFFFFFFFFFFFFFFF00";
    },

    getDefaultAppInfoCmd(): string {
        return "223488F4E5D5AFC829E06D02";
    }
};

let resolver: ((value: number[]) => void) | null = null;

const AppInfoIO = {
    async request(): Promise<number[]> {
        return await cachedIO.request("22", AppInfoIO.getAppInfo);
    },

    async getAppInfo(key: string): Promise<number[]> {
        const promise = new Promise<number[]>((resolve) => {
            resolver = resolve;
        });
        CasioIO.request(key);
        return promise;
    },

    onReceived(data: number[]) {
        if (AppInfoIOFunctional.shouldSetDefaultAppInfo(data)) {
            CasioIO.writeCmdFromString(GET_SET_MODE.SET, AppInfoIOFunctional.getDefaultAppInfoCmd());
        }

        if (resolver) {
            resolver(data);
            resolver = null;
        }
    },
};

export default AppInfoIO;
