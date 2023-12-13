import CasioIO from "@io/CasioIO";
import { cachedIO } from "@io/CachedIO";
import Utils from "@utils/Utils";
import { connection } from "@api/Connection";
import { CasioConstants } from "@api/CasioConstants";

interface BasicSettings {
    timeFormat: "12h" | "24h";
    buttonTone: boolean;
    autoLight: boolean;
    powerSavingMode: boolean;
    lightDuration: "2s" | "4s";
    dateFormat: "DD:MM" | "MM:DD";
    language: "English" | "Spanish" | "French" | "German" | "Italian" | "Russian";
}

const SettingsIO = {

    async request(): Promise<BasicSettings> {
        const key = "13";
        return cachedIO.request(key, this.getBasicSettings);
    },

    async getBasicSettings(key: string): Promise<BasicSettings> {
        CasioIO.request(key);

        const deferredResult = new Promise<BasicSettings>((resolve) => {
            cachedIO.resultQueue.enqueue({
                key: key,
                result: resolve,
            });
        });

        cachedIO.subscribe("SETTINGS", (keyedData) => {
            const data = keyedData.value;
            const resultKey = keyedData.key;

            const deferredResult = cachedIO.resultQueue.dequeue(resultKey);
            if (deferredResult) {
                deferredResult(data);
            }
        });

        const result = await deferredResult;
        return result;
    },

    /////////////

    async set(settings: BasicSettings) {
        cachedIO.delete("GET_SETTINGS");
        await connection.sendMessage(JSON.stringify({ action: "SET_SETTINGS", value: settings /*SettingsEncoder.encode(settings)*/ }));
    },

    toJson(data: any) {
        const dataStr = Utils.toCompactString(data);
        const key = cachedIO.createKey(dataStr);
        const value = SettingsEncoder.decode(data);
        const dataJson = { key, value };
        const settingsJson = { SETTINGS: dataJson };
        return settingsJson;
    },

    async sendToWatch(message: string) {
        await CasioIO.writeCmd(
            0x000c,
            [CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_BASIC]
        );
    },

    async sendToWatchSet(message: string) {
        const settings = JSON.parse(message).value;
        await CasioIO.writeCmd(0x000e, SettingsEncoder.encode(settings));
    },
};

class SettingsEncoder {
    static encode(settings: BasicSettings): any {
        const MASK_24_HOURS = 0b00000001;
        const MASK_BUTTON_TONE_OFF = 0b00000010;
        const MASK_LIGHT_OFF = 0b00000100;
        const POWER_SAVING_MODE = 0b00010000;

        const arr = new Array(12).fill(0);
        arr[0] = CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_BASIC;

        if (settings.timeFormat === "24h") {
            arr[1] |= MASK_24_HOURS;
        }
        if (!settings.buttonTone) {
            arr[1] |= MASK_BUTTON_TONE_OFF;
        }
        if (!settings.autoLight) {
            arr[1] |= MASK_LIGHT_OFF;
        }
        if (!settings.powerSavingMode) {
            arr[1] |= POWER_SAVING_MODE;
        }

        if (settings.lightDuration === "4s") {
            arr[2] = 1;
        }
        if (settings.dateFormat === "DD:MM") {
            arr[4] = 1;
        }

        switch (settings.language) {
            case "English":
                arr[5] = 0;
                break;
            case "Spanish":
                arr[5] = 1;
                break;
            case "French":
                arr[5] = 2;
                break;
            case "German":
                arr[5] = 3;
                break;
            case "Italian":
                arr[5] = 4;
                break;
            case "Russian":
                arr[5] = 5;
                break;
            default:
                arr[5] = 0;
        }

        return arr;
    }

    static decode(data: number[]): BasicSettings {
        const MASK_24_HOURS = 0b00000001;
        const MASK_BUTTON_TONE_OFF = 0b00000010;
        const MASK_LIGHT_OFF = 0b00000100;
        const POWER_SAVING_MODE = 0b00010000;

        const settingArray = data;
        const settingByte = settingArray[1];
        console.log(`settingByte: ${settingByte.toString(16)}, ${settingByte.toString(2)}`);

        const settings: BasicSettings = {} as BasicSettings;

        if (settingArray[1] & MASK_24_HOURS) {
            settings.timeFormat = "24h";
        } else {
            settings.timeFormat = "12h";
        }
        settings.buttonTone = !(settingByte & MASK_BUTTON_TONE_OFF);
        settings.autoLight = !(settingByte & MASK_LIGHT_OFF);
        settings.powerSavingMode = (settingByte & POWER_SAVING_MODE) === 0;

        if (settingArray[4] === 1) {
            settings.dateFormat = "DD:MM";
        } else {
            settings.dateFormat = "MM:DD";
        }

        switch (settingArray[5]) {
            case 0:
                settings.language = "English";
                break;
            case 1:
                settings.language = "Spanish";
                break;
            case 2:
                settings.language = "French";
                break;
            case 3:
                settings.language = "German";
                break;
            case 4:
                settings.language = "Italian";
                break;
            case 5:
                settings.language = "Russian";
                break;
            default:
                settings.language = "English";
        }

        settings.lightDuration = settingArray[2] === 1 ? "4s" : "2s";

        return settings;
    }
}

export default SettingsIO;
