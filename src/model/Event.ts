import ReminderData from "@/pages/reminders/ReminderData";
import Utils from "@utils/Utils";
import dayjs, { Dayjs } from "dayjs";
import { eventNames } from "process";

class Event {
    title: string;
    startDate: {
        year: number;
        month: string;
        day: number;
    };
    endDate: {
        year: number;
        month: string;
        day: number;
    };
    repeatPeriod: string;
    daysOfWeek: string[];
    enabled: boolean;
    incompatible: boolean;

    constructor(
        title: string,
        startDate: { year: number; month: string; day: number },
        endDate: { year: number; month: string; day: number },
        repeatPeriod: string,
        daysOfWeek: string[],
        enabled: boolean,
        incompatible: boolean,
    ) {
        this.title = title;
        this.startDate = startDate;
        this.endDate = endDate;

        if (!this.endDate) {
            this.endDate = startDate;
        }

        this.repeatPeriod = repeatPeriod;
        this.daysOfWeek = daysOfWeek;
        this.enabled = enabled;
        this.incompatible = incompatible;
    }

    static createEvent(json: any): Event {
        function getArrayListFromJSONArray(jsonArray: any[]): string[] {
            const list: string[] = [];

            function stringToDayOfWeek(dayStr: string): string {
                switch (dayStr) {
                    case "MONDAY":
                        return "MONDAY";
                    case "TUESDAY":
                        return "TUESDAY";
                    case "WEDNESDAY":
                        return "WEDNESDAY";
                    case "THURSDAY":
                        return "THURSDAY";
                    case "FRIDAY":
                        return "FRIDAY";
                    case "SATURDAY":
                        return "SATURDAY";
                    case "SUNDAY":
                        return "SUNDAY";
                    default:
                        return "MONDAY";
                }
            }

            for (let i = 0; i < jsonArray.length; i++) {
                const dayStr = jsonArray[i];
                const dayOfWeek = stringToDayOfWeek(dayStr);
                list.push(dayOfWeek);
            }
            return list;
        }

        function stringToMonth(monthStr: string): string {
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

        const stringToRepeatPeriod = (repeatPeriodStr: string): string => {
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

        const timeObj = json.time;
        const title = Utils.trimNonAsciiCharacters(json.title);

        const startDate = timeObj.startDate;
        const endDate = timeObj.endDate;
        const weekDays = timeObj.daysOfWeek;
        const enabled = timeObj.enabled || false;
        const incompatible = timeObj.incompatible || false;
        const repeatPeriod = stringToRepeatPeriod(timeObj.repeatPeriod);

        return new Event(
            title,
            {
                year: startDate.year,
                month: stringToMonth(startDate.month),
                day: startDate.day,
            },
            {
                year: endDate.year,
                month: stringToMonth(endDate.month),
                day: endDate.day,
            },
            repeatPeriod,
            getArrayListFromJSONArray(weekDays),
            enabled,
            incompatible,
        );
    }

    update(reminder: ReminderData): void {
        this.title = reminder.title;
        this.startDate = reminder.startDate;
        this.endDate = reminder.endDate ? reminder.endDate : reminder.startDate;
        this.repeatPeriod = reminder.repeatPeriod;
        this.daysOfWeek = reminder.daysOfWeek;
        this.enabled = reminder.enabled;
        this.incompatible = reminder.incompatible;
    }

    calculateEndDateFromOccurences(
        numberOfPeriods: number,
        startDate: { year: number; month: string; day: number },
        repeatPeriod: string,
        daysOfWeek: string[]
    ): { year: number; month: string; day: number } {

        const toDayJsDate = (date: { year: number, month: string, day: number } | null): Dayjs => {
            if (!date) {
                return dayjs();
            }

            const { year, month, day } = date;

            const dateString = `${year}-${month}-${day}`;
            const dayjsDate = dayjs(dateString, { format: 'YYYY-MMMM-DD' });

            return dayjsDate;
        }

        const fromDayJsDate = (date: Dayjs): { year: number, month: string, day: number } => {
            const dayjsDate = dayjs(date);
            return { year: dayjsDate.year(), month: dayjsDate.format("MMMM"), day: dayjsDate.date() }
        }

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
                    endDate.add(numberOfPeriods, "day");
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
                    endDate.add(numberOfPeriods, "month");
                    break;
                }
                case "YEARLY": {
                    endDate.add(numberOfPeriods, "year");
                    break;
                }
                default:
                    break;
            }
        }

        return fromDayJsDate(endDate)
    }

    getPeriodFormatted(): string {
        let period = "";
        const thisYear = new Date().getFullYear();

        const dayEquals = (thisStartDate: any, thisEndDate: any) => {
            return (
                thisStartDate.year === thisEndDate.year &&
                thisStartDate.month === thisEndDate.month &&
                thisStartDate.day === thisEndDate.day
            );
        }

        if (this.startDate) {
            period += `${this.capitalizeFirstAndTrim(
                this.startDate.month,
                3
            )}-${this.startDate.day}`;
            if (thisYear !== this.startDate.year) {
                period += `, ${this.startDate.year}`;
            }
        }
        if (
            this.endDate &&
            !dayEquals(this.startDate, this.endDate)
        ) {
            period += ` to ${this.capitalizeFirstAndTrim(
                this.endDate.month,
                3
            )}-${this.endDate.day}`;
            if (thisYear !== this.endDate.year) {
                period += `, ${this.endDate.year}`;
            }
        }
        return period;
    }

    getDaysOfWeekFormatted(): string {
        let daysOfWeekStr = "";
        if (this.daysOfWeek && this.daysOfWeek.length > 0) {
            this.daysOfWeek.forEach((day) => {
                daysOfWeekStr += `${this.capitalizeFirstAndTrim(
                    day,
                    3
                )},`;
            });
        } else {
            return "";
        }

        return daysOfWeekStr.slice(0, -1);
    }

    getFrequencyFormatted(): string {
        let formattedFreq = "";
        switch (this.repeatPeriod) {
            case "WEEKLY":
                formattedFreq = this.getDaysOfWeekFormatted();
                break;
            case "YEARLY":
                formattedFreq = `${this.capitalizeFirstAndTrim(
                    this.startDate.month,
                    3
                )}-${this.startDate.day}${this.getDayOfMonthSuffix(
                    this.startDate.day
                )} each year`;
                break;
            case "MONTHLY":
                formattedFreq = `${this.startDate.day}${this.getDayOfMonthSuffix(
                    this.startDate.day
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

    capitalizeFirstAndTrim(inStr: string, len: number): string {
        return inStr.toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase())
            .substring(0, 3);
    }

    getDayOfMonthSuffix(n: number): string {
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

    toString(): string {
        return `Event(title='${this.title}', startDate=${JSON.stringify(
            this.startDate
        )}, endDate=${JSON.stringify(
            this.endDate
        )}, repeatPeriod='${this.repeatPeriod}', daysOfWeek=${JSON.stringify(
            this.daysOfWeek
        )}, enabled=${this.enabled}, incompatible=${this.incompatible})`;
    }
}

export default Event;
