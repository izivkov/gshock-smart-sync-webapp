export interface StepCounterData {
    dayOfWeek: number;
    month: number;
    dayOfMonth: number;
    hourlySteps: (number | null)[];
    dailyHistory: (number | null)[];
    currentDaySteps: number | null;
}

export const StepCounterData = {
    unavailable: (): StepCounterData => ({
        dayOfWeek: 0,
        month: 0,
        dayOfMonth: 0,
        hourlySteps: [],
        dailyHistory: [],
        currentDaySteps: null
    })
};
