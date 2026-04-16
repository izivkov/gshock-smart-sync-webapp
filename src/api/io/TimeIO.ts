import CasioIO from "@io/CasioIO";
import { watchInfo } from "@/api/WatchInfo";
import DstWatchStateIO from "@io/DstWatchStateIO";
import DstForWorldCitiesIO from "@io/DstForWorldCitiesIO";
import WorldCitiesIO from "@io/WorldCitiesIO";
import { CasioConstants } from "@api/CasioConstants";
import { connection } from "@api/Connection";
import Utils from "../utils/Utils";
import { findTimeZone } from "./CasioTimeZoneHelper";
import { DateTime } from "luxon";

interface TimeEncoder {
    prepareCurrentTime(date: Date): Uint8Array;
}

const defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

enum DtsMask {
    OFF = 0b00,
    ON = 0b01,
    AUTO = 0b10,
}

const TimeIO = {
    state: {
        timeZone: defaultTimeZone,
        casioTimezone: findTimeZone(defaultTimeZone)
    },

    async set(): Promise<void> {
        await this.initializeForSettingTime();

        const currentTime = Date.now();
        const currentTimeMessage = JSON.stringify({ action: "SET_TIME", value: currentTime });

        await connection.sendMessage(currentTimeMessage);
    },

    async setTimezone(timeZone?: string): Promise<void> {
        const tz = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.state.timeZone = tz;
        this.state.casioTimezone = findTimeZone(tz);
    },

    async getDSTWatchState(state: number): Promise<any> {
        return await DstWatchStateIO.request(state);
    },

    getDSTWatchStateWithTZ: async (state: number): Promise<number[]> => {
        const origDTS = await TimeIO.getDSTWatchState(state);
        
        const now = DateTime.now().setZone(TimeIO.state.casioTimezone.zoneName);
        const isInDST = now.isInDST;
        const hasRules = TimeIO.state.casioTimezone.dstRules !== 0;

        const dstValue =
            (isInDST ? DtsMask.ON : DtsMask.OFF) |
            (hasRules ? DtsMask.AUTO : 0);

        return await DstWatchStateIO.setDST(origDTS, dstValue);
    },

    async getDSTForWorldCities(cityNum: number): Promise<any> {
        return await DstForWorldCitiesIO.request(cityNum);
    },

    getDSTForWorldCitiesWithTZ: async (cityNum: number): Promise<number[]> => {
        const origDSTForCity = await TimeIO.getDSTForWorldCities(cityNum);
        const casioTimeZoneHack = {
            ...TimeIO.state.casioTimezone,
            dstOffset: TimeIO.state.casioTimezone.dstOffset.toString()
        };
        return await DstForWorldCitiesIO.setDST(origDSTForCity, casioTimeZoneHack);
    },

    async getWorldCities(cityNum: number): Promise<any> {
        return await WorldCitiesIO.request(cityNum);
    },

    getWorldCitiesWithTZ: async (cityNum: number): Promise<number[]> => {
        const newCity: string = WorldCitiesIO.parseCity(TimeIO.state.timeZone);
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
            { function: this.getDSTWatchStateWithTZ, param: CasioIO.DTS_STATE.ZERO },
            { function: this.getDSTWatchState, param: CasioIO.DTS_STATE.TWO },
            { function: this.getDSTWatchState, param: CasioIO.DTS_STATE.FOUR },
        ];

        for (let i = 0; i < watchInfo.dstCount; i++) {
            await this.readAndWrite(dtsStates[i].function, dtsStates[i].param);
        }
    },

    async writeDSTForWorldCities(): Promise<void> {
        const dstForWorldCities = [
            { function: this.getDSTForWorldCitiesWithTZ, param: 0 },
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
        const dateTime = DateTime.fromMillis(dateTimeMs).setZone(TimeIO.state.casioTimezone.zoneName);

        const timeData = TimeEncoder.prepareCurrentTime(dateTime);
        const timeCommand = [
            CasioConstants.CHARACTERISTICS.CASIO_CURRENT_TIME,
            ...Array.from(timeData),
        ];

        CasioIO.writeCmd(0x000e, timeCommand);
    },
};

const TimeEncoder = {
    prepareCurrentTime(date: DateTime): Uint8Array {
        const year = date.year;
        const month = date.month; // Luxon months are 1-12
        const day = date.day;
        const hour = date.hour;
        const minute = date.minute;
        const second = date.second;
        const dayOfWeek = date.weekday === 7 ? 0 : date.weekday; // JS/Casio: Sun=0, Mon=1
        const millisecond = date.millisecond;
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