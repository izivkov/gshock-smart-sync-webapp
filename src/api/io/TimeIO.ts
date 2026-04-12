import CasioIO from "@io/CasioIO";
import { watchInfo } from "@/api/WatchInfo";
import DstWatchStateIO from "@io/DstWatchStateIO";
import DstForWorldCitiesIO from "@io/DstForWorldCitiesIO";
import WorldCitiesIO from "@io/WorldCitiesIO";
import { CasioConstants } from "@api/CasioConstants";
import { connection } from "@api/Connection";
import Utils from "../utils/Utils";

interface TimeEncoder {
    prepareCurrentTime(date: Date): Uint8Array;
}

const TimeIO = {
    async set(): Promise<void> {
        await this.initializeForSettingTime();

        const currentTime = Date.now();
        const currentTimeMessage = JSON.stringify({ action: "SET_TIME", value: currentTime });

        await connection.sendMessage(currentTimeMessage);
    },

    async getDSTWatchState(state: number): Promise<any> {
        return await DstWatchStateIO.request(state);
    },

    async getDSTForWorldCities(cityNum: number): Promise<any> {
        return await DstForWorldCitiesIO.request(cityNum);
    },

    async getWorldCities(cityNum: number): Promise<any> {
        return await WorldCitiesIO.request(cityNum);
    },

    getWorldCitiesWithTZ: async (cityNum: number): Promise<number[]> => {
        const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
        const newCity: string = WorldCitiesIO.parseCity(timeZone);
        const encoded: string = WorldCitiesIO.encodeAndPad(newCity, cityNum);
        CasioIO.removeFromCache(encoded);

        return Utils.hexToBytes(encoded);
    },

    async initializeForSettingTime(): Promise<void> {
        await this.writeDST();
        await this.writeDSTForWorldCities();
        await this.writeWorldCities();
    },

    async readAndWrite(functionName: Function, param: any): Promise<void> {
        const ret = await functionName(param);
        await CasioIO.writeCmd(0xE, ret);
    },

    async writeDST(): Promise<void> {
        const dtsStates = [
            { function: this.getDSTWatchState, param: CasioIO.DTS_STATE.ZERO },
            { function: this.getDSTWatchState, param: CasioIO.DTS_STATE.TWO },
            { function: this.getDSTWatchState, param: CasioIO.DTS_STATE.FOUR },
        ];

        for (let i = 0; i < watchInfo.dstCount; i++) {
            await this.readAndWrite(dtsStates[i].function, dtsStates[i].param);
        }
    },

    async writeDSTForWorldCities(): Promise<void> {
        const dstForWorldCities = [
            { function: this.getDSTForWorldCities, param: 0 },
            { function: this.getDSTForWorldCities, param: 1 },
            { function: this.getDSTForWorldCities, param: 2 },
            { function: this.getDSTForWorldCities, param: 3 },
            { function: this.getDSTForWorldCities, param: 4 },
            { function: this.getDSTForWorldCities, param: 5 },
        ];

        for (let i = 0; i < watchInfo.worldCitiesCount; i++) {
            await this.readAndWrite(dstForWorldCities[i].function, dstForWorldCities[i].param);
        }
    },

    async writeWorldCities(): Promise<void> {
        const worldCities = [
            { function: this.getWorldCitiesWithTZ, param: 0 },
            { function: this.getWorldCities, param: 1 },
            { function: this.getWorldCities, param: 2 },
            { function: this.getWorldCities, param: 3 },
            { function: this.getWorldCities, param: 4 },
            { function: this.getWorldCities, param: 5 },
        ];

        for (let i = 0; i < watchInfo.worldCitiesCount; i++) {
            await this.readAndWrite(worldCities[i].function, worldCities[i].param);
        }
    },

    sendToWatchSet(message: string): void {
        const dateTimeMs = JSON.parse(message).value;
        const dateTime = new Date(dateTimeMs);
        const timeData = TimeEncoder.prepareCurrentTime(dateTime);
        const timeCommand = [
            CasioConstants.CHARACTERISTICS.CASIO_CURRENT_TIME,
            ...Array.from(timeData),
        ];

        CasioIO.writeCmd(0x000e, timeCommand);
    },
};

const TimeEncoder = {
    prepareCurrentTime(date: Date): Uint8Array {
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // Months are 0-based
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        const dayOfWeek = date.getDay();
        const millisecond = date.getMilliseconds();
        const lastByte = 1;

        const arr = new Uint8Array(10);
        arr[0] = year & 0xff;
        arr[1] = (year >> 8) & 0xff;
        arr[2] = month;
        arr[3] = day;
        arr[4] = hour;
        arr[5] = minute;
        arr[6] = second;
        arr[7] = dayOfWeek;
        arr[8] = millisecond;
        arr[9] = lastByte;

        return arr;
    },
};

export default TimeIO;