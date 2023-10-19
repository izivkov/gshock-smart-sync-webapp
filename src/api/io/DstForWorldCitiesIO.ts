import { cachedIO } from "@io/CachedIO";
import CasioIO from "@io/CasioIO";
import Utils from "@utils/Utils";

interface CasioTimeZone {
    offset: number;
    dstOffset: string;
    dstRules: number;
}

const DstForWorldCitiesIO = {
    async request(cityNumber: number): Promise<any> {
        return await cachedIO.request(`1e0${cityNumber}`, this.getDSTForWorldCities);
    },

    async getDSTForWorldCities(key: string): Promise<any> {
        CasioIO.request(key);

        const deferredResult = new Promise<any>((resolve) => {
            cachedIO.resultQueue.enqueue({
                key,
                result: resolve,
            });
        });

        cachedIO.subscribe("CASIO_DST_SETTING", (keyedData: { value: any; key: any; }) => {
            const data = keyedData.value;
            const key = keyedData.key;

            const deferred = cachedIO.resultQueue.dequeue(key);
            if (deferred) {
                deferred(data);
            }
        });

        return await deferredResult;
    },

    async setDST(dst: string, casioTimeZone: CasioTimeZone): Promise<string> {
        let intArray = Utils.hexToBytes(dst);
        if (intArray.length === 7) {
            intArray[4] = casioTimeZone.offset;
            intArray[5] = parseInt(casioTimeZone.dstOffset);
            intArray[6] = casioTimeZone.dstRules;
        }

        const dstByteArray = Utils.byteArrayOfIntArray(intArray);
        return Utils.fromByteArrayToHexStrWithSpaces(dstByteArray);
    },

    toJson(data: any): any {
        const json: any = {};
        const dataStr = Utils.toCompactString(data);
        const dataJson = {
            key: cachedIO.createKey(dataStr),
            value: data,
        };
        json["CASIO_DST_SETTING"] = dataJson;
        return json;
    },
};

export default DstForWorldCitiesIO;
