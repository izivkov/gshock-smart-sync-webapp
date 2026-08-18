import { cachedIO } from "@io/CachedIO";
import CasioIO from "@io/CasioIO";
import Utils from "@utils/Utils";

export const WorldCitiesIOFunctional = {
    parseCity(timeZone: string): string {
        const city = timeZone.split('/').pop();
        return city?.toUpperCase()?.replace(/_/g, ' ') || '';
    },

    encodeAndPad(city: string, cityIndex: number): string {
        return (
            "1F" +
            cityIndex.toString(16).padStart(2, '0') +
            Utils.toHexStr(city.substring(0, 18)).padEnd(36, '0')
        );
    }
};

let resolver: ((value: number[]) => void) | null = null;

const WorldCitiesIO = {
    async request(cityNumber: number): Promise<number[]> {
        const key = `1f0${cityNumber}`;
        return await cachedIO.request(key, WorldCitiesIO.getWorldCities);
    },

    getWorldCities: async (key: string): Promise<number[]> => {
        const promise = new Promise<number[]>((resolve) => {
            resolver = resolve;
        });
        CasioIO.request(key);
        return promise;
    },

    onReceived: (data: number[]) => {
        if (resolver) {
            resolver(data);
            resolver = null;
        }
    },
};

export default WorldCitiesIO;
