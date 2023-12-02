import ReminderData, { monthType } from "@/pages/reminders/ReminderData";
import { stringToMonth, stringToRepeatPeriod } from "@/pages/reminders/ReminderUtils";
import Utils from "@utils/Utils";

class Event {
    title: string;
    startDate: {
        year: number;
        month: monthType;
        day: number;
    };
    endDate: {
        year: number;
        month: monthType;
        day: number;
    };
    repeatPeriod: string;
    daysOfWeek: string[];
    enabled: boolean;
    incompatible: boolean;

    constructor(
        title: string,
        startDate: { year: number; month: monthType; day: number },
        endDate: { year: number; month: monthType; day: number },
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

