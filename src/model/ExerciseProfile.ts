export const CM_PER_INCH = 2.54;
export const KG_PER_POUND = 0.45359237;

/**
 * Metric is the source of truth, matching the watch: height in whole cm, weight in whole kg.
 * Imperial getters and converter functions mirror org.avmedia.gshockapi.model.ExerciseProfile in GShockAPI.
 */
export interface ExerciseProfile {
  stepGoal: number;
  height: number; // cm
  weight: number; // kg
}

export const isImperialLocale = (localeStr?: string): boolean => {
  const loc = localeStr || (typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().locale : 'en-US');
  const country = loc.split('-').pop()?.toUpperCase() ?? '';
  return ['US', 'CA', 'LR', 'MM'].includes(country);
};

export const defaultExerciseProfile = (): ExerciseProfile => ({
  stepGoal: 10000,
  height: 170, // cm
  weight: 70,  // kg
});

export const getHeightInches = (heightCm: number): number => heightCm / CM_PER_INCH;

export const getWeightPounds = (weightKg: number): number => weightKg / KG_PER_POUND;

export const withHeightInches = (profile: ExerciseProfile, inches: number): ExerciseProfile => ({
  ...profile,
  height: Math.round(inches * CM_PER_INCH),
});

export const withWeightPounds = (profile: ExerciseProfile, pounds: number): ExerciseProfile => ({
  ...profile,
  weight: Math.round(pounds * KG_PER_POUND),
});

export const normalizeExerciseProfile = (profile?: Partial<ExerciseProfile>): ExerciseProfile => ({
  stepGoal: profile?.stepGoal ?? 10000,
  height: profile?.height ?? 170,
  weight: profile?.weight ?? 70,
});
