import { cachedIO } from "@io/CachedIO";
import CasioIO from "@io/CasioIO";

export interface CasioTimeZone {
    offset: number;
    dstOffset: string | number;
    dstRules: number;
}

export const DstForWorldCitiesIOFunctional = {
    setDST(dst: number[], casioTimeZone: CasioTimeZone): number[] {
        const result = [...dst];
        if (result.length >= 7) {
            result[4] = casioTimeZone.offset;
            result[5] = typeof casioTimeZone.dstOffset === 'string' ? parseInt(casioTimeZone.dstOffset) : casioTimeZone.dstOffset;
            result[6] = casioTimeZone.dstRules;
        }
        return result;
    }
};

let resolver: ((value: number[]) => void) | null = null;

const DstForWorldCitiesIO = {
    async request(cityNumber: number): Promise<number[]> {
        return await cachedIO.request(`1e0${cityNumber}`, DstForWorldCitiesIO.getDSTForWorldCities);
    },

    async getDSTForWorldCities(key: string): Promise<number[]> {
        const promise = new Promise<number[]>((resolve) => {
            resolver = resolve;
        });
        CasioIO.request(key);
        return promise;
    },

    async setDST(dst: number[], casioTimeZone: CasioTimeZone): Promise<number[]> {
        return DstForWorldCitiesIOFunctional.setDST(dst, casioTimeZone);
    },

    onReceived(data: number[]) {
        if (resolver) {
            resolver(data);
            resolver = null;
        }
    },
};

export default DstForWorldCitiesIO;
