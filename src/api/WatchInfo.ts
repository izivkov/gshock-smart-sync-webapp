import { progressEvents } from '@api/ProgressEvents';
import { WatchProtocol } from './protocols/WatchProtocol';
import { standardProtocol } from './protocols/StandardProtocol';
import { mipProtocol } from './protocols/MipProtocol';
import { analogueProtocol } from './protocols/AnalogueProtocol';

export enum WATCH_MODEL {
    GA = "GA",
    GW = "GW",
    DW_B5600 = "DW_B5600",
    DW = "DW",
    GMW = "GMW",
    GPR = "GPR",
    GST = "GST",
    MSG = "MSG",
    GB001 = "GB001",
    GBD = "GBD",
    GBD_800 = "GBD_800",
    MRG_B5000 = "MRG_B5000",
    GCW_B5000 = "GCW_B5000",
    EQB = "EQB",
    ECB = "ECB",
    ABL_100 = "ABL_100",
    DW_H5600 = "DW_H5600",
    GMW_BZ5000 = "GMW_BZ5000",
    GW_BX5600 = "GW_BX5600",
    MTG_B1000 = "MTG_B1000",
    MTG_B3000 = "MTG_B3000",
    GENERIC = "GENERIC",
}

export type dateFormatType = "MM:DD" | "DD:MM";
export type timeFormatType = "12h" | "24h";
export type languageType = "English" | "Spanish" | "French" | "German" | "Italian" | "Russian";
export type lightDurationType = "1.5s" | "2s" | "3s" | "4s" | "5s";

export interface ModelInfo {
    model: WATCH_MODEL;
    worldCitiesCount?: number;
    dstCount?: number;
    alarmCount?: number;
    hasAutoLight?: boolean;
    hasReminders?: boolean;
    shortLightDuration?: lightDurationType;
    longLightDuration?: lightDurationType;
    weekLanguageSupported?: boolean;
    worldCities?: boolean;
    hasBatteryLevel?: boolean;
    hasTemperature?: boolean;
    batteryLevelLowerLimit?: number;
    batteryLevelUpperLimit?: number;
    alwaysConnected?: boolean;
    findButtonUserDefined?: boolean;
    hasPowerSavingMode?: boolean;
    chimeInSettings?: boolean;
    vibrate?: boolean;
    hasHealthFunctions?: boolean;
    hasMessages?: boolean;
    hasDateFormat?: boolean;
    hasWorldCities?: boolean;
    hasHomeTime?: boolean;
    hasMultipleFonts?: boolean;
    hasStepCounter?: boolean;
    hasStepCounterMock?: boolean;
    hasNewTimeFormat?: boolean;
    hasTimeAdjustment?: boolean;
    hasSecondDial?: boolean;
    hasFineWatchCondition?: boolean;
    hasTimeFormat?: boolean;
    hasHourlyChime?: boolean;
    hasLongTimerKey?: boolean;
    settingsSize?: number;
}

const DEFAULT_MODEL_INFO: Required<ModelInfo> = {
    model: WATCH_MODEL.GENERIC,
    worldCitiesCount: 2,
    dstCount: 1,
    alarmCount: 5,
    hasAutoLight: false,
    hasReminders: false,
    shortLightDuration: "1.5s",
    longLightDuration: "3s",
    weekLanguageSupported: true,
    worldCities: true,
    hasBatteryLevel: true,
    hasTemperature: true,
    batteryLevelLowerLimit: 9,
    batteryLevelUpperLimit: 19,
    alwaysConnected: false,
    findButtonUserDefined: false,
    hasPowerSavingMode: true,
    chimeInSettings: false,
    vibrate: false,
    hasHealthFunctions: false,
    hasMessages: false,
    hasDateFormat: true,
    hasWorldCities: true,
    hasHomeTime: true,
    hasMultipleFonts: false,
    hasStepCounter: false,
    hasStepCounterMock: false,
    hasNewTimeFormat: false,
    hasTimeAdjustment: true,
    hasSecondDial: false,
    hasFineWatchCondition: false,
    hasTimeFormat: true,
    hasHourlyChime: true,
    hasLongTimerKey: false,
    settingsSize: 17
};

const modelList: ModelInfo[] = [
    {
        model: WATCH_MODEL.GW,
        worldCitiesCount: 6, dstCount: 3,
        hasAutoLight: true, hasReminders: true,
        shortLightDuration: "2s", longLightDuration: "4s",
        batteryLevelLowerLimit: 9, batteryLevelUpperLimit: 19,
        hasStepCounterMock: false,
    },
    {
        model: WATCH_MODEL.DW_B5600,
        worldCitiesCount: 6, dstCount: 3,
        hasAutoLight: false, hasReminders: true,
        shortLightDuration: "2s", longLightDuration: "4s",
        batteryLevelLowerLimit: 9, batteryLevelUpperLimit: 19,
    },
    {
        model: WATCH_MODEL.GMW_BZ5000,
        worldCitiesCount: 6, dstCount: 3,
        hasAutoLight: true, hasReminders: false,
        shortLightDuration: "1.5s", longLightDuration: "3s",
        batteryLevelLowerLimit: 9, batteryLevelUpperLimit: 19,
        hasMultipleFonts: true,
    },
    {
        model: WATCH_MODEL.GW_BX5600,
        worldCitiesCount: 6, dstCount: 3,
        hasAutoLight: true, hasReminders: false,
        shortLightDuration: "1.5s", longLightDuration: "3s",
        batteryLevelLowerLimit: 14, batteryLevelUpperLimit: 24,
        hasMultipleFonts: true,
        hasNewTimeFormat: true,
    },
    {
        model: WATCH_MODEL.MTG_B1000,
        worldCitiesCount: 6, dstCount: 3, alarmCount: 1,
        hasAutoLight: true, hasReminders: true,
        shortLightDuration: "2s", longLightDuration: "4s",
        batteryLevelLowerLimit: 9, batteryLevelUpperLimit: 19,
        hasSecondDial: true,
        hasFineWatchCondition: true,
        hasHourlyChime: false,
    },
    {
        model: WATCH_MODEL.MTG_B3000,
        worldCitiesCount: 2, dstCount: 1, alarmCount: 1,
        hasAutoLight: false, hasReminders: false,
        shortLightDuration: "1.5s", longLightDuration: "3s",
        hasHomeTime: true,
        hasDateFormat: false, weekLanguageSupported: false,
        hasTimeFormat: false, settingsSize: 12,
        batteryLevelLowerLimit: 0, batteryLevelUpperLimit: 100,
        hasSecondDial: true,
        hasFineWatchCondition: true,
        hasPowerSavingMode: false,
        hasHourlyChime: false,
        hasLongTimerKey: true,
    },
    {
        model: WATCH_MODEL.MRG_B5000,
        worldCitiesCount: 6, dstCount: 3,
        hasAutoLight: true, hasReminders: true,
        shortLightDuration: "2s", longLightDuration: "4s",
        batteryLevelLowerLimit: 9, batteryLevelUpperLimit: 19,
    },
    {
        model: WATCH_MODEL.GCW_B5000,
        worldCitiesCount: 6, dstCount: 3,
        hasAutoLight: true, hasReminders: true,
        shortLightDuration: "2s", longLightDuration: "4s",
        batteryLevelLowerLimit: 9, batteryLevelUpperLimit: 19,
    },
    {
        model: WATCH_MODEL.GMW,
        worldCitiesCount: 6, dstCount: 3,
        hasAutoLight: true, hasReminders: true,
        shortLightDuration: "2s", longLightDuration: "4s",
        batteryLevelLowerLimit: 9, batteryLevelUpperLimit: 19,
    },
    { model: WATCH_MODEL.GST, hasAutoLight: false, hasReminders: true },
    {
        model: WATCH_MODEL.ABL_100,
        hasAutoLight: false, hasReminders: false,
        hasTemperature: false, hasBatteryLevel: false,
        worldCities: false, hasHomeTime: false,
        hasStepCounter: true,
        hasDateFormat: false,
        weekLanguageSupported: false,
    },
    { model: WATCH_MODEL.GA, hasAutoLight: false, hasReminders: true },
    { model: WATCH_MODEL.GB001, hasAutoLight: true, hasReminders: false },
    { model: WATCH_MODEL.MSG, hasAutoLight: false, hasReminders: true },
    {
        model: WATCH_MODEL.GPR,
        hasAutoLight: true, hasReminders: false, weekLanguageSupported: false,
    },
    {
        model: WATCH_MODEL.DW_H5600,
        alarmCount: 4,
        hasAutoLight: true, hasReminders: false,
        vibrate: true, chimeInSettings: true,
        findButtonUserDefined: true,
        shortLightDuration: "1.5s", longLightDuration: "5s",
        hasBatteryLevel: false, alwaysConnected: true, hasDateFormat: false,
        weekLanguageSupported: false,
        hasStepCounter: false,
    },
    { model: WATCH_MODEL.DW, hasAutoLight: true, hasReminders: false },
    {
        model: WATCH_MODEL.GBD,
        hasAutoLight: true, hasReminders: false,
        worldCities: false, hasTemperature: false,
    },
    {
        model: WATCH_MODEL.GBD_800,
        hasAutoLight: true, hasReminders: false,
        hasTemperature: false, hasBatteryLevel: false,
        worldCities: false, hasHomeTime: false,
    },
    {
        model: WATCH_MODEL.EQB,
        hasAutoLight: true, hasReminders: false,
        worldCities: false, hasTemperature: false,
    },
    {
        model: WATCH_MODEL.ECB,
        hasAutoLight: true, hasReminders: false,
        hasTemperature: false, hasBatteryLevel: false,
        alwaysConnected: true, findButtonUserDefined: true, hasPowerSavingMode: false,
    },
    { model: WATCH_MODEL.GENERIC, hasStepCounterMock: true },
];

const exactModelMap: Record<string, WATCH_MODEL> = {
    "GPR-B1000": WATCH_MODEL.GPR,
    "GMW-B5000": WATCH_MODEL.GMW,
    "GW-B5000": WATCH_MODEL.GW,
    "GW-B5600": WATCH_MODEL.GW,
    "MRG-B5000": WATCH_MODEL.GW,
    "GBD-800": WATCH_MODEL.GBD_800,
    "GMD-B800": WATCH_MODEL.GBD_800,
    "GBD-H1000": WATCH_MODEL.GBD,
    "GBD-100": WATCH_MODEL.GBD,
    "GBX-100": WATCH_MODEL.GBD,
    "GSR-H1000": WATCH_MODEL.GENERIC,
    "GBD-200": WATCH_MODEL.GBD,
    "DW-B5600": WATCH_MODEL.DW_B5600,
    "GBD-H2000": WATCH_MODEL.DW_H5600,
    "DW-GH5600": WATCH_MODEL.DW_H5600,
    "DW-H5600": WATCH_MODEL.DW_H5600,
    "GMW-B5000#": WATCH_MODEL.GCW_B5000,
    "GW-B5600#": WATCH_MODEL.GCW_B5000,
    "MRG-B5000#": WATCH_MODEL.GCW_B5000,
    "TRN-50": WATCH_MODEL.GCW_B5000,
    "GCW-B5000": WATCH_MODEL.GCW_B5000,
    "PRJ-BW002": WATCH_MODEL.GCW_B5000,
    "GD-B500": WATCH_MODEL.GENERIC,
    "GPR-H1000": WATCH_MODEL.GPR,
    "ABL-100WE": WATCH_MODEL.ABL_100,
    "GBD-300": WATCH_MODEL.GBD,
    "GMW-BZ5000": WATCH_MODEL.GMW_BZ5000,
    "GM-H5600": WATCH_MODEL.DW_H5600,
    "GBX-H5600": WATCH_MODEL.GBD,
    "GDG-B100": WATCH_MODEL.GBD,
    "GWF-300": WATCH_MODEL.GENERIC,
    "ECB-800": WATCH_MODEL.ECB,
    "GBA-800": WATCH_MODEL.GA,
    "ECB-900": WATCH_MODEL.GST,
    "ECB-950": WATCH_MODEL.GST,
    "GST-B200": WATCH_MODEL.GST,
    "GST-B300": WATCH_MODEL.GST,
    "GWR-B1000": WATCH_MODEL.GW,
    "GMC-B100": WATCH_MODEL.GENERIC,
    "OCW-B1300": WATCH_MODEL.GENERIC,
    "PRT-B70": WATCH_MODEL.GENERIC,
    "OCW-S5000": WATCH_MODEL.GENERIC,
    "EQB-1000": WATCH_MODEL.EQB,
    "ECB-10": WATCH_MODEL.ECB,
    "GWF-A1000": WATCH_MODEL.GENERIC,
    "OCW-P2000": WATCH_MODEL.GENERIC,
    "MTG-B2000": WATCH_MODEL.GENERIC,
    "MRG-BF1000": WATCH_MODEL.GENERIC,
    "GBA-900": WATCH_MODEL.GA,
    "GST-B400": WATCH_MODEL.GST,
    "MTG-B3000": WATCH_MODEL.MTG_B3000,
    "OCW-S7000": WATCH_MODEL.GENERIC,
    "GWG-B1000": WATCH_MODEL.GW,
    "OCW-S400": WATCH_MODEL.GENERIC,
    "GA-B010": WATCH_MODEL.GA,
    "GBA-950": WATCH_MODEL.GA,
    "GG-B100X": WATCH_MODEL.GENERIC,
    "GST-B1000": WATCH_MODEL.GST,
    "EQB-1300": WATCH_MODEL.EQB,
    "GWR-B3000": WATCH_MODEL.GW,
    "GB-5600A": WATCH_MODEL.GA,
    "GB-6900A": WATCH_MODEL.GA,
    "GB-5600B": WATCH_MODEL.GA,
    "GB-6900B": WATCH_MODEL.GA,
    "GB-X6900B": WATCH_MODEL.GA,
    "GBA-400": WATCH_MODEL.GA,
    "GA-B2100": WATCH_MODEL.GA,
    "GM-B2100": WATCH_MODEL.GA,
    "GBM-2100": WATCH_MODEL.GA,
    "GA-B001": WATCH_MODEL.GA,
    "GST-B100": WATCH_MODEL.GST,
    "GST-B500": WATCH_MODEL.GST,
    "GST-B600": WATCH_MODEL.GST,
    "GST-W1000": WATCH_MODEL.GST,
    "MSG-B100": WATCH_MODEL.MSG,
    "G-B001": WATCH_MODEL.GB001,
    "EQB-500": WATCH_MODEL.EQB,
    "EQB-510": WATCH_MODEL.EQB,
    "EQB-600": WATCH_MODEL.EQB,
    "EQB-700": WATCH_MODEL.EQB,
    "EQB-501": WATCH_MODEL.EQB,
    "EQB-800": WATCH_MODEL.EQB,
    "EQB-900": WATCH_MODEL.EQB,
    "EQB-1100": WATCH_MODEL.EQB,
    "EQB-1200": WATCH_MODEL.EQB,
    "EQB-2000": WATCH_MODEL.EQB,
    "ECB-500": WATCH_MODEL.ECB,
    "ECB-20": WATCH_MODEL.ECB,
    "ECB-30": WATCH_MODEL.ECB,
    "ECB-40": WATCH_MODEL.ECB,
    "ECB-S100": WATCH_MODEL.ECB,
    "ECB-2000": WATCH_MODEL.ECB,
    "ECB-2300": WATCH_MODEL.ECB,
    "ECB-2200": WATCH_MODEL.ECB,
    "ECB-S10": WATCH_MODEL.ECB,
    "GW-BX5600": WATCH_MODEL.GW_BX5600,
    "MTG-B1000": WATCH_MODEL.MTG_B1000,
    "STB-1000": WATCH_MODEL.GENERIC,
    "SHB-100": WATCH_MODEL.GENERIC,
    "SHB-200": WATCH_MODEL.GENERIC,
    "GPW-2000": WATCH_MODEL.GENERIC,
    "GPW-G2000": WATCH_MODEL.GENERIC,
    "MRG-G2000": WATCH_MODEL.GENERIC,
    "OCW-G2000": WATCH_MODEL.GENERIC,
    "MRG-B1000": WATCH_MODEL.GENERIC,
    "LIW-B1000": WATCH_MODEL.GENERIC,
    "OCW-S4000": WATCH_MODEL.GENERIC,
    "OCW-T3000": WATCH_MODEL.GENERIC,
    "OCW-T4000": WATCH_MODEL.GENERIC,
    "OCW-T6000": WATCH_MODEL.GENERIC,
    "OCW-T4000A": WATCH_MODEL.GENERIC,
    "OCW-T4000B": WATCH_MODEL.GENERIC,
    "OCW-T4000C": WATCH_MODEL.GENERIC,
    "GR-B300": WATCH_MODEL.GENERIC,
    "MRG-B2100": WATCH_MODEL.GA,
    "GMC-B2100": WATCH_MODEL.GA,
    "OCW-SG1000": WATCH_MODEL.GENERIC,
    "MTG-B4000": WATCH_MODEL.GENERIC,
    "BSA-B100": WATCH_MODEL.GENERIC,
    "GMA-B800": WATCH_MODEL.GENERIC,
    "GR-B100": WATCH_MODEL.GENERIC,
    "GG-B100": WATCH_MODEL.GENERIC,
    "PRT-B50": WATCH_MODEL.GENERIC,
    "GR-B200": WATCH_MODEL.GENERIC,
    "OCW-T200": WATCH_MODEL.GENERIC,
    "OCW-B1200": WATCH_MODEL.GENERIC,
    "OCW-S6000": WATCH_MODEL.GENERIC,
    "OCW-T5000": WATCH_MODEL.GENERIC,
    "OCW-B1400": WATCH_MODEL.GENERIC,
    "MRG-B2000": WATCH_MODEL.GENERIC,
    "PRJ-B001": WATCH_MODEL.GB001,
    "OCW-5700": WATCH_MODEL.GENERIC,
    "MTG-B3100": WATCH_MODEL.MTG_B3000,
    "OCW-5800": WATCH_MODEL.GENERIC,
    "PRW-B1000": WATCH_MODEL.GENERIC,
    "GMD-B300": WATCH_MODEL.GENERIC,
    "WS-B1000": WATCH_MODEL.GENERIC,
    "F-B100W": WATCH_MODEL.GENERIC,
    "OCW-P3000": WATCH_MODEL.GENERIC,
};

class WatchInfo {
    private state: Required<ModelInfo> & { name: string; shortName: string; address: string } = {
        name: "",
        shortName: "",
        address: "",
        ...DEFAULT_MODEL_INFO
    };

    get name() { return this.state.name; }
    get shortName() { return this.state.shortName; }
    get address() { return this.state.address; }
    get model() { return this.state.model; }
    get worldCitiesCount() { return this.state.worldCitiesCount; }
    get dstCount() { return this.state.dstCount; }
    get alarmCount() { return this.state.alarmCount; }
    get hasAutoLight() { return this.state.hasAutoLight; }
    get hasReminders() { return this.state.hasReminders; }
    get shortLightDuration() { return this.state.shortLightDuration; }
    get longLightDuration() { return this.state.longLightDuration; }
    get weekLanguageSupported() { return this.state.weekLanguageSupported; }
    get worldCities() { return this.state.worldCities; }
    get hasBatteryLevel() { return this.state.hasBatteryLevel; }
    get hasTemperature() { return this.state.hasTemperature; }
    get batteryLevelLowerLimit() { return this.state.batteryLevelLowerLimit; }
    get batteryLevelUpperLimit() { return this.state.batteryLevelUpperLimit; }
    get alwaysConnected() { return this.state.alwaysConnected; }
    get findButtonUserDefined() { return this.state.findButtonUserDefined; }
    get hasPowerSavingMode() { return this.state.hasPowerSavingMode; }
    get chimeInSettings() { return this.state.chimeInSettings; }
    get vibrate() { return this.state.vibrate; }
    get hasHealthFunctions() { return this.state.hasHealthFunctions; }
    get hasMessages() { return this.state.hasMessages; }
    get hasDateFormat() { return this.state.hasDateFormat; }
    get hasWorldCities() { return this.state.hasWorldCities; }
    get hasHomeTime() { return this.state.hasHomeTime; }
    get hasMultipleFonts() { return this.state.hasMultipleFonts; }
    get hasStepCounter() { return this.state.hasStepCounter; }
    get hasStepCounterMock() { return this.state.hasStepCounterMock; }
    get hasNewTimeFormat() { return this.state.hasNewTimeFormat; }
    get hasTimeAdjustment() { return this.state.hasTimeAdjustment; }
    get hasSecondDial() { return this.state.hasSecondDial; }
    get hasFineWatchCondition() { return this.state.hasFineWatchCondition; }
    get hasTimeFormat() { return this.state.hasTimeFormat; }
    get hasHourlyChime() { return this.state.hasHourlyChime; }
    get hasLongTimerKey() { return this.state.hasLongTimerKey; }
    get settingsSize() { return this.state.settingsSize; }

    get protocol(): WatchProtocol {
        if (this.state.model === WATCH_MODEL.GW_BX5600) return mipProtocol;
        if (this.state.model === WATCH_MODEL.MTG_B1000 || this.state.model === WATCH_MODEL.MTG_B3000) return analogueProtocol;
        return standardProtocol;
    }

    setNameAndModel(name: string) {
        const shortName = name.replace("CASIO ", "").trim().split(" ")[0] || "";
        const modelName = name.replace("CASIO ", "").trim();
        const model = exactModelMap[modelName] || WATCH_MODEL.GENERIC;
        const info = modelList.find(m => m.model === model) || DEFAULT_MODEL_INFO;

        this.state = {
            ...this.state,
            ...DEFAULT_MODEL_INFO,
            ...info,
            name,
            shortName,
            model
        };

        progressEvents.onNext("DeviceName", this.name);
    }

    setAddress(address: string) {
        this.state.address = address;
        progressEvents.onNext("DeviceAddress", address);
    }

    getAddress() {
        return this.state.address;
    }

    reset() {
        this.state = {
            name: "",
            shortName: "",
            address: "",
            ...DEFAULT_MODEL_INFO
        };
    }
}

export const watchInfo = new WatchInfo();
export default WATCH_MODEL;
