import { cachedIO } from "@io/CachedIO";
import CasioIO from "@io/CasioIO";
import Utils from "@utils/Utils";

const DstWatchStateIO = {
    async request(state: number): Promise<any> {
        return await cachedIO.request(`1d0${state}`, this.getDSTWatchState);
    },

    async getDSTWatchState(key: string): Promise<any> {
        CasioIO.request(key);

        const deferredResult = new Promise<any>((resolve) => {
            cachedIO.resultQueue.enqueue({
                key,
                result: resolve,
            });
        });

        cachedIO.subscribe("CASIO_DST_WATCH_STATE", (keyedData) => {
            const data = keyedData.value;
            const key = keyedData.key;

            const deferred = cachedIO.resultQueue.dequeue(key);
            if (deferred) {
                deferred(data);
            }
        });

        return await deferredResult;
    },

    async setDST(dstState: string, dst: number): Promise<string> {
        const intArray = Utils.hexToBytes(dstState);
        intArray[3] = dst;

        const newValue = Utils.byteArrayOfIntArray(intArray);
        return Utils.fromByteArrayToHexStrWithSpaces(newValue);
    },

    toJson(data: any): any {
        const json: any = {};
        const dataStr = Utils.toCompactString(data);
        const dataJson = {
            key: cachedIO.createKey(dataStr),
            value: data,
        };
        json["CASIO_DST_WATCH_STATE"] = dataJson;
        return json;
    },
};

export default DstWatchStateIO;
