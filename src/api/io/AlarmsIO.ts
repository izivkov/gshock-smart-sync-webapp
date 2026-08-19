import { cachedIO } from "@io/CachedIO";
import CasioIO, { GET_SET_MODE } from "@io/CasioIO";
import Alarm from "@model/Alarm";
import { CasioConstants } from "@api/CasioConstants";
import { watchInfo } from "@/api/WatchInfo";
import Utils from "@utils/Utils";

const HOURLY_CHIME_MASK = 0b10000000;
const ENABLED_MASK = 0b01000000;
const ALARM_CONSTANT_VALUE = 0x40;

export const AlarmsIOFunctional = {
    parseReceivedAlarms(data: number[]): Alarm[] {
        const alarms: Alarm[] = [];
        const intArray = [...data];

        switch (intArray[0]) {
            case CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_ALM:
                intArray.shift();
                alarms.push(this.createAlarm(intArray));
                break;

            case CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_ALM2:
                intArray.shift();
                while (intArray.length >= 4) {
                    const alarmData = intArray.splice(0, 4);
                    alarms.push(this.createAlarm(alarmData));
                }
                break;
        }
        return alarms;
    },

    createAlarm(intArray: number[]): Alarm {
        const enabled = (intArray[0] & ENABLED_MASK) !== 0;
        const hasHourlyChime = (intArray[0] & HOURLY_CHIME_MASK) !== 0;
        return new Alarm(
            intArray[2],
            intArray[3],
            enabled,
            hasHourlyChime
        );
    },

    fromJsonAlarmFirstAlarm(alarmJson: any): number[] {
        const alarm = new Alarm(
            alarmJson.hour,
            alarmJson.minute,
            alarmJson.enabled,
            alarmJson.hasHourlyChime
        );

        return this.createFirstAlarm(alarm);
    },

    createFirstAlarm(alarm: Alarm): number[] {
        let flag = 0;
        if (alarm.enabled) flag |= ENABLED_MASK;
        if (alarm.hasHourlyChime) flag |= HOURLY_CHIME_MASK;

        return [
            CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_ALM,
            flag,
            ALARM_CONSTANT_VALUE,
            alarm.hour,
            alarm.minute
        ];
    },

    fromJsonAlarmSecondaryAlarms(alarmsJson: any[]): number[] {
        if (alarmsJson.length < 2) {
            return [];
        }

        const alarms = alarmsJson.slice(1).map((alarmJson) => new Alarm(
            alarmJson.hour,
            alarmJson.minute,
            alarmJson.enabled,
            alarmJson.hasHourlyChime
        ));

        return this.createSecondaryAlarm(alarms);
    },

    createSecondaryAlarm(alarms: Alarm[]): number[] {
        let allAlarms = Array.from(Utils.byteArrayOfInts(CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_ALM2));

        for (const alarm of alarms) {
            let flag = 0;
            if (alarm.enabled) flag |= ENABLED_MASK;
            if (alarm.hasHourlyChime) flag |= HOURLY_CHIME_MASK;

            allAlarms = allAlarms.concat([
                flag,
                ALARM_CONSTANT_VALUE,
                alarm.hour,
                alarm.minute
            ]);
        }

        return allAlarms;
    }
};

let resolver: ((value: Alarm[]) => void) | null = null;
let receivedCharacteristics = 0;

const AlarmsIO = {
    async request(): Promise<Alarm[]> {
        return await cachedIO.request("GET_ALARMS", AlarmsIO.getAlarms);
    },

    async getAlarms(key: string): Promise<Alarm[]> {
        const promise = new Promise<Alarm[]>((resolve) => {
            resolver = resolve;
        });
        Alarm.clear();
        receivedCharacteristics = 0;
        await AlarmsIO.sendToWatch("");
        return promise;
    },

    async set(alarms: Alarm[]): Promise<void> {
        cachedIO.delete("GET_ALARMS");
        await AlarmsIO.sendToWatchSet(JSON.stringify({ value: alarms }));
    },

    onReceived(data: number[]): void {
        const parsed = AlarmsIOFunctional.parseReceivedAlarms(data);
        Alarm.alarms.push(...parsed);

        receivedCharacteristics++;
        if (receivedCharacteristics >= 2 && Alarm.alarms.length === watchInfo.alarmCount) {
            if (resolver) {
                resolver(Alarm.alarms);
                resolver = null;
            }
        }
    },

    async sendToWatch(message: string): Promise<void> {
        await CasioIO.writeCmd(GET_SET_MODE.GET, [CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_ALM]);
        if (watchInfo.alarmCount > 1) {
            await CasioIO.writeCmd(GET_SET_MODE.GET, [CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_ALM2]);
        }
    },

    async sendToWatchSet(message: string): Promise<void> {
        const alarmsJsonArr: Alarm[] = JSON.parse(message).value;
        const alarmCasio0 = AlarmsIOFunctional.fromJsonAlarmFirstAlarm(alarmsJsonArr[0]);
        await CasioIO.writeCmd(GET_SET_MODE.SET, alarmCasio0);
        if (watchInfo.alarmCount > 1) {
            const alarmCasio = AlarmsIOFunctional.fromJsonAlarmSecondaryAlarms(alarmsJsonArr);
            await CasioIO.writeCmd(GET_SET_MODE.SET, alarmCasio);
        }
    },
};

export default AlarmsIO;
