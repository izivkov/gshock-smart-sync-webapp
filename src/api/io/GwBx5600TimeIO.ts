import CasioIO, { GET_SET_MODE } from "@io/CasioIO";
import { watchInfo } from "@/api/WatchInfo";
import { CasioConstants } from "@api/CasioConstants";
import TimeIO from "@io/TimeIO";
import * as CasioTimeZoneHelper from "./CasioTimeZoneHelper";
import Utils from "@utils/Utils";
import dayjs from "dayjs";

const CITY_RECORD_FLAG = 0x01;
const EMPTY_SLOT_TRAILING = 0x00;
const EMPTY_SLOT_LAT = 0.0;
const EMPTY_SLOT_LON = 0.0;

interface StepChannel {
    expectedBytes: number;
    accumulator: number[];
    resolver: ((value: number[]) => void) | null;
}

const createChannel = (): StepChannel => ({
    expectedBytes: 0,
    accumulator: [],
    resolver: null,
});

const step1Channel = createChannel();
const step2Channel = createChannel();
const step3Channel = createChannel();

const GwBx5600TimeIO = {
    async set(timeMs?: number): Promise<void> {
        const now = dayjs(timeMs);
        console.info("GwBx5600TimeIO.set: " + now.format());

        // Step 1/4: Time-Slot Data
        console.info("Step 1/4: time-slot data");
        let req1 = [0x05, 0x1D, 0x00, 0x1D, 0x00, 0x24, 0x00, 0x24, 0x01, 0x24, 0x02];
        const notif1 = await this.request(step1Channel, req1, 101);
        if (notif1) {
            const wb1 = [...notif1];
            wb1[0] = 0x02;
            await CasioIO.writeCmd(GET_SET_MODE.SP_DATA, wb1);
        } else {
            console.warn("GwBx5600TimeIO Step1: no response from watch");
            return;
        }

        // Step 2/4: World-City Data
        console.info("Step 2/4: world-city data");
        let req2 = [0x03];
        const blocks = Math.ceil(watchInfo.worldCitiesCount / 2.0);
        for (let i = 0; i < blocks; i++) {
            req2.push(CasioConstants.CHARACTERISTICS.CASIO_DST_SETTING, 0x00);
        }
        const notif2 = await this.request(step2Channel, req2, 28);
        if (notif2) {
            const wb2 = [...notif2];
            wb2[0] = 0x06;
            const withCityData = wb2.concat(this.buildWorldCityRecords());
            await CasioIO.writeCmd(GET_SET_MODE.SP_DATA, withCityData);
        } else {
            console.warn("GwBx5600TimeIO Step2: no response from watch");
            return;
        }

        // Step 3/4: World City Names Echo
        console.info("Step 3/4: city names");
        let req3 = [0x06];
        for (let i = 0; i < watchInfo.worldCitiesCount; i++) {
            const idx = Math.floor(i / 2) + (i % 2 !== 0 ? 6 : 0);
            req3.push(CasioConstants.CHARACTERISTICS.CASIO_WORLD_CITIES, idx);
        }
        const notif3 = await this.request(step3Channel, req3, 1 + (watchInfo.worldCitiesCount * 22));
        if (notif3) {
            await CasioIO.writeCmd(GET_SET_MODE.SP_DATA, notif3);
        } else {
            console.warn("GwBx5600TimeIO Step3: no response from watch");
            return;
        }

        // Step 4/4: Write Current Time Command
        this.writeTimeCommand(now);
        console.info("GwBx5600TimeIO.set: complete");
    },

    buildWorldCityRecords(): number[] {
        const casioTimezone = TimeIO.state.casioTimezone;
        const { lat, lon } = CasioTimeZoneHelper.getWorldCityCoordinates(casioTimezone.zoneId);

        // Check if in DST
        const nowOffset = dayjs().tz(casioTimezone.zoneId).utcOffset();
        const { stdOffset } = CasioTimeZoneHelper.getStandardAndSummerOffsets(casioTimezone.zoneId);
        const isInDST = nowOffset > stdOffset;
        const dstValue = isInDST ? 1 : 0;

        const homeRecord = this.cityRecord(0, lat, lon, dstValue);
        const emptySlot1 = this.cityRecord(1, EMPTY_SLOT_LAT, EMPTY_SLOT_LON, EMPTY_SLOT_TRAILING);
        const emptySlot2 = this.cityRecord(2, EMPTY_SLOT_LAT, EMPTY_SLOT_LON, EMPTY_SLOT_TRAILING);

        return [...homeRecord, ...emptySlot1, ...emptySlot2];
    },

    cityRecord(slotIndex: number, lat: number, lon: number, trailing: number): number[] {
        const buffer = new ArrayBuffer(22);
        const view = new DataView(buffer);
        view.setUint8(0, 0x14);
        view.setUint8(1, 0x00);
        view.setUint8(2, 0x24);
        view.setUint8(3, slotIndex);
        view.setUint8(4, CITY_RECORD_FLAG);
        view.setFloat64(5, lat, false); // Big Endian
        view.setFloat64(13, lon, false); // Big Endian
        view.setUint8(21, trailing);
        return Array.from(new Uint8Array(buffer));
    },

    async request(channel: StepChannel, reqPayload: number[], expected: number): Promise<number[] | null> {
        channel.expectedBytes = expected;
        channel.accumulator = [];
        const promise = new Promise<number[]>((resolve) => {
            channel.resolver = resolve;
        });

        await CasioIO.writeCmd(GET_SET_MODE.SP_REQUEST, reqPayload);

        const timeout = setTimeout(() => {
            if (channel.resolver) {
                channel.resolver([]);
                channel.resolver = null;
            }
        }, 5000);

        const result = await promise;
        clearTimeout(timeout);
        return result.length === expected ? result : null;
    },

    writeTimeCommand(now: dayjs.Dayjs) {
        // Sun=0 in dayjs, Casio Sun=7 or 0?
        // Kotlin: if (now.dayOfWeek == DayOfWeek.SUNDAY) 7 else now.dayOfWeek.value
        // dayjs: 0=Sun, 1=Mon...
        const casioDow = now.day() === 0 ? 7 : now.day();
        const subSecondByte = Math.floor((now.millisecond() * 256) / 1000);

        const timeCmd = [
            0x09, // CLASS_C_TIME_CURRENT_TIME
            now.year() & 0xFF,
            (now.year() >> 8) & 0xFF,
            now.month() + 1,
            now.date(),
            now.hour(),
            now.minute(),
            now.second(),
            casioDow,
            subSecondByte,
            0x01 // Manual Update
        ];

        CasioIO.writeCmd(GET_SET_MODE.SET, timeCmd);
    },

    onReceivedFor(channel: StepChannel, data: string) {
        if (!channel.resolver) return;

        const bytes = Utils.hexToBytes(data);
        channel.accumulator = channel.accumulator.concat(bytes);

        if (channel.accumulator.length >= channel.expectedBytes) {
            const res = channel.resolver;
            channel.resolver = null;
            res(channel.accumulator);
        }
    },

    onReceivedStep1(data: string) { this.onReceivedFor(step1Channel, data); },
    onReceivedStep2(data: string) { this.onReceivedFor(step2Channel, data); },
    onReceivedStep3(data: string) { this.onReceivedFor(step3Channel, data); }
};

export default GwBx5600TimeIO;
