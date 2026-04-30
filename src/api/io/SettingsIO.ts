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

let deferredResult: Promise<BasicSettings>;
let resolver: ((value?: BasicSettings | PromiseLike<BasicSettings>) => void);

const SettingsIO = {

    async request(): Promise<BasicSettings> {
        const key = "13";
        return cachedIO.request(key, this.getBasicSettings);
    },

    async getBasicSettings(key: string): Promise<BasicSettings> {
        CasioIO.request(key);

        deferredResult = new Promise<BasicSettings>((resolve) => {
            resolver = resolve as ((value?: BasicSettings | PromiseLike<BasicSettings>) => void);
        });

        return deferredResult
    },

    async set(settings: BasicSettings) {
        cachedIO.delete("GET_SETTINGS");
        await connection.sendMessage(JSON.stringify({ action: "SET_SETTINGS", value: settings /*SettingsEncoder.encode(settings)*/ }));
    },

    onReceived(data: any) {
        const value = SettingsEncoder.decode(data);
        resolver!(value);
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

// ─── Constants ───────────────────────────────────────────────────────────────
const MASK_24_HOURS        = 0b00000001;
const MASK_BUTTON_TONE_OFF = 0b00000010;
const MASK_AUTO_LIGHT_OFF  = 0b00000100;
const POWER_SAVING_MODE    = 0b00010000;
const DO_NOT_DISTURB_OFF   = 0b01000000;

const LIGHT_DURATION_LONG  = 0b00000001;  // arr[2], bit 0
const FONT_CLASSIC_MASK    = 0x20;        // arr[8]

// DW-H5600 extended format (17-byte) — arr[12]
const SOUND_ONLY           = 0b0100;
const VIBRATION_ONLY       = 0b1000;
const SOUND_AND_VIBRATION  = 0b1100;
const SILENT               = 0b0000;
const CHIME                = 0b00100000;

// ─── Extended vs Short format ─────────────────────────────────────────────────
// Short    = 12 bytes  (most models)
// Extended = 17 bytes  (DW-H5600 and similar always-connected models)
type SettingType = "SHORT" | "EXTENDED";

function getSettingType(data: number[]): SettingType {
    return data.length === 17 ? "EXTENDED" : "SHORT";
}

// ─── Full settings shape (superset of BasicSettings) ─────────────────────────
interface FullSettings extends BasicSettings {
    keyVibration: boolean;   // vibrate (DW-H5600 extended format)
    hourlyChime:  boolean;   // chime   (DW-H5600 extended format)
    DnD:          boolean;   // Do Not Disturb
    font:         "Standard" | "Classic";  // hasMultipleFonts models
}

class SettingsEncoder {
    static encode(settings: any): number[] {
        // Always send 17 bytes so both short and extended models are covered.
        const arr = new Array(17).fill(0);
        arr[0] = CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_BASIC;

        // ── arr[1]: time / light / tone / power / DnD flags ───────────────
        if (settings.timeFormat === "24h") {
            arr[1] |= MASK_24_HOURS;
        }
        // Button tone: arr[1] bit for short models; arr[12] for extended.
        if (!settings.buttonTone) {
            arr[1] |= MASK_BUTTON_TONE_OFF;
        }
        if (!settings.autoLight) {
            arr[1] |= MASK_AUTO_LIGHT_OFF;
        }
        if (!settings.powerSavingMode) {
            arr[1] |= POWER_SAVING_MODE;
        }
        // Set this flag, otherwise on the Edifice 30 we will hear no alarms.
        if (settings.DnD === false) {
            arr[1] |= DO_NOT_DISTURB_OFF;
        }

        // ── arr[2]: light duration ─────────────────────────────────────────
        if (settings.lightDuration === "4s") {
            arr[2] |= LIGHT_DURATION_LONG;
        }

        // ── arr[4]: date format ────────────────────────────────────────────
        if (settings.dateFormat === "DD:MM") {
            arr[4] = 1;
        }

        // ── arr[5]: language ───────────────────────────────────────────────
        switch (settings.language) {
            case "English": arr[5] = 0; break;
            case "Spanish": arr[5] = 1; break;
            case "French":  arr[5] = 2; break;
            case "German":  arr[5] = 3; break;
            case "Italian": arr[5] = 4; break;
            case "Russian": arr[5] = 5; break;
            default:        arr[5] = 0;
        }

        // ── arr[8]: font (hasMultipleFonts models, e.g. GMW-BZ5000) ───────
        // The caller only sends font when the watch supports it; a missing /
        // undefined font value defaults to Standard (0).
        if (settings.font === "Classic") {
            arr[8] |= FONT_CLASSIC_MASK;
        }

        // ── arr[12]: sound / vibration (extended / DW-H5600) ──────────────
        if (settings.buttonTone) {
            arr[12] |= SOUND_ONLY;
        } else {
            arr[12] &= ~SOUND_ONLY;
        }
        if (settings.keyVibration) {
            arr[12] |= VIBRATION_ONLY;
        }
        if (settings.hourlyChime) {
            arr[12] |= CHIME;
        }

        return arr;
    }

    static decode(data: number[]): FullSettings {
        const settingType = getSettingType(data);
        const settingByte = data[1];

        const settings: FullSettings = {
            timeFormat:      "12h",
            buttonTone:      true,
            autoLight:       true,
            powerSavingMode: true,
            lightDuration:   "2s",
            dateFormat:      "MM:DD",
            language:        "English",
            keyVibration:    false,
            hourlyChime:     false,
            DnD:             false,
            font:            "Standard",
        };

        // ── Time format ────────────────────────────────────────────────────
        settings.timeFormat = (data[1] & MASK_24_HOURS) ? "24h" : "12h";

        // ── Button tone / vibration / chime ────────────────────────────────
        if (settingType === "SHORT") {
            // Short format: buttonTone is the inverse of the TONE_OFF bit
            settings.buttonTone = !(settingByte & MASK_BUTTON_TONE_OFF);
        } else {
            // Extended format (DW-H5600): sound and vibration in arr[12]
            settings.buttonTone   = !!(data[12] & SOUND_ONLY);
            settings.keyVibration = !!(data[12] & VIBRATION_ONLY);
            settings.hourlyChime  = !!(data[12] & CHIME);
        }

        // ── Auto light / power saving / DnD ───────────────────────────────
        settings.autoLight       = !(settingByte & MASK_AUTO_LIGHT_OFF);
        settings.powerSavingMode = (settingByte & POWER_SAVING_MODE) === 0;
        settings.DnD             = (settingByte & DO_NOT_DISTURB_OFF) === 0;

        // ── Date format ────────────────────────────────────────────────────
        settings.dateFormat = data[4] === 1 ? "DD:MM" : "MM:DD";

        // ── Language ───────────────────────────────────────────────────────
        const langMap: Record<number, FullSettings["language"]> = {
            0: "English", 1: "Spanish", 2: "French",
            3: "German",  4: "Italian", 5: "Russian",
        };
        settings.language = langMap[data[5]] ?? "English";

        // ── Light duration (arr[2], bit 0) ─────────────────────────────────
        settings.lightDuration = (data[2] & LIGHT_DURATION_LONG) ? "4s" : "2s";

        // ── Font (arr[8], FONT_CLASSIC_MASK) — hasMultipleFonts models ─────
        settings.font = (data[8] & FONT_CLASSIC_MASK) ? "Classic" : "Standard";

        return settings;
    }
}

export default SettingsIO;
