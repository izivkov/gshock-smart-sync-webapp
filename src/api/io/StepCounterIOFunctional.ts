import { StepCounterData } from "@model/StepCounterData";

const HEADER_SIZE = 6;
const HOURLY_SLOT_COUNT = 144;
const HOURLY_SLOT_SIZE = 2;
const BETWEEN_HISTORY_PADDING_SIZE = 24;
const DAILY_SLOT_COUNT = 14;
const DAILY_SLOT_SIZE = 4;

export const StepCounterIOFunctional = {
    parse(payload: number[]): StepCounterData | null {
        const dailyHistoryOffset = HEADER_SIZE + HOURLY_SLOT_COUNT * HOURLY_SLOT_SIZE +
                BETWEEN_HISTORY_PADDING_SIZE;
        const currentDayOffset = dailyHistoryOffset + DAILY_SLOT_COUNT * DAILY_SLOT_SIZE;

        if (payload.length < currentDayOffset + DAILY_SLOT_SIZE || payload[0] !== 0x26) {
            return null;
        }

        const hourlySteps = Array.from({ length: HOURLY_SLOT_COUNT }, (_, index) => {
            return this.readUnsignedShortOrNull(payload, HEADER_SIZE + index * HOURLY_SLOT_SIZE);
        });

        const dailyHistory = Array.from({ length: DAILY_SLOT_COUNT }, (_, index) => {
            return this.readUnsignedIntOrNull(payload, dailyHistoryOffset + index * DAILY_SLOT_SIZE);
        });

        return {
            dayOfWeek: payload[1] & 0xFF,
            month: payload[2] & 0xFF,
            dayOfMonth: payload[3] & 0xFF,
            hourlySteps: hourlySteps,
            dailyHistory: dailyHistory,
            currentDaySteps: this.readUnsignedIntOrNull(payload, currentDayOffset),
        };
    },

    readUnsignedShortOrNull(payload: number[], offset: number): number | null {
        if (offset + 2 > payload.length) return null;
        const value = (payload[offset] & 0xFF) | ((payload[offset + 1] & 0xFF) << 8);
        return value === 0xFFFE ? null : value;
    },

    readUnsignedIntOrNull(payload: number[], offset: number): number | null {
        if (offset + 4 > payload.length) return null;
        const value = (payload[offset] & 0xFF) |
                ((payload[offset + 1] & 0xFF) << 8) |
                ((payload[offset + 2] & 0xFF) << 16) |
                ((payload[offset + 3] & 0xFF) << 24);
        // Using -2 sign-extended or 0xFFFFFFFE unsigned. In JS, bitwise ops are 32-bit.
        return value === -2 || value === 0xFFFFFFFE ? null : value;
    }
};
