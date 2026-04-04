export type dayOfWeekType = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
export type monthType = "JANUARY" | "FEBRUARY" | "MARCH" | "APRIL" | "MAY" | "JUNE" | "JULY" | "AUGUST" | "SEPTEMBER" | "OCTOBER" | "NOVEMBER" | "DECEMBER";
export type repeatPeriodType = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "NEVER";

interface ReminderData {

    daysOfWeek: dayOfWeekType[],
    enabled: boolean,
    endDate: {
        "year": number,
        "month": monthType,
        "day": number
    } | null,

    startDate: {
        "year": number,
        "month": monthType,
        "day": number
    },

    incompatible: boolean,
    repeatPeriod: repeatPeriodType,
    occurrences: number,

    title: string,
}

export default ReminderData