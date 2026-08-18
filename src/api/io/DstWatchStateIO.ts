import { cachedIO } from "@io/CachedIO";
import CasioIO from "@io/CasioIO";

export const DstWatchStateIOFunctional = {
    setDST(dstState: number[], dst: number): number[] {
        const result = [...dstState];
        result[3] = dst;
        return result;
    }
};

let resolver: ((value: number[]) => void) | null = null;

const DstWatchStateIO = {
    async request(state: number): Promise<number[]> {
        return await cachedIO.request(`1d0${state}`, DstWatchStateIO.getDSTWatchState);
    },

    async getDSTWatchState(key: string): Promise<number[]> {
        const promise = new Promise<number[]>((resolve) => {
            resolver = resolve;
        });
        CasioIO.request(key);
        return promise;
    },

    async setDST(dstState: number[], dst: number): Promise<number[]> {
        return DstWatchStateIOFunctional.setDST(dstState, dst);
    },

    onReceived(data: number[]) {
        if (resolver) {
            resolver(data);
            resolver = null;
        }
    },
};

export default DstWatchStateIO;
