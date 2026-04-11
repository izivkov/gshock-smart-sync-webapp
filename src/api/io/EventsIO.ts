import { CasioConstants } from "@api/CasioConstants";
import { cachedIO } from "@io/CachedIO";
import CasioIO from "@io/CasioIO";
import { connection } from "@api/Connection";
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

var deferredResult: Promise<Event>;
var resolver: ((value?: Event | PromiseLike<Event>) => void);

class AccumulatedValueHolder {
    title: string = "";
}

const accumulatedValueHolder = new AccumulatedValueHolder();

const EventsIO = {
    async request(eventNumber: number): Promise<Event> {
        return cachedIO.request(eventNumber.toString(), this.getEventFromWatch);
    },

    async getEventFromWatch(eventNumber: string): Promise<Event> {
        await CasioIO.request("30" + eventNumber); // reminder title
        
        // Small delay to ensure the watch processes the first request
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await CasioIO.request("31" + eventNumber); // reminder time

        deferredResult = new Promise<Event>((resolve) => {
            resolver = resolve as ((value?: Event | PromiseLike<Event>) => void);
        });

        return deferredResult;
    },

    async setEvents(events: Event[]): Promise<void> {
        function toJson(events: Event[]): Event[] {
            return events;
        }

        function getSelectedEvents(events: Event[]): Event[] {
            return events;
        }

        // Clear entire cache after saving to ensure all screens show fresh data
        cachedIO.clearCache();

        await connection.sendMessage(JSON.stringify({
            action: "SET_REMINDERS",
            value: getSelectedEvents(events),
        }));
    },

    onReceived(data: any): any {
        const decoded: any = ReminderDecoder.reminderTimeToJson(data.slice(2))
        decoded["title"] = accumulatedValueHolder.title
        const event = Event.createEvent(decoded)
        if (resolver) {
            resolver(event);
        }
    },

    onReceivedTitle(data: any): any {
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
            await CasioIO.writeCmd(0x000e, [
                CasioConstants.CHARACTERISTICS.CASIO_REMINDER_TITLE,
                index + 1,
                ...Array.from(encodedTitle),
            ]);

            // Delay between title and time
            await new Promise(resolve => setTimeout(resolve, 150));

            console.log(`EventsIO: Writing time for reminder ${index + 1}`);
            await CasioIO.writeCmd(0x000e, reminderTime);

            // Delay between reminders
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        console.log("EventsIO: Done sending reminders");
    },
}

const ReminderDecoder = {
    reminderTimeToJson(reminderStr: any): { end: string } | { time: Reminder } {
        const intArr = reminderStr;
        if (intArr[1] === 0xFF) {
            // 0XFF indicates the end of reminders
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
        reminderJson["daysOfWeek"] = this.convertArrayListToJSONArray(timeDetailMap["daysOfWeek"]);

        return { "time": reminderJson };
    },

    convertArrayListToJSONArray(arrayList: string[]): string[] {
        const jsonArray: string[] = [];
        for (const item of arrayList) {
            jsonArray.push(item);
        }
        return jsonArray;
    },

    decodeTimePeriod(timePeriod: number): [boolean, string] {
        let enabled = false;
        let repeatPeriod = "";

        if ((timePeriod & ReminderMasks.ENABLED_MASK) === ReminderMasks.ENABLED_MASK) {
            enabled = true;
        }

        switch (true) {
            case (timePeriod & ReminderMasks.WEEKLY_MASK) === ReminderMasks.WEEKLY_MASK:
                repeatPeriod = "WEEKLY";
                break;
            case (timePeriod & ReminderMasks.MONTHLY_MASK) === ReminderMasks.MONTHLY_MASK:
                repeatPeriod = "MONTHLY";
                break;
            case (timePeriod & ReminderMasks.YEARLY_MASK) === ReminderMasks.YEARLY_MASK:
                repeatPeriod = "YEARLY";
                break;
            default:
                repeatPeriod = "NEVER";
                break;
        }
        return [enabled, repeatPeriod];
    },

    decodeTimeDetail(timeDetail: number[]): { startDate: any; endDate: any; daysOfWeek: string[] } {
        const result: { startDate: any; endDate: any; daysOfWeek: string[] } = {
            startDate: undefined,
            endDate: undefined,
            daysOfWeek: []
        };

        //                  00 23 02 21 23 02 21 00 00
        // Start from here:    ^
        // So, skip 1
        const startDate = this.decodeDate(timeDetail.slice(1));

        result["startDate"] = startDate;

        //                  00 23 02 21 23 02 21 00 00
        // Start from here:             ^
        // So, skip 4
        const endDate = this.decodeDate(timeDetail.slice(4));

        result["endDate"] = endDate;

        const dayOfWeek = timeDetail[7];
        const daysOfWeek: string[] = [];
        if ((dayOfWeek & ReminderMasks.SUNDAY_MASK) === ReminderMasks.SUNDAY_MASK) {
            daysOfWeek.push("SUNDAY");
        }
        if ((dayOfWeek & ReminderMasks.MONDAY_MASK) === ReminderMasks.MONDAY_MASK) {
            daysOfWeek.push("MONDAY");
        }
        if ((dayOfWeek & ReminderMasks.TUESDAY_MASK) === ReminderMasks.TUESDAY_MASK) {
            daysOfWeek.push("TUESDAY");
        }
        if ((dayOfWeek & ReminderMasks.WEDNESDAY_MASK) === ReminderMasks.WEDNESDAY_MASK) {
            daysOfWeek.push("WEDNESDAY");
        }
        if ((dayOfWeek & ReminderMasks.THURSDAY_MASK) === ReminderMasks.THURSDAY_MASK) {
            daysOfWeek.push("THURSDAY");
        }
        if ((dayOfWeek & ReminderMasks.FRIDAY_MASK) === ReminderMasks.FRIDAY_MASK) {
            daysOfWeek.push("FRIDAY");
        }
        if ((dayOfWeek & ReminderMasks.SATURDAY_MASK) === ReminderMasks.SATURDAY_MASK) {
            daysOfWeek.push("SATURDAY");
        }
        result["daysOfWeek"] = daysOfWeek;
        return result;
    },

    decodeDate(timeDetail: number[]): any {
        // Take the last 2 digits only
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
        switch (monthInt) {
            case 1:
                return "JANUARY";
            case 2:
                return "FEBRUARY";
            case 3:
                return "MARCH";
            case 4:
                return "APRIL";
            case 5:
                return "MAY";
            case 6:
                return "JUNE";
            case 7:
                return "JULY";
            case 8:
                return "AUGUST";
            case 9:
                return "SEPTEMBER";
            case 10:
                return "OCTOBER";
            case 11:
                return "NOVEMBER";
            case 12:
                return "DECEMBER";
            default:
                return "";
        }
    },

    reminderTitleToJson(titleByte: any): { title: string } | { end: string } {
        const intArr = Utils.toIntArray(titleByte);
        if (intArr[2] === 0xFF) {
            // 0XFF indicates the end of reminders
            return { "end": "" };
        }
        const reminderJson = { "title": Utils.toAsciiString(titleByte, 2) };
        return reminderJson;
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

        reminderCmd = reminderCmd.concat(
            this.createTimePeriod(enabled, repeatPeriod)
        );
        reminderCmd = reminderCmd.concat(
            this.createTimeDetail(repeatPeriod, startDate, endDate, daysOfWeek)
        );

        return reminderCmd;
    },

    createTimeDetail(repeatPeriod: string, startDate: any, endDate: any, daysOfWeek: string[]): number[] {
        const timeDetail = new Array(8).fill(0);

        switch (repeatPeriod) {
            case "NEVER":
                this.encodeDate(timeDetail, startDate, endDate);
                break;
            case "WEEKLY":
                this.encodeDate(timeDetail, startDate, endDate);

                let dayOfWeek = 0;

                if (daysOfWeek != null) {
                    for (let i = 0; i < daysOfWeek.length; i++) {
                        switch (daysOfWeek[i]) {
                            case "SUNDAY":
                                dayOfWeek |= ReminderMasks.SUNDAY_MASK;
                                break;
                            case "MONDAY":
                                dayOfWeek |= ReminderMasks.MONDAY_MASK;
                                break;
                            case "TUESDAY":
                                dayOfWeek |= ReminderMasks.TUESDAY_MASK;
                                break;
                            case "WEDNESDAY":
                                dayOfWeek |= ReminderMasks.WEDNESDAY_MASK;
                                break;
                            case "THURSDAY":
                                dayOfWeek |= ReminderMasks.THURSDAY_MASK;
                                break;
                            case "FRIDAY":
                                dayOfWeek |= ReminderMasks.FRIDAY_MASK;
                                break;
                            case "SATURDAY":
                                dayOfWeek |= ReminderMasks.SATURDAY_MASK;
                                break;
                        }
                    }
                }
                timeDetail[6] = dayOfWeek;
                timeDetail[7] = 0;
                break;
            case "MONTHLY":
                this.encodeDate(timeDetail, startDate, endDate);
                break;
            case "YEARLY":
                this.encodeDate(timeDetail, startDate, endDate);
                break;
            default:
                console.log("Cannot handle Repeat Period: " + repeatPeriod + "!!!");
        }

        return timeDetail;
    },

    encodeDate(timeDetail: number[], startDate: any, endDate: any): void {
        // Take the last 2 digits only
        timeDetail[0] = this.decToHex(startDate.year % 2000);
        timeDetail[1] = this.decToHex(this.monthStrToInt(startDate.month));
        timeDetail[2] = this.decToHex(startDate.day);

        timeDetail[3] = this.decToHex(endDate.year % 2000); // Get the last 2 digits only
        timeDetail[4] = this.decToHex(this.monthStrToInt(endDate.month));
        timeDetail[5] = this.decToHex(endDate.day);

        timeDetail[6] = 0;
        timeDetail[7] = 0;
    },

    decToHex(dateField: number): number {
        // Values are stored in hex numbers, which look like decimals, i.e., 22 04 18 represents 2022, Apr 18.
        // So, we must convert the decimal numbers to hex (i.e., 0x22 0x04 0x18).
        return parseInt(dateField.toString(), 16);
    },

    monthStrToInt(monthStr: string): number {
        switch (monthStr) {
            case "JANUARY":
                return 1;
            case "FEBRUARY":
                return 2;
            case "MARCH":
                return 3;
            case "APRIL":
                return 4;
            case "MAY":
                return 5;
            case "JUNE":
                return 6;
            case "JULY":
                return 7;
            case "AUGUST":
                return 8;
            case "SEPTEMBER":
                return 9;
            case "OCTOBER":
                return 10;
            case "NOVEMBER":
                return 11;
            case "DECEMBER":
                return 12;
        }

        return -1;
    },

    createTimePeriod(enabled: boolean, repeatPeriod: string): number {
        let timePeriod = 0;

        if (enabled === true) {
            timePeriod |= 0b00000001; // Enable bit
        }

        switch (repeatPeriod) {
            case "WEEKLY":
                timePeriod |= 0b00000100; // Weekly bit
                break;
            case "MONTHLY":
                timePeriod |= 0b00010000; // Monthly bit
                break;
            case "YEARLY":
                timePeriod |= 0b00001000; // Yearly bit
                break;
        }

        return timePeriod;
    },
};

export default EventsIO;

// Example usage:
// const events = await getEventsFromWatch();
// setEvents(events);
