import { connection } from "@api/Connection";
import { cachedIO } from "@io/CachedIO";
import CasioIO from "@io/CasioIO";
import Alarm from "@model/Alarm";
import Alarms from "@api/Alarms";
import { CasioConstants } from "@api/CasioConstants";

interface AlarmData {
    hour: number;
    minute: number;
    enabled: boolean;
    hourlyChime: boolean;
}

let deferredResult: Promise<void>;
let resolver: ((value?: Alarm[] | PromiseLike<string>) => void);

const AlarmsIO = {
    async request(): Promise<void> {
        return await cachedIO.request("GET_ALARMS", this.getAlarms);
    },

    async getAlarms(key: string): Promise<void> {
        connection.sendMessage(`{"action": "${key}" }`);
        Alarm.clear();

        deferredResult = new Promise<void>((resolve) => {
            resolver = resolve as ((value?: Alarm[] | PromiseLike<string>) => void);
        });

        return deferredResult
    },

    async set(alarms: AlarmData[]): Promise<void> {
        if (Alarm.alarms.length === 0) {
            console.log("Alarm model not initialized! Cannot set alarm");
            return;
        }

        function toJson(): string {
            return JSON.stringify(alarms);
        }

        // Remove from cache
        cachedIO.delete("GET_ALARMS");

        connection.sendMessage(`{ "action": "SET_ALARMS", "value": ${toJson()} }`);
    },

    onReceived(dataIntArray: any): void {
        const data = AlarmsIO.AlarmDecoder.toJson(dataIntArray).ALARMS

        function fromJson(jsonStr: string): void {
            const alarmArr = JSON.parse(jsonStr);
            Alarm.alarms.push(...alarmArr);
        }

        fromJson(JSON.stringify(data));

        if (Alarm.alarms.length > 1) {
            resolver!(Alarm.alarms);
        }
    },

    async sendToWatch(message: string): Promise<void> {
        // Get alarm 1
        await CasioIO.writeCmd(0x000c, [CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_ALM]);

        // Get the rest of the alarms
        await CasioIO.writeCmd(0x000c, [CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_ALM2]);
    },

    async sendToWatchSet(message: string): Promise<void> {
        const alarmsJsonArr: AlarmData[] = JSON.parse(message).value;
        const alarmCasio0 = Alarms.fromJsonAlarmFirstAlarm(alarmsJsonArr[0]);
        await CasioIO.writeCmd(0x000e, alarmCasio0);
        const alarmCasio = Alarms.fromJsonAlarmSecondaryAlarms(alarmsJsonArr);
        await CasioIO.writeCmd(0x000e, alarmCasio);
    },

    AlarmDecoder: {
        HOURLY_CHIME_MASK: 0b10000000,

        toJson(command: number[]): Record<string, any> {
            const jsonResponse: Record<string, any> = {};
            const intArray = command.map(Number);
            const alarms: AlarmData[] = [];

            switch (intArray[0]) {
                case CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_ALM:
                    intArray.shift();
                    alarms.push(this.createJsonAlarm(intArray));
                    jsonResponse.ALARMS = alarms;
                    break;

                case CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_ALM2:
                    intArray.shift();
                    const multipleAlarms: any[] = [];
                    while (intArray.length >= 4) {
                        multipleAlarms.push(intArray.splice(0, 4));
                    }
                    alarms.push(...multipleAlarms.map((alarm) => this.createJsonAlarm(alarm)));
                    jsonResponse.ALARMS = alarms;
                    break;

                default:
                    console.log(`Unhandled Command [${command}]`);
                    break;
            }

            return jsonResponse;
        },

        createJsonAlarm(intArray: number[]): AlarmData {
            const enabled = (intArray[0] & Alarms.ENABLED_MASK) !== 0;
            const hourlyChime = (intArray[0] & this.HOURLY_CHIME_MASK) !== 0;
            const alarm: AlarmData = {
                hour: intArray[2],
                minute: intArray[3],
                enabled,
                hourlyChime,
            };
            return alarm;
        },
    },
};

export default AlarmsIO;
