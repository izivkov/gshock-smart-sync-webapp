import { defaultExerciseProfile, ExerciseProfile, normalizeExerciseProfile } from "@model/ExerciseProfile";

const EXERCISE_PROFILE_KEY = 'exerciseProfile';

const ExerciseIO = {
    async request(): Promise<ExerciseProfile> {
        try {
            const rawValue = localStorage.getItem(EXERCISE_PROFILE_KEY);
            if (rawValue) {
                return normalizeExerciseProfile(JSON.parse(rawValue));
            }
        } catch (error) {
            console.warn('Exercise profile read failed, using default profile', error);
        }

        const profile = defaultExerciseProfile();
        localStorage.setItem(EXERCISE_PROFILE_KEY, JSON.stringify(profile));
        return profile;
    },

    async set(profile: ExerciseProfile): Promise<void> {
        const normalized = normalizeExerciseProfile(profile);
        localStorage.setItem(EXERCISE_PROFILE_KEY, JSON.stringify(normalized));
    },
};

export default ExerciseIO;
