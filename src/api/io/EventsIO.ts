import { CasioConstants } from "@api/CasioConstants";
import { cachedIO } from "@io/CachedIO";
import CasioIO, { GET_SET_MODE } from "@io/CasioIO";
import Utils from "@utils/Utils";
import ReminderMasks from "@api/ReminderMasks";
import Event from "@model/Event";

interface Reminder {
    enabled: boolean;
    repeatPeriod: string;
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
    daysOfWeek: string[];
}

let resolver: ((value: Event) => void) | null = null;

class AccumulatedValueHolder {
    title: string = "";
}

const accumulatedValueHolder = new AccumulatedValueHolder();

const EventsIO = {
    async request(eventNumber: number): Promise<Event> {
        return cachedIO.request(eventNumber.toString(), (key) => this.getEventFromWatch(key));
    },

    async getEventFromWatch(eventNumber: string): Promise<Event> {
        await CasioIO.writeCmdFromString(GET_SET_MODE.GET, "30" + eventNumber);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await CasioIO.writeCmdFromString(GET_SET_MODE.GET, "31" + eventNumber);

        return new Promise<Event>((resolve) => {
            resolver = resolve;
        });
    },

    async setEvents(events: Event[]): Promise<void> {
        cachedIO.clearCache();
        await this.sendToWatchSet(JSON.stringify({ value: events }));
    },

    onReceived(data: number[]): any {
        const decoded: any = ReminderDecoder.reminderTimeToJson(data.slice(2))
        decoded["title"] = accumulatedValueHolder.title
        const event = Event.createEvent(decoded)
        if (resolver) {
            resolver(event);
            resolver = null;
        }
    },

    onReceivedTitle(data: number[]): any {
        const decoded: any = ReminderDecoder.reminderTitleToJson(data)
        accumulatedValueHolder.title = decoded["title"] as string
    },

    async sendToWatchSet(message: string): Promise<void> {
        const remindersJsonArr = JSON.parse(message).value;
        console.log("EventsIO: Sending reminders to watch...", remindersJsonArr);

        for (let index = 0; index < remindersJsonArr.length; index++) {
            const reminderJson = remindersJsonArr[index];
            const title = reminderJson.title || '';

            const reminderTime = [
                CasioConstants.CHARACTERISTICS.CASIO_REMINDER_TIME,
                index + 1,
                ...ReminderEncoder.reminderTimeFromJson(reminderJson),
            ];

            const encodedTitle = Utils.toByteArray(title, 18);

            console.log(`EventsIO: Writing title for reminder ${index + 1}: ${title}`);
            await CasioIO.writeCmd(GET_SET_MODE.SET, [
                CasioConstants.CHARACTERISTICS.CASIO_REMINDER_TITLE,
                index + 1,
                ...Array.from(encodedTitle),
            ]);

            await new Promise(resolve => setTimeout(resolve, 150));

            console.log(`EventsIO: Writing time for reminder ${index + 1}`);
            await CasioIO.writeCmd(GET_SET_MODE.SET, reminderTime);

            await new Promise(resolve => setTimeout(resolve, 150));
        }

        console.log("EventsIO: Done sending reminders");
    },
}

const ReminderDecoder = {
    reminderTimeToJson(reminderStr: any): { end: string } | { time: Reminder } {
        const intArr = reminderStr;
        if (intArr[1] === 0xFF) {
            return { "end": "" };
        }

        const reminder = intArr;

        const reminderJson: Reminder = {
            enabled: false,
            repeatPeriod: "",
            startDate: {
                year: 0,
                month: "",
                day: 0
            },
            endDate: {
                year: 0,
                month: "",
                day: 0
            },
            daysOfWeek: []
        };

        const timePeriod = this.decodeTimePeriod(reminder[0]);
        reminderJson["enabled"] = timePeriod[0];
        reminderJson["repeatPeriod"] = timePeriod[1];

        const timeDetailMap = this.decodeTimeDetail(reminder);

        reminderJson["startDate"] = timeDetailMap["startDate"];
        reminderJson["endDate"] = timeDetailMap["endDate"];
        reminderJson["daysOfWeek"] = timeDetailMap["daysOfWeek"];

        return { "time": reminderJson };
    },

    decodeTimePeriod(timePeriod: number): [boolean, string] {
        let enabled = false;
        let repeatPeriod = "";

        if ((timePeriod & ReminderMasks.ENABLED_MASK) === ReminderMasks.ENABLED_MASK) {
            enabled = true;
        }

        if ((timePeriod & ReminderMasks.WEEKLY_MASK) === ReminderMasks.WEEKLY_MASK) {
            repeatPeriod = "WEEKLY";
        } else if ((timePeriod & ReminderMasks.MONTHLY_MASK) === ReminderMasks.MONTHLY_MASK) {
            repeatPeriod = "MONTHLY";
        } else if ((timePeriod & ReminderMasks.YEARLY_MASK) === ReminderMasks.YEARLY_MASK) {
            repeatPeriod = "YEARLY";
        } else {
            repeatPeriod = "NEVER";
        }
        return [enabled, repeatPeriod];
    },

    decodeTimeDetail(timeDetail: number[]): { startDate: any; endDate: any; daysOfWeek: string[] } {
        const result: { startDate: any; endDate: any; daysOfWeek: string[] } = {
            startDate: undefined,
            endDate: undefined,
            daysOfWeek: []
        };

        const startDate = this.decodeDate(timeDetail.slice(1));
        result["startDate"] = startDate;

        const endDate = this.decodeDate(timeDetail.slice(4));
        result["endDate"] = endDate;

        const dayOfWeek = timeDetail[7];
        const daysOfWeek: string[] = [];
        if ((dayOfWeek & ReminderMasks.SUNDAY_MASK) === ReminderMasks.SUNDAY_MASK) daysOfWeek.push("SUNDAY");
        if ((dayOfWeek & ReminderMasks.MONDAY_MASK) === ReminderMasks.MONDAY_MASK) daysOfWeek.push("MONDAY");
        if ((dayOfWeek & ReminderMasks.TUESDAY_MASK) === ReminderMasks.TUESDAY_MASK) daysOfWeek.push("TUESDAY");
        if ((dayOfWeek & ReminderMasks.WEDNESDAY_MASK) === ReminderMasks.WEDNESDAY_MASK) daysOfWeek.push("WEDNESDAY");
        if ((dayOfWeek & ReminderMasks.THURSDAY_MASK) === ReminderMasks.THURSDAY_MASK) daysOfWeek.push("THURSDAY");
        if ((dayOfWeek & ReminderMasks.FRIDAY_MASK) === ReminderMasks.FRIDAY_MASK) daysOfWeek.push("FRIDAY");
        if ((dayOfWeek & ReminderMasks.SATURDAY_MASK) === ReminderMasks.SATURDAY_MASK) daysOfWeek.push("SATURDAY");

        result["daysOfWeek"] = daysOfWeek;
        return result;
    },

    decodeDate(timeDetail: number[]): any {
        const date: any = {};
        try {
            date["year"] = this.decToHex(timeDetail[0]) + 2000;
            date["month"] = this.intToMonthStr(this.decToHex(timeDetail[1]));
            date["day"] = this.decToHex(timeDetail[2]);
        } catch (e) {
            console.error("Could not handle time: " + timeDetail);
        }
        return date;
    },

    decToHex(dec: number): number {
        return parseInt(dec.toString(16));
    },

    intToMonthStr(monthInt: number): string {
        const months = ["", "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
        return months[monthInt] || "";
    },

    reminderTitleToJson(titleByte: number[]): { title: string } | { end: string } {
        if (titleByte[2] === 0xFF) {
            return { "end": "" };
        }
        return { "title": Utils.toAsciiString(titleByte, 2) };
    },
};

const ReminderEncoder = {
    reminderTimeFromJson(reminderJson: Reminder): number[] {
        const enabled = reminderJson.enabled;
        const repeatPeriod = reminderJson.repeatPeriod;
        const startDate = reminderJson.startDate;
        const endDate = reminderJson.endDate;
        const daysOfWeek = reminderJson.daysOfWeek;

        let reminderCmd: number[] = [];
        reminderCmd = reminderCmd.concat(this.createTimePeriod(enabled, repeatPeriod));
        reminderCmd = reminderCmd.concat(this.createTimeDetail(repeatPeriod, startDate, endDate, daysOfWeek));

        return reminderCmd;
    },

    createTimeDetail(repeatPeriod: string, startDate: any, endDate: any, daysOfWeek: string[]): number[] {
        const timeDetail = new Array(8).fill(0);
        this.encodeDate(timeDetail, startDate, endDate);

        if (repeatPeriod === "WEEKLY") {
            let dayOfWeek = 0;
            if (daysOfWeek != null) {
                for (const day of daysOfWeek) {
                    switch (day) {
                        case "SUNDAY": dayOfWeek |= ReminderMasks.SUNDAY_MASK; break;
                        case "MONDAY": dayOfWeek |= ReminderMasks.MONDAY_MASK; break;
                        case "TUESDAY": dayOfWeek |= ReminderMasks.TUESDAY_MASK; break;
                        case "WEDNESDAY": dayOfWeek |= ReminderMasks.WEDNESDAY_MASK; break;
                        case "THURSDAY": dayOfWeek |= ReminderMasks.THURSDAY_MASK; break;
                        case "FRIDAY": dayOfWeek |= ReminderMasks.FRIDAY_MASK; break;
                        case "SATURDAY": dayOfWeek |= ReminderMasks.SATURDAY_MASK; break;
                    }
                }
            }
            timeDetail[6] = dayOfWeek;
        }

        return timeDetail;
    },

    encodeDate(timeDetail: number[], startDate: any, endDate: any): void {
        timeDetail[0] = this.decToHex(startDate.year % 2000);
        timeDetail[1] = this.decToHex(this.monthStrToInt(startDate.month));
        timeDetail[2] = this.decToHex(startDate.day);

        timeDetail[3] = this.decToHex(endDate.year % 2000);
        timeDetail[4] = this.decToHex(this.monthStrToInt(endDate.month));
        timeDetail[5] = this.decToHex(endDate.day);
    },

    decToHex(dateField: number): number {
        return parseInt(dateField.toString(), 16);
    },

    monthStrToInt(monthStr: string): number {
        const months: Record<string, number> = {
            "JANUARY": 1, "FEBRUARY": 2, "MARCH": 3, "APRIL": 4, "MAY": 5, "JUNE": 6,
            "JULY": 7, "AUGUST": 8, "SEPTEMBER": 9, "OCTOBER": 10, "NOVEMBER": 11, "DECEMBER": 12
        };
        return months[monthStr] || -1;
    },

    createTimePeriod(enabled: boolean, repeatPeriod: string): number {
        let timePeriod = 0;
        if (enabled === true) timePeriod |= 0b00000001;
        switch (repeatPeriod) {
            case "WEEKLY": timePeriod |= 0b00000100; break;
            case "MONTHLY": timePeriod |= 0b00010000; break;
            case "YEARLY": timePeriod |= 0b00001000; break;
        }
        return timePeriod;
    },
};

export default EventsIO;
