import CasioIO, { GET_SET_MODE } from "@io/CasioIO";
import { watchInfo } from "@/api/WatchInfo";
import { StepCounterData } from "@model/StepCounterData";
import { StepCounterIOFunctional } from "./StepCounterIOFunctional";
import Utils from "@utils/Utils";

const FALLBACK_EXPECTED_LENGTH = 400;
const DRSP_CATEGORY_EXERCISE = 0x11;
const START_TRANSACTION_CMD = [0x00, DRSP_CATEGORY_EXERCISE, 0x00, 0x00, 0x00];
const END_TRANSACTION_CMD = [0x04, DRSP_CATEGORY_EXERCISE, 0x00, 0x00, 0x00];

let accumulator: number[] = [];
let expectedLength: number = FALLBACK_EXPECTED_LENGTH;
let resolver: ((value: StepCounterData) => void) | null = null;
let lastData: StepCounterData | null = null;

const StepCounterIO = {
    async request(peek: boolean = true): Promise<StepCounterData> {
        if (!watchInfo.hasStepCounter) {
            console.log("Step counter not supported on watch model: " + watchInfo.model);
            return StepCounterData.unavailable();
        }

        // If we are peeking and an app transaction is already active, return cached data
        if (peek && resolver && lastData) {
            console.log("StepCounterIO: App transaction already active, returning cached data.");
            return lastData;
        }

        return this.getStepCount(peek);
    },

    async getStepCount(peek: boolean): Promise<StepCounterData> {
        accumulator = [];
        expectedLength = FALLBACK_EXPECTED_LENGTH;

        const promise = new Promise<StepCounterData>((resolve) => {
            resolver = resolve;
        });

        await CasioIO.writeCmd(GET_SET_MODE.DATA_REQUEST, START_TRANSACTION_CMD);

        // Timeout 10s
        const timeout = setTimeout(() => {
            if (resolver) {
                console.warn(`StepCounterIO: timed out waiting for activity record (accumulated ${accumulator.length}/${expectedLength}B)`);
                resolver(StepCounterData.unavailable());
                resolver = null;
            }
        }, 10000);

        const result = await promise;
        clearTimeout(timeout);
        return result;
    },

    onDrspReceived(data: number[]) {
        if (data.length < 5) return;
        const command = data[0] & 0xFF;
        const category = data[1] & 0xFF;
        if (category !== DRSP_CATEGORY_EXERCISE) return;

        if (command === 0x00) {
            const length = (data[2] & 0xFF) |
                    ((data[3] & 0xFF) << 8) |
                    ((data[4] & 0xFF) << 16);
            if (resolver) {
                expectedLength = length;
                console.log(`StepCounterIO: expected length announced = ${length}B`);
            }
        }
    },

    async onReceived(data: string) {
        if (!resolver) return;

        try {
            const bytes = Utils.hexToBytes(data);
            accumulator = accumulator.concat(bytes);

            console.debug(`StepCounterIO.onReceived: accumulated=${accumulator.length}B / expected=${expectedLength}B`);

            if (accumulator.length < expectedLength) {
                return;
            }

            // Full payload assembled
            // We don't always end transaction if we want to allow the watch to keep sending?
            // Kotlin ends it if NOT peeking.
            // For now, let's follow Kotlin.

            // Note: peek mode is not fully implemented in the request flow yet,
            // but we'll end the transaction here to be safe and match the basic flow.
            await CasioIO.writeCmd(GET_SET_MODE.DATA_REQUEST, END_TRANSACTION_CMD);

            const stepData = StepCounterIOFunctional.parse(accumulator);
            if (stepData) {
                console.info("Step count parsed", stepData);
                lastData = stepData;
                resolver(stepData);
            } else {
                console.warn("Failed to parse activity record");
                resolver(StepCounterData.unavailable());
            }
            resolver = null;
        } catch (e) {
            console.error("Exception parsing step counter data", e);
            if (resolver) {
                resolver(StepCounterData.unavailable());
                resolver = null;
            }
        }
    }
};

export default StepCounterIO;
