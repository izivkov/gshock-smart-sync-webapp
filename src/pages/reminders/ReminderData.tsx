import exp from "constants"

export type dayOfWeekType = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
export type repeatPeriodType = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "NEVER";

interface ReminderData {

    daysOfWeek: dayOfWeekType[],
    enabled: boolean,
    endDate: {
        "year": number,
        "month": string,
        "day": number
    } | null,

    startDate: {
        "year": number,
        "month": string,
        "day": number
    },

    incompatible: boolean,
    repeatPeriod: repeatPeriodType,
    occurrences: number,

    title: string,
}

export default ReminderData