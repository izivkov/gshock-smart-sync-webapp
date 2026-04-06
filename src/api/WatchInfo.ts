import { progressEvents } from '@api/ProgressEvents';

export type dateFormatType = "MM:DD" | "DD:MM";
export type timeFormatType = "12h" | "24h";
export type languageType = "English" | "Spanish" | "French" | "German" | "Italian" | "Russian";
export type lightDurationType = "1.5s" | "2s" | "3s" | "4s" | "5s";

enum WATCH_MODEL {
    GA = "GA",
    GW = "GW",
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
    GENERIC = "GENERIC",
}

class ModelInfo {
    constructor(
        public model: WATCH_MODEL,
        public worldCitiesCount: number = 2,
        public dstCount: number = 1,
        public alarmCount: number = 5,
        public hasAutoLight: boolean = false,
        public hasReminders: boolean = false,
        public shortLightDuration: lightDurationType = "1.5s",
        public longLightDuration: lightDurationType = "3s",
        public weekLanguageSupported: boolean = true,
        public worldCities: boolean = true,
        public hasBatteryLevel: boolean = true,
        public hasTemperature: boolean = true,
        public batteryLevelLowerLimit: number = 15,
        public batteryLevelUpperLimit: number = 20,
        public alwaysConnected: boolean = false,
        public findButtonUserDefined: boolean = false,
        public hasPowerSavingMode: boolean = true,
        public chimeInSettings: boolean = false,
        public vibrate: boolean = false,
        public hasHealthFunctions: boolean = false,
        public hasMessages: boolean = false,
        public hasDateFormat: boolean = true,
        public hasWorldCities: boolean = true,
        public hasHomeTime: boolean = true,
        public hasMultipleFonts: boolean = false
    ) { }
}

class WatchInfo {
    name: string;
    shortName: string;
    address: string;
    model: WATCH_MODEL;
    worldCitiesCount: number;
    dstCount: number;
    alarmCount: number;
    hasAutoLight: boolean;
    hasReminders: boolean;
    shortLightDuration: lightDurationType;
    longLightDuration: lightDurationType;
    weekLanguageSupported: boolean;
    worldCities: boolean;
    hasBatteryLevel: boolean;
    hasTemperature: boolean;
    batteryLevelLowerLimit: number;
    batteryLevelUpperLimit: number;
    alwaysConnected: boolean;
    findButtonUserDefined: boolean;
    hasPowerSavingMode: boolean;
    chimeInSettings: boolean;
    vibrate: boolean;
    hasHealthFunctions: boolean;
    hasMessages: boolean;
    hasDateFormat: boolean;
    hasWorldCities: boolean;
    hasHomeTime: boolean;
    hasMultipleFonts: boolean;

    private models: ModelInfo[] = [];
    private modelMap: Record<string, ModelInfo> = {};

    constructor() {
        this.name = "";
        this.shortName = "";
        this.address = "";
        this.model = WATCH_MODEL.GENERIC;
        this.worldCitiesCount = 2;
        this.dstCount = 3;
        this.alarmCount = 5;
        this.hasAutoLight = false;
        this.hasReminders = false;
        this.shortLightDuration = "2s";
        this.longLightDuration = "4s";
        this.weekLanguageSupported = true;
        this.worldCities = true;
        this.hasTemperature = true;
        this.hasBatteryLevel = true;
        this.batteryLevelLowerLimit = 15;
        this.batteryLevelUpperLimit = 20;
        this.alwaysConnected = false;
        this.findButtonUserDefined = false;
        this.hasPowerSavingMode = true;
        this.chimeInSettings = false;
        this.vibrate = false;
        this.hasHealthFunctions = false;
        this.hasMessages = false;
        this.hasDateFormat = true;
        this.hasWorldCities = true;
        this.hasHomeTime = true;
        this.hasMultipleFonts = false;

        this.initializeModels();
    }

    initializeModels() {
        this.models = [
            new ModelInfo(WATCH_MODEL.GW, 6, 3, 5, true, true, "2s", "4s", true, true, true, true, 9, 19, false, false, true, false, false, false, false, true, true, true, false),
            new ModelInfo(WATCH_MODEL.GMW_BZ5000, 6, 3, 5, true, false, "1.5s", "3s", true, true, true, true, 9, 19, false, false, true, false, false, false, false, true, true, true, true),
            new ModelInfo(WATCH_MODEL.GW_BX5600, 2, 3, 5, true, false, "1.5s", "3s", true, true, true, true, 9, 19, false, false, true, false, false, false, false, true, true, true, true),
            new ModelInfo(WATCH_MODEL.MRG_B5000, 6, 3, 5, true, true, "2s", "4s", true, true, true, true, 9, 19, false, false, true, false, false, false, false, true, true, true, false),
            new ModelInfo(WATCH_MODEL.GCW_B5000, 6, 3, 5, true, true, "2s", "4s", true, true, true, true, 9, 19, false, false, true, false, false, false, false, true, true, true, false),
            new ModelInfo(WATCH_MODEL.GMW, 6, 3, 5, true, true, "2s", "4s", true, true, true, true, 9, 19, false, false, true, false, false, false, false, true, true, true, false),
            new ModelInfo(WATCH_MODEL.GST, 2, 1, 5, false, true, "1.5s", "3s"),
            new ModelInfo(WATCH_MODEL.ABL_100, 2, 1, 5, false, false, "1.5s", "3s", true, false, false, false),
            new ModelInfo(WATCH_MODEL.GA, 2, 1, 5, false, true, "1.5s", "3s"),
            new ModelInfo(WATCH_MODEL.GB001, 2, 1, 5, true, false, "1.5s", "3s"),
            new ModelInfo(WATCH_MODEL.MSG, 2, 1, 5, false, true, "1.5s", "3s"),
            new ModelInfo(WATCH_MODEL.GPR, 2, 1, 5, true, false, "1.5s", "3s", false),
            new ModelInfo(WATCH_MODEL.DW_H5600, 2, 1, 4, true, false, "1.5s", "5s", true, true, false, false, 15, 20, true, true, true, true, true, false, false, false, true, true, false),
            new ModelInfo(WATCH_MODEL.DW, 2, 1, 5, true, false, "1.5s", "3s"),
            new ModelInfo(WATCH_MODEL.GBD, 2, 1, 5, true, false, "1.5s", "3s", true, false, true, false),
            new ModelInfo(WATCH_MODEL.GBD_800, 2, 1, 5, true, false, "1.5s", "3s", true, false, false, false, 15, 20, false, false, true, false, false, false, false, false, false, true),
            new ModelInfo(WATCH_MODEL.EQB, 2, 1, 5, true, false, "1.5s", "3s", true, false, true, false),
            new ModelInfo(WATCH_MODEL.ECB, 2, 1, 5, true, false, "1.5s", "3s", true, true, false, false, 15, 20, true, true, false, false, false, false, false, true, true, true),
            new ModelInfo(WATCH_MODEL.GENERIC),
        ];

        for (const modelInfo of this.models) {
            this.modelMap[modelInfo.model] = modelInfo;
        }
    }

    setNameAndModel(name: string) {
        this.name = name;

        const parts = this.name.split(" ");
        if (parts.length > 1) {
            this.shortName = parts[1];
        }

        // Determine model based on short name
        if (this.shortName.startsWith("MRG-B5000")) {
            this.model = WATCH_MODEL.MRG_B5000;
        } else if (this.shortName.startsWith("GCW-B5000")) {
            this.model = WATCH_MODEL.GCW_B5000;
        } else if (this.shortName.startsWith("GMW-BZ5000")) {
            this.model = WATCH_MODEL.GMW_BZ5000;
        } else if (this.shortName.startsWith("GW-BX5600")) {
            this.model = WATCH_MODEL.GW_BX5600;
        } else if (this.shortName.startsWith("GM-B2100")) {
            this.model = WATCH_MODEL.GA;
        } else if (this.shortName.startsWith("ABL-100")) {
            this.model = WATCH_MODEL.ABL_100;
        } else if (this.shortName.startsWith("G-B001")) {
            this.model = WATCH_MODEL.GB001;
        } else if (this.shortName.startsWith("GMW")) {
            this.model = WATCH_MODEL.GMW;
        } else if (this.shortName.startsWith("GST")) {
            this.model = WATCH_MODEL.GST;
        } else if (this.shortName.startsWith("GPR")) {
            this.model = WATCH_MODEL.GPR;
        } else if (this.shortName.startsWith("MSG")) {
            this.model = WATCH_MODEL.MSG;
        } else if (this.shortName.startsWith("GBD-800")) {
            this.model = WATCH_MODEL.GBD_800;
        } else if (this.shortName.startsWith("GBD")) {
            this.model = WATCH_MODEL.GBD;
        } else if (this.shortName.startsWith("EQB")) {
            this.model = WATCH_MODEL.EQB;
        } else if (this.shortName.startsWith("GMB")) {
            this.model = WATCH_MODEL.GA;
        } else if (this.shortName === "ECB-10" || this.shortName === "ECB-20" || this.shortName === "ECB-30") {
            this.model = WATCH_MODEL.ECB;
        } else if (this.shortName.startsWith("GA")) {
            this.model = WATCH_MODEL.GA;
        } else if (this.shortName.startsWith("GB")) {
            this.model = WATCH_MODEL.GA;
        } else if (this.shortName.startsWith("GW")) {
            this.model = WATCH_MODEL.GW;
        } else if (this.shortName.startsWith("DW-H5600")) {
            this.model = WATCH_MODEL.DW_H5600;
        } else if (this.shortName.startsWith("DW")) {
            this.model = WATCH_MODEL.DW;
        } else {
            this.model = WATCH_MODEL.GENERIC;
        }

        const modelInfo = this.modelMap[this.model] || this.modelMap[WATCH_MODEL.GENERIC];
        if (modelInfo) {
            this.hasReminders = modelInfo.hasReminders;
            this.hasAutoLight = modelInfo.hasAutoLight;
            this.alarmCount = modelInfo.alarmCount;
            this.worldCitiesCount = modelInfo.worldCitiesCount;
            this.dstCount = modelInfo.dstCount;
            this.shortLightDuration = modelInfo.shortLightDuration;
            this.longLightDuration = modelInfo.longLightDuration;
            this.weekLanguageSupported = modelInfo.weekLanguageSupported;
            this.worldCities = modelInfo.worldCities;
            this.hasTemperature = modelInfo.hasTemperature;
            this.hasBatteryLevel = modelInfo.hasBatteryLevel;
            this.batteryLevelLowerLimit = modelInfo.batteryLevelLowerLimit;
            this.batteryLevelUpperLimit = modelInfo.batteryLevelUpperLimit;
            this.alwaysConnected = modelInfo.alwaysConnected;
            this.findButtonUserDefined = modelInfo.findButtonUserDefined;
            this.hasPowerSavingMode = modelInfo.hasPowerSavingMode;
            this.chimeInSettings = modelInfo.chimeInSettings;
            this.vibrate = modelInfo.vibrate;
            this.hasHealthFunctions = modelInfo.hasHealthFunctions;
            this.hasMessages = modelInfo.hasMessages;
            this.hasDateFormat = modelInfo.hasDateFormat;
            this.hasWorldCities = modelInfo.hasWorldCities;
            this.hasHomeTime = modelInfo.hasHomeTime;
            this.hasMultipleFonts = modelInfo.hasMultipleFonts;
        }

        progressEvents.onNext("DeviceName", this.name);
    }

    setAddress(address: string) {
        this.address = address;
        progressEvents.onNext("DeviceAddress", address);
    }

    getAddress() {
        return this.address;
    }

    reset() {
        this.address = "";
        this.name = "";
        this.shortName = "";
        this.model = WATCH_MODEL.GENERIC;
    }
}

export const watchInfo = new WatchInfo();
export default WATCH_MODEL;
