import { StepCounterData } from "@model/StepCounterData";

/**
 * Generates mock step data representing 144 hours (6 days) of history.
 */
export function generateMockStepData(): StepCounterData {
    const now = new Date();

    const hourlySteps = Array.from({ length: 144 }, (_, index) => {
        // Last 6 slots (past 6 hours) always have significant data
        if (index >= 138) {
            return Math.floor(Math.random() * 1500) + 200;
        }
        // Random hourly activity for previous days
        return Math.random() > 0.2 ? Math.floor(Math.random() * 2000) : 0;
    });

    const dailyHistory = Array.from({ length: 14 }, () =>
        Math.floor(Math.random() * 8500) + 4000
    );

    return {
        dayOfWeek: now.getDay(),
        month: now.getMonth() + 1,
        dayOfMonth: now.getDate(),
        hourlySteps,
        dailyHistory,
        currentDaySteps: Math.floor(Math.random() * 2000) + 7500
    };
}
