import { cachedIO } from "@io/CachedIO";
import CasioIO, { GET_SET_MODE } from "@io/CasioIO";
import { CasioConstants } from "@api/CasioConstants";
import { defaultExerciseProfile, ExerciseProfile, normalizeExerciseProfile } from "@model/ExerciseProfile";

const EXERCISE_PROFILE_KEY = 'GET_EXERCISE_PROFILE';
const OPCODE = 0x2d;

let resolver: ((value: ExerciseProfile) => void) | null = null;
let lastProfile: ExerciseProfile = defaultExerciseProfile();

export const ExerciseIOFunctional = {
    toBcdLe(value: number, length: number): number[] {
        let remaining = Math.max(0, Math.trunc(value));
        const output = new Array(length).fill(0);

        for (let index = 0; index < length; index += 1) {
            const current = remaining % 100;
            remaining = Math.floor(remaining / 100);
            output[index] = ((Math.floor(current / 10) * 16) + (current % 10)) & 0xff;
        }

        return output;
    },

    bcdLe(bytes: number[]): number {
        let total = 0;
        let multiplier = 1;

        for (const byte of bytes) {
            const unsignedValue = (byte & 0xff);
            const highDigit = (unsignedValue >> 4) & 0x0f;
            const lowDigit = unsignedValue & 0x0f;
            total += ((highDigit * 10) + lowDigit) * multiplier;
            multiplier *= 100;
        }

        return total;
    },

    invert(bytes: number[]): number[] {
        return bytes.map(byte => (0xff - (byte & 0xff)) & 0xff);
    },

    encode(profile: ExerciseProfile): number[] {
        const normalized = normalizeExerciseProfile(profile);
        const stepGoalBytes = this.toBcdLe(normalized.stepGoal, 4);
        const heightBytes = this.invert(this.toBcdLe(Math.round(normalized.height), 2));
        const weightBytes = this.invert(this.toBcdLe(Math.round(normalized.weight), 2));

        return [OPCODE, 0x00, ...stepGoalBytes, ...heightBytes, ...weightBytes];
    },

    decode(data: number[]): ExerciseProfile {
        if (!data.length || data[0] !== OPCODE) {
            throw new Error('not an exercise payload');
        }

        const stepGoal = this.bcdLe(data.slice(2, 6));
        const height = this.bcdLe(this.invert(data.slice(6, 8)));
        const weight = this.bcdLe(this.invert(data.slice(8, 10)));

        return normalizeExerciseProfile({
            ...lastProfile,
            stepGoal,
            height,
            weight,
        });
    },
};

const ExerciseIO = {
    async request(): Promise<ExerciseProfile> {
        return await cachedIO.request(EXERCISE_PROFILE_KEY, ExerciseIO.getExerciseProfile);
    },

    async getExerciseProfile(key: string): Promise<ExerciseProfile> {
        const promise = new Promise<ExerciseProfile>((resolve) => {
            resolver = resolve;
        });
        await CasioIO.writeCmd(GET_SET_MODE.GET, [CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_EXERCISE]);
        return promise;
    },

    async set(profile: ExerciseProfile): Promise<void> {
        const normalized = normalizeExerciseProfile(profile);
        lastProfile = normalized;
        cachedIO.put(EXERCISE_PROFILE_KEY, normalized);
        await CasioIO.writeCmd(GET_SET_MODE.SET, ExerciseIOFunctional.encode(normalized));
    },

    onReceived(data: number[]) {
        try {
            const result = ExerciseIOFunctional.decode(data);
            lastProfile = result;
            cachedIO.put(EXERCISE_PROFILE_KEY, result);

            if (resolver) {
                resolver(result);
                resolver = null;
            }
        } catch (error) {
            console.warn('Exercise profile decode failed', error);
        }
    },

    async sendToWatch(message: string): Promise<void> {
        await CasioIO.writeCmd(GET_SET_MODE.GET, [CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_EXERCISE]);
    },

    async sendToWatchSet(message: string): Promise<void> {
        const payload = JSON.parse(message).value ?? {};
        const normalized = normalizeExerciseProfile({
            ...lastProfile,
            stepGoal: Number(payload.stepGoal ?? lastProfile.stepGoal),
            height: Number(payload.height ?? lastProfile.height),
            weight: Number(payload.weight ?? lastProfile.weight),
        });
        await ExerciseIO.set(normalized);
    },
};

export default ExerciseIO;
