import { cachedIO } from "@io/CachedIO";
import CasioIO from "@io/CasioIO";
import Utils from "@utils/Utils";

let deferredResult: Promise<any>;
let resolver: ((value?: any | PromiseLike<any>) => void);

const DstWatchStateIO = {
    async request(state: number): Promise<any> {
        return await cachedIO.request(`1d0${state}`, this.getDSTWatchState);
    },

    async getDSTWatchState(key: string): Promise<any> {
        CasioIO.request(key);

        deferredResult = new Promise<any>((resolve) => {
            resolver = resolve as ((value?: any | PromiseLike<any>) => void);
        });

        return deferredResult
    },

    async setDST(dstState: number[], dst: number): Promise<number[]> {
        const intArray = Array.from(dstState);
        intArray[3] = dst;
        return intArray;
    },

    onReceived(data: any): any {
        resolver!(data);
    },
};

export default DstWatchStateIO;
