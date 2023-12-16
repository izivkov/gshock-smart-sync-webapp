import { cachedIO } from "@io/CachedIO";
import CasioIO from "@io/CasioIO";
import Utils from "@utils/Utils";

interface WorldCityData {
    key: string;
    value: string;
}

interface KeyedData {
    key: string;
    value: string;
}

let deferredResult: Promise<string>;
let resolver: ((value?: string | PromiseLike<string>) => void) | undefined;

const WorldCitiesIO = {
    async request(cityNumber: number): Promise<string> {
        const key = `1f0${cityNumber}`;
        const worldCitiesData = await cachedIO.request(key, this.getWorldCities);
        return worldCitiesData;
    },

    getWorldCities: async (key: string): Promise<string> => {
        try {
            CasioIO.request(key);

            // const deferredResult = new Promise<string>((resolve) => {
            //     cachedIO.resultQueue.enqueue({
            //         key,
            //         result: resolve,
            //     });
            // });

            deferredResult = new Promise<string>((resolve) => {
                resolver = resolve as (value?: string | PromiseLike<string>) => void;
            });

            return await deferredResult;
        } catch (error) {
            console.error("Error fetching world cities:", error);
            throw error;
        }
    },

    // toJson(data: any): Record<string, WorldCityData> {
    //     const json: Record<string, WorldCityData> = {};
    //     const dataStr: any = Utils.toCompactString(data);
    //     const dataJson: WorldCityData = { key: cachedIO.createKey(dataStr), value: data };
    //     const characteristicsArray = Utils.toIntArray(dataStr);
    //     if (characteristicsArray[1] === 0) {
    //         json["HOME_TIME"] = dataJson;
    //     }
    //     json["CASIO_WORLD_CITIES"] = dataJson;
    //     return json;
    // },

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
    },

    onReceived: (data: any) => {
        resolver!(data);
    },
};

export default WorldCitiesIO;
