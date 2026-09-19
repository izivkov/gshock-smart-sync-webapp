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
