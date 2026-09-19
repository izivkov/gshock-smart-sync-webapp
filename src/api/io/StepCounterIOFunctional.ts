import { StepCounterData } from "@model/StepCounterData";

const HEADER_SIZE = 6;
const ACTIVITY_RECORD_SIZE = 10;
const SENTINEL_BUCKET_VALUE = 0xFFFE;
const SENTINEL_DAILY_VALUE = -2; // 0xFFFFFFFE
const ACTIVITY_SCAN_LIMIT = 146;
const COMMITTED_DISTANCE_OFFSET = 246;
const COMMITTED_DISTANCE_END = 318;
const DAILY_SUMMARY_OFFSET = 318;
const DAILY_SUMMARY_COUNT = 7;
const DAILY_SUMMARY_SIZE = 8;
const CURRENT_STEPS_OFFSET = 374;
const CURRENT_DISTANCE_OFFSET = 378;
const PENDING_INTENSITY_OFFSET = 382;
const PENDING_DISTANCE_OFFSET = 392;
const BCD_TOTAL_OFFSET = 396;
const PACKET_HEADER_MARKER = 0x26;

export const StepCounterIOFunctional = {
    parse(payload: number[]): StepCounterData | null {
        if (payload.length === 0 || (payload[0] & 0xFF) !== PACKET_HEADER_MARKER) {
            return null;
        }

        let timestamp: string | null = null;
        if (payload.length >= 6) {
            try {
                const year = 2000 + this.decodeBcd(payload[0] & 0xFF);
                const month = this.decodeBcd(payload[1] & 0xFF);
                const day = this.decodeBcd(payload[2] & 0xFF);
                const hour = this.decodeBcd(payload[3] & 0xFF);
                const minute = this.decodeBcd(payload[4] & 0xFF);
                const second = this.decodeBcd(payload[5] & 0xFF);
                // Create ISO string
                timestamp = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
            } catch (e) {
                console.error("invalid BCD timestamp in step counter header", e);
            }
        }

        const currentDaySteps = this.readUnsignedIntOrNull(payload, CURRENT_STEPS_OFFSET);
        const actualCurrentDaySteps = currentDaySteps === SENTINEL_DAILY_VALUE ? null : currentDaySteps;

        let pendingSteps = 0;
        const pendingIntensity = new Int32Array(3);
        if (payload.length >= PENDING_INTENSITY_OFFSET + 6) {
            for (let i = 0; i < 3; i++) {
                const value = this.readUnsignedShortOrNull(payload, PENDING_INTENSITY_OFFSET + i * 2) || 0;
                pendingIntensity[i] = value;
                if (value !== SENTINEL_BUCKET_VALUE) {
                    pendingSteps += value;
                }
            }
        }

        let recordEnd = HEADER_SIZE;
        if (actualCurrentDaySteps !== null) {
            let minDiff = Number.MAX_SAFE_INTEGER;
            for (let end = HEADER_SIZE; end <= ACTIVITY_SCAN_LIMIT; end += ACTIVITY_RECORD_SIZE) {
                let frontTotal = 0;
                for (let offset = HEADER_SIZE; offset < end; offset += ACTIVITY_RECORD_SIZE) {
                    for (let i = 0; i < 5; i++) {
                        const bucket = this.readUnsignedShortOrNull(payload, offset + i * 2);
                        if (bucket !== null && bucket !== SENTINEL_BUCKET_VALUE) {
                            frontTotal += bucket;
                        }
                    }
                }
                const diff = Math.abs(actualCurrentDaySteps - pendingSteps - frontTotal);
                if (diff < minDiff) {
                    minDiff = diff;
                    recordEnd = end;
                }
            }
        }

        const activitySteps: (number | null)[] = [];
        for (let offset = HEADER_SIZE; offset < recordEnd; offset += ACTIVITY_RECORD_SIZE) {
            let steps = 0;
            for (let i = 0; i < 5; i++) {
                const bucket = this.readUnsignedShortOrNull(payload, offset + i * 2) || 0;
                if (bucket !== SENTINEL_BUCKET_VALUE) {
                    steps += bucket;
                }
            }
            activitySteps.push(steps > 0 ? steps : null);
        }

        const distanceMeters = this.readUnsignedIntOrNull(payload, CURRENT_DISTANCE_OFFSET);
        const dailyHistory: (number | null)[] = [];
        const dailyDistances: (number | null)[] = [];
        for (let i = 0; i < DAILY_SUMMARY_COUNT; i++) {
            const offset = DAILY_SUMMARY_OFFSET + i * DAILY_SUMMARY_SIZE;
            if (offset + DAILY_SUMMARY_SIZE > payload.length) break;

            const steps = this.readUnsignedIntOrNull(payload, offset);
            const distance = this.readUnsignedIntOrNull(payload, offset + 4);

            dailyHistory.push(steps === SENTINEL_DAILY_VALUE ? null : steps);
            dailyDistances.push(distance === SENTINEL_DAILY_VALUE ? null : distance);
        }

        let bcdTotalSteps: number | null = null;
        if (payload.length >= BCD_TOTAL_OFFSET + 4) {
            try {
                bcdTotalSteps = 0;
                for (let i = 0; i < 4; i++) {
                    const b = payload[BCD_TOTAL_OFFSET + i] & 0xFF;
                    if (b !== 0) {
                        bcdTotalSteps += this.decodeBcd(b) * Math.pow(100, i);
                    }
                }
            } catch (e) {
                bcdTotalSteps = null;
            }
        }

        return {
            timestamp: timestamp,
            dayOfWeek: timestamp ? new Date(timestamp).getDay() : 0,
            month: timestamp ? new Date(timestamp).getMonth() + 1 : 0,
            dayOfMonth: timestamp ? new Date(timestamp).getDate() : 0,
            hourlySteps: activitySteps,
            dailyHistory: dailyHistory,
            dailyDistances: dailyDistances,
            currentDaySteps: actualCurrentDaySteps,
            distanceMeters: distanceMeters,
            totalDistanceMeters: distanceMeters,
            bcdTotalSteps: bcdTotalSteps,
        };
    },

    decodeBcd(byte: number): number {
        const high = Math.floor(byte / 16);
        const low = byte % 16;
        if (high > 9 || low > 9) throw new Error("invalid BCD byte");
        return high * 10 + low;
    },

    readUnsignedShortOrNull(payload: number[], offset: number): number | null {
        if (offset + 2 > payload.length) return null;
        const value = (payload[offset] & 0xFF) | ((payload[offset + 1] & 0xFF) << 8);
        return value === 0xFFFF ? null : value;
    },

    readUnsignedIntOrNull(payload: number[], offset: number): number | null {
        if (offset + 4 > payload.length) return null;
        const value = (payload[offset] & 0xFF) |
                ((payload[offset + 1] & 0xFF) << 8) |
                ((payload[offset + 2] & 0xFF) << 16) |
                ((payload[offset + 3] & 0xFF) << 24);
        return value === -2 || value === 0xFFFFFFFE ? -2 : (value >>> 0);
    }
};
