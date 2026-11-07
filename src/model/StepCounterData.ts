export interface StepCounterData {
    timestamp?: string | null;
    dayOfWeek: number;
    month: number;
    dayOfMonth: number;
    hourlySteps: (number | null)[];
    dailyHistory: (number | null)[];
    dailyDistances?: (number | null)[];
    currentDaySteps: number | null;
    distanceMeters?: number | null;
    totalDistanceMeters?: number | null;
    bcdTotalSteps?: number | null;
}

export const StepCounterData = {
    unavailable: (): StepCounterData => ({
        timestamp: null,
        dayOfWeek: 0,
        month: 0,
        dayOfMonth: 0,
        hourlySteps: [],
        dailyHistory: [],
        dailyDistances: [],
        currentDaySteps: null,
        distanceMeters: null,
        totalDistanceMeters: null,
        bcdTotalSteps: null
    })
};

export const resolveDistanceKm = (stepData: StepCounterData, strideMeters: number = 0.73): number => {
    const steps = stepData.currentDaySteps ?? 0;
    const rawDistanceMeters = stepData.distanceMeters;

    if (rawDistanceMeters != null && rawDistanceMeters > 0) {
        const minReasonableMeters = Math.floor(steps * 0.4);
        const maxReasonableMeters = Math.floor(steps * 0.85);
        if (rawDistanceMeters >= minReasonableMeters && rawDistanceMeters <= maxReasonableMeters) {
            return rawDistanceMeters / 1000;
        }
    }

    return (steps * strideMeters) / 1000;
};

export const hasNoStepData = (stepData: StepCounterData): boolean =>
    stepData.currentDaySteps === null &&
    stepData.distanceMeters === null &&
    stepData.totalDistanceMeters === null;

export const calculateStepMetrics = (
    stepData: StepCounterData,
    weightKg: number = 70
): { distanceKm: number; calories: number } => {
    const distanceKm = resolveDistanceKm(stepData);
    const calories = distanceKm * weightKg * 1.036;
    return { distanceKm, calories };
};
