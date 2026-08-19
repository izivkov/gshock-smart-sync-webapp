import CasioIO, { GET_SET_MODE } from "@io/CasioIO";
import { cachedIO } from "@io/CachedIO";
import { CasioConstants } from "@api/CasioConstants";
import { Settings } from "@model/Settings";

const MASK_24_HOURS        = 0b00000001;
const MASK_BUTTON_TONE_OFF = 0b00000010;
const MASK_AUTO_LIGHT_OFF  = 0b00000100;
const POWER_SAVING_MODE    = 0b00010000;
const DO_NOT_DISTURB_OFF   = 0b01000000;
const LIGHT_DURATION_LONG  = 0b00000001;
const FONT_CLASSIC_MASK    = 0x20;
const SOUND_ONLY           = 0b0100;
const VIBRATION_ONLY       = 0b1000;
const CHIME                = 0b00100000;

export const SettingsIOFunctional = {
    encode(settings: Settings): number[] {
        const arr = new Array(17).fill(0);
        arr[0] = CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_BASIC;

        if (settings.timeFormat === "24h") arr[1] |= MASK_24_HOURS;
        if (!settings.buttonTone) arr[1] |= MASK_BUTTON_TONE_OFF;
        if (!settings.autoLight) arr[1] |= MASK_AUTO_LIGHT_OFF;
        if (!settings.powerSavingMode) arr[1] |= POWER_SAVING_MODE;
        if (settings.DnD === false) arr[1] |= DO_NOT_DISTURB_OFF;

        if (settings.lightDuration === "4s") arr[2] |= LIGHT_DURATION_LONG;
        if (settings.dateFormat === "DD:MM") arr[4] = 1;

        switch (settings.language) {
            case "English": arr[5] = 0; break;
            case "Spanish": arr[5] = 1; break;
            case "French":  arr[5] = 2; break;
            case "German":  arr[5] = 3; break;
            case "Italian": arr[5] = 4; break;
            case "Russian": arr[5] = 5; break;
            default:        arr[5] = 0;
        }

        if (settings.font === "Classic") arr[8] |= FONT_CLASSIC_MASK;

        if (settings.buttonTone) arr[12] |= SOUND_ONLY; else arr[12] &= ~SOUND_ONLY;
        if (settings.keyVibration) arr[12] |= VIBRATION_ONLY;
        if (settings.hourlyChime) arr[12] |= CHIME;

        return arr;
    },

    decode(data: number[]): Settings {
        const isExtended = data.length === 17;
        const settingByte = data[1];

        const settings: Settings = {
            timeFormat:      (data[1] & MASK_24_HOURS) ? "24h" : "12h",
            buttonTone:      isExtended ? !!(data[12] & SOUND_ONLY) : !(settingByte & MASK_BUTTON_TONE_OFF),
            autoLight:       !(settingByte & MASK_AUTO_LIGHT_OFF),
            powerSavingMode: (settingByte & POWER_SAVING_MODE) === 0,
            lightDuration:   (data[2] & LIGHT_DURATION_LONG) ? "4s" : "2s",
            dateFormat:      data[4] === 1 ? "DD:MM" : "MM:DD",
            language:        "English",
            keyVibration:    isExtended ? !!(data[12] & VIBRATION_ONLY) : false,
            hourlyChime:     isExtended ? !!(data[12] & CHIME) : false,
            DnD:             (settingByte & DO_NOT_DISTURB_OFF) === 0,
            font:            (data[8] & FONT_CLASSIC_MASK) ? "Classic" : "Standard",
        };

        const langMap: Record<number, Settings["language"]> = {
            0: "English", 1: "Spanish", 2: "French",
            3: "German",  4: "Italian", 5: "Russian",
        };
        settings.language = langMap[data[5]] ?? "English";

        return settings;
    }
};

let resolver: ((value: Settings) => void) | null = null;

const SettingsIO = {
    async request(): Promise<Settings> {
        return cachedIO.request("13", SettingsIO.getBasicSettings);
    },

    async getBasicSettings(key: string): Promise<Settings> {
        const promise = new Promise<Settings>((resolve) => {
            resolver = resolve;
        });
        await SettingsIO.sendToWatch("");
        return promise;
    },

    async set(settings: Settings) {
        cachedIO.delete("13");
        await SettingsIO.sendToWatchSet(JSON.stringify({ value: settings }));
    },

    onReceived(data: number[]) {
        const value = SettingsIOFunctional.decode(data);
        if (resolver) {
            resolver(value);
            resolver = null;
        }
    },

    async sendToWatch(message: string) {
        await CasioIO.writeCmd(GET_SET_MODE.GET, [CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_BASIC]);
    },

    async sendToWatchSet(message: string) {
        const settings = JSON.parse(message).value;
        await CasioIO.writeCmd(GET_SET_MODE.SET, SettingsIOFunctional.encode(settings));
    },
};

export default SettingsIO;
