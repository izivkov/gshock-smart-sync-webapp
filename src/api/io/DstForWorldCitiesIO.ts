import { cachedIO } from "@io/CachedIO";
import CasioIO from "@io/CasioIO";
import Utils from "@utils/Utils";

interface CasioTimeZone {
    offset: number;
    dstOffset: string;
    dstRules: number;
}

let deferredResult: Promise<any>;
let resolver: ((value?: any | PromiseLike<any>) => void);

const DstForWorldCitiesIO = {
    async request(cityNumber: number): Promise<any> {
        return await cachedIO.request(`1e0${cityNumber}`, this.getDSTForWorldCities);
    },

    async getDSTForWorldCities(key: string): Promise<any> {
        CasioIO.request(key);

        deferredResult = new Promise<any>((resolve) => {
            resolver = resolve as ((value?: any | PromiseLike<any>) => void);
        });

        return deferredResult
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

    onReceived(data: any): any {
        resolver!(data);
    },
};

export default DstForWorldCitiesIO;
