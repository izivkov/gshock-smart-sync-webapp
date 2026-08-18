import { CasioConstants } from "@api/CasioConstants";
import { cachedIO } from "@io/CachedIO";
import CasioIO, { GET_SET_MODE } from "@io/CasioIO";
import { watchInfo } from "@/api/WatchInfo";
import { TimeAdjustmentInfo } from "@api/TimeAdjustmentInfo";

export const TimeAdjustmentIOFunctional = {
    parseIsTimeAdjustmentSet(data: number[]): boolean {
        return data[12] === 0;
    },

    parseAdjustmentTimeMinutes(data: number[]): number {
        const minutesRead = data[13];
        return (minutesRead >= 0 && minutesRead <= 59) ? minutesRead : 30;
    },

    decode(data: number[]): TimeAdjustmentInfo {
        return {
            isTimeAdjustmentSet: this.parseIsTimeAdjustmentSet(data),
            adjustmentTimeMinutes: this.parseAdjustmentTimeMinutes(data)
        };
    },

    encode(originalData: number[], settings: any): number[] {
        if (!originalData || originalData.length === 0) {
            return [];
        }

        const result = [...originalData];
        result[12] = settings.timeAdjustment ? 0x00 : 0x80;
        if (settings.adjustmentTimeMinutes !== undefined) {
            result[13] = settings.adjustmentTimeMinutes;
        }
        return result;
    }
};

let resolver: ((value: TimeAdjustmentInfo) => void) | null = null;

const CasioIsAutoTimeOriginalValue = {
    value: [] as number[],
};

const TimeAdjustmentIO = {
    async request(): Promise<TimeAdjustmentInfo> {
        if (!watchInfo.hasTimeAdjustment) {
            return { isTimeAdjustmentSet: false, adjustmentTimeMinutes: 0 };
        }
        return await cachedIO.request("GET_TIME_ADJUSTMENT", TimeAdjustmentIO.getTimeAdjustment);
    },

    async getTimeAdjustment(key: string): Promise<TimeAdjustmentInfo> {
        const promise = new Promise<TimeAdjustmentInfo>((resolve) => {
            resolver = resolve;
        });

        await TimeAdjustmentIO.sendToWatch("");

        return promise;
    },

    async set(settings: any): Promise<void> {
        cachedIO.delete("GET_TIME_ADJUSTMENT");
        await TimeAdjustmentIO.sendToWatchSet(JSON.stringify({ value: settings }));
    },

    onReceived(data: number[]) {
        CasioIsAutoTimeOriginalValue.value = data;
        const result = TimeAdjustmentIOFunctional.decode(data);
        if (resolver) {
            resolver(result);
            resolver = null;
        }
    },

    async sendToWatch(message: string): Promise<void> {
        await CasioIO.writeCmd(
            GET_SET_MODE.GET,
            [CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_BLE]
        );
    },

    async sendToWatchSet(message: string): Promise<void> {
        const settings = JSON.parse(message).value;
        const encoded = TimeAdjustmentIOFunctional.encode(CasioIsAutoTimeOriginalValue.value, settings);
        if (encoded.length > 0) {
            await CasioIO.writeCmd(GET_SET_MODE.SET, encoded);
        }
    }
};

export default TimeAdjustmentIO;
