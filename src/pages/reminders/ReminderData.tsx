import exp from "constants"

interface ReminderData {
    time: {
        enabled: boolean,
        startDate: {
            "year": number,
            "month": string,
            "day": number
        },
        endDate: {
            "year": number,
            "month": string,
            "day": number
        },
        repeatOption: string,
        repeatPeriod: string,
        occurrences: number,

        daysOfWeek: string[]
        // "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY"
    },
    title: string,
}

export default ReminderData