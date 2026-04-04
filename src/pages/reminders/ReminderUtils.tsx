import dayjs, { Dayjs } from "dayjs";
import { dayOfWeekType, monthType, repeatPeriodType } from "./ReminderData";

export const toDayJsDate = (date: { year: number, month: string, day: number } | null): Dayjs => {
    if (!date) {
        return dayjs();
    }

    const { year, month, day } = date;

    const dateString = `${year}-${month}-${day}`;
    const dayjsDate = dayjs(dateString, { format: 'YYYY-MMMM-DD' });

    return dayjsDate;
}

export const fromDayJsDate = (date: Dayjs): { year: number, month: monthType, day: number } => {
    const dayjsDate = dayjs(date);
    return { year: dayjsDate.year(), month: dayjsDate.format("MMMM"), day: dayjsDate.date() }
}

export const getFrequencyFormatted = (
    repeatPeriod: repeatPeriodType,
    startDate: { year: number, month: string, day: number },
    daysOfWeek: dayOfWeekType[]): string => {
    let formattedFreq = "";
    switch (repeatPeriod) {
        case "WEEKLY":
            formattedFreq = getDaysOfWeekFormatted(daysOfWeek);
            break;
        case "YEARLY":
            formattedFreq = `${capitalizeFirstAndTrim(
                startDate.month,
                3
            )}-${startDate.day}${getDayOfMonthSuffix(
                startDate.day
            )} each year`;
            break;
        case "MONTHLY":
            formattedFreq = `${startDate.day}${getDayOfMonthSuffix(
                startDate.day
            )} each month`;
            break;
        case "NEVER":
            console.log("Single-time event...");
            break;
        default:
            console.log("Invalid frequency format");
    }
    return formattedFreq;
}

export const getDaysOfWeekFormatted = (daysOfWeek: dayOfWeekType[]): string => {
    let daysOfWeekStr = "";
    if (daysOfWeek && daysOfWeek.length > 0) {
        daysOfWeek.forEach((day) => {
            daysOfWeekStr += `${capitalizeFirstAndTrim(
                day,
                3
            )},`;
        });
    } else {
        return "";
    }

    return daysOfWeekStr.slice(0, -1);
}

export const getDayOfMonthSuffix = (n: number): string => {
    if (!(n >= 1 && n <= 31)) {
        throw new Error("illegal day of month: " + n);
    }

    if (n >= 11 && n <= 13) {
        return "th";
    }
    switch (n % 10) {
        case 1:
            return "st";
        case 2:
            return "nd";
        case 3:
            return "rd";
        default:
            return "th";
    }
}


export const capitalizeFirstAndTrim = (inStr: string, len: number): string => {
    return inStr.toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .substring(0, 3);
}

export const calculateEndDateFromOccurences = (
    numberOfPeriods: number,
    startDate: { year: number; month: monthType; day: number },
    repeatPeriod: repeatPeriodType,
    daysOfWeek: dayOfWeekType[]
): { year: number; month: monthType; day: number } => {

    function calculateEndDateForWeekly(
        startDate: Dayjs,
        daysOfWeek: string[],
        n: number
    ): Dayjs {
        let endDate: Dayjs = dayjs(startDate);

        if (daysOfWeek.length === 0) {
            return endDate;
        }

        const daysOfWeekLocalDay: string[] = daysOfWeek.map((day) => {
            switch (day) {
                case "MONDAY":
                    return 'Monday';
                case "TUESDAY":
                    return 'Tuesday';
                case "WEDNESDAY":
                    return 'Wednesday';
                case "THURSDAY":
                    return 'Thursday';
                case "FRIDAY":
                    return 'Friday';
                case "SATURDAY":
                    return 'Saturday';
                case "SUNDAY":
                    return 'Sunday';
                default:
                    return '';
            }
        });

        let count = 0;
        while (count < n) {
            endDate = endDate.add(1, 'day');
            if (daysOfWeekLocalDay.includes(endDate.format('dddd'))) {
                count++;
            }
        }

        return endDate;
    }

    var endDate = toDayJsDate(startDate);

    if (numberOfPeriods > 0) {
        switch (repeatPeriod) {
            case "DAILY": {
                endDate = endDate.add(numberOfPeriods, "day");
                break;
            }
            case "WEEKLY": {
                endDate = calculateEndDateForWeekly(
                    toDayJsDate(startDate),
                    daysOfWeek,
                    numberOfPeriods
                )

                break;
            }
            case "MONTHLY": {
                endDate = endDate.add(numberOfPeriods, "month");
                break;
            }
            case "YEARLY": {
                endDate = endDate.add(numberOfPeriods, "year");
                break;
            }
            default:
                break;
        }
    }

    return fromDayJsDate(endDate)
}

export const getPeriodFormatted = (startDate: { year: number; month: string; day: number } | null,
    endDate: { year: number; month: string; day: number } | null): string => {
    let period = "";
    const thisYear = new Date().getFullYear();

    const dayEquals = (thisStartDate: any, thisEndDate: any) => {
        return (
            thisStartDate.year === thisEndDate.year &&
            thisStartDate.month === thisEndDate.month &&
            thisStartDate.day === thisEndDate.day
        );
    }

    if (startDate) {
        period += `${capitalizeFirstAndTrim(
            startDate.month,
            3
        )}-${startDate.day}`;
        if (thisYear !== startDate.year) {
            period += `, ${startDate.year}`;
        }
    }
    if (
        endDate &&
        !dayEquals(startDate, endDate)
    ) {
        period += ` to ${capitalizeFirstAndTrim(
            endDate.month,
            3
        )}-${endDate.day}`;
        if (thisYear !== endDate.year) {
            period += `, ${endDate.year}`;
        }
    }
    return period;
}

export const stringToMonth = (monthStr: string): monthType => {
    switch (monthStr.toLowerCase()) {
        case "january":
            return "JANUARY";
        case "february":
            return "FEBRUARY";
        case "march":
            return "MARCH";
        case "april":
            return "APRIL";
        case "may":
            return "MAY";
        case "june":
            return "JUNE";
        case "july":
            return "JULY";
        case "august":
            return "AUGUST";
        case "september":
            return "SEPTEMBER";
        case "october":
            return "OCTOBER";
        case "november":
            return "NOVEMBER";
        case "december":
            return "DECEMBER";
        default:
            return "JANUARY";
    }
}

export const stringToRepeatPeriod = (repeatPeriodStr: string): repeatPeriodType => {
    if (!repeatPeriodStr) {
        return "NEVER";
    }

    switch (repeatPeriodStr.toLowerCase()) {
        case "daily":
            return "DAILY";
        case "weekly":
            return "WEEKLY";
        case "monthly":
            return "MONTHLY";
        case "yearly":
            return "YEARLY";
        case "never":
            return "NEVER";
        default:
            throw new Error("Invalid Repeat Period");
    }
}




