export type ExerciseUnits = 'metric' | 'imperial';

/**
 * height and weight are stored exactly as the user entered them:
 * cm and kg when units === 'metric', inches and lb when units === 'imperial'.
 */
export interface ExerciseProfile {
  stepGoal: number;
  height: number;
  weight: number;
  units: ExerciseUnits;
  locale: string;
}

/** Metric values sent to or read from the watch. */
export interface WatchMetrics {
  heightCm: number;
  weightKg: number;
}

const IMPERIAL_REGIONS = new Set(['US', 'CA']);
const CM_PER_INCH = 2.54;
const KG_PER_LB = 0.45359237;

const DEFAULT_STEP_GOAL = 10000;

/** Starting values per unit system (170 cm / 70 kg expressed in display units). */
const DEFAULT_BODY: Record<ExerciseUnits, { height: number; weight: number }> = {
  metric: { height: 170, weight: 70 },
  imperial: { height: 67, weight: 154 },
};

const systemLocale = (): string => Intl.DateTimeFormat().resolvedOptions().locale;

const toNumber = (value: unknown, fallback: number): number => {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const detectExerciseUnits = (locale: string = systemLocale()): ExerciseUnits => {
  const region = locale.split('-').pop()?.toUpperCase() ?? '';
  return IMPERIAL_REGIONS.has(region) ? 'imperial' : 'metric';
};

export const normalizeExerciseProfile = (profile: Partial<ExerciseProfile> = {}): ExerciseProfile => {
  const locale = profile.locale || systemLocale();
  const units = profile.units ?? detectExerciseUnits(locale);
  const defaults = DEFAULT_BODY[units];

  return {
    stepGoal: toNumber(profile.stepGoal, DEFAULT_STEP_GOAL),
    height: toNumber(profile.height, defaults.height),
    weight: toNumber(profile.weight, defaults.weight),
    units,
    locale,
  };
};

export const defaultExerciseProfile = (): ExerciseProfile => normalizeExerciseProfile({});

/** Converts the profile's entered height/weight to metric for the watch. */
export const toWatchMetrics = (profile: ExerciseProfile): WatchMetrics =>
  profile.units === 'imperial'
    ? {
        heightCm: profile.height * CM_PER_INCH,
        weightKg: profile.weight * KG_PER_LB,
      }
    : {
        heightCm: profile.height,
        weightKg: profile.weight,
      };

/** Converts metric values read from the watch into the display units of the given system. */
export const fromWatchMetrics = (
  metrics: WatchMetrics,
  units: ExerciseUnits,
): Pick<ExerciseProfile, 'height' | 'weight'> =>
  units === 'imperial'
    ? {
        height: metrics.heightCm / CM_PER_INCH,
        weight: metrics.weightKg / KG_PER_LB,
      }
    : {
        height: metrics.heightCm,
        weight: metrics.weightKg,
      };
      