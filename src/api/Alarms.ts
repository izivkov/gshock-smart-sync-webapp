import Utils from "@utils/Utils";
import { CasioConstants } from "@api/CasioConstants";

class Alarm {
    hour: number;
    minute: number;
    enabled: boolean;
    hasHourlyChime: boolean;

    constructor(hour: number, minute: number, enabled: boolean, hasHourlyChime: boolean) {
        this.hour = hour;
        this.minute = minute;
        this.enabled = enabled;
        this.hasHourlyChime = hasHourlyChime;
    }
}

const Alarms = {
    HOURLY_CHIME_MASK: 0b10000000,
    ENABLED_MASK: 0b01000000,
    ALARM_CONSTANT_VALUE: 0x40,

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
        if (alarm.enabled) flag |= this.ENABLED_MASK;
        if (alarm.hasHourlyChime) flag |= this.HOURLY_CHIME_MASK;

        return [
            CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_ALM,
            flag,
            this.ALARM_CONSTANT_VALUE,
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
            if (alarm.enabled) flag |= this.ENABLED_MASK;
            if (alarm.hasHourlyChime) flag |= this.HOURLY_CHIME_MASK;

            allAlarms = allAlarms.concat([
                flag,
                this.ALARM_CONSTANT_VALUE,
                alarm.hour,
                alarm.minute
            ]);
        }

        return allAlarms;
    }
};

export default Alarms;
