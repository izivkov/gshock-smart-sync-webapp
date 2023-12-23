import { progressEvents } from '@api/ProgressEvents';

export type dateFormatType = "MM:DD" | "DD:MM";
export type timeFormatType = "12h" | "24h";
export type languageType = "English" | "Spanish" | "French" | "German" | "Italian" | "Russian";
export type lightDurationType = "1.5s" | "2s" | "3s" | "4s";

enum WATCH_MODEL {
    GA = "GA",
    GW = "GW",
    DW = "DW",
    GMW = "GMW",
    UNKNOWN = "UNKNOWN",
}

class ModelInfo {
    constructor(
        public model: WATCH_MODEL,
        public worldCitiesCount: number,
        public dstCount: number,
        public alarmCount: number,
        public hasAutoLight: boolean,
        public hasReminders: boolean,
        public shortLightDuration: lightDurationType,
        public longLightDuration: lightDurationType
    ) { }
}

class WatchInfo {
    name: string;
    shortName: string;
    address: string;
    model: string;
    worldCitiesCount: number;
    dstCount: number;
    alarmCount: number;
    hasAutoLight: boolean;
    hasReminders: boolean;
    shortLightDuration: lightDurationType;
    longLightDuration: lightDurationType;

    private models: ModelInfo[] = [
        new ModelInfo(WATCH_MODEL.GW, 6, 3, 5, true, true, "2s", "4s"),
        new ModelInfo(WATCH_MODEL.GMW, 6, 3, 5, true, true, "2s", "4s"),
        new ModelInfo(WATCH_MODEL.GA, 2, 1, 5, false, true, "1.5s", "3s"),
        new ModelInfo(WATCH_MODEL.DW, 2, 1, 5, true, false, "1.5s", "3s"),
        new ModelInfo(WATCH_MODEL.UNKNOWN, 2, 1, 5, false, false, "1.5s", "3s"),
    ];

    private modelMap: Record<string, ModelInfo> = this.models.reduce(
        (map, modelInfo) => ({ ...map, [modelInfo.model]: modelInfo }),
        {} as Record<string, ModelInfo>
    );

    constructor() {
        this.name = "";
        this.shortName = "";
        this.address = "";
        this.model = "UNKNOWN";
        this.worldCitiesCount = 2;
        this.dstCount = 3;
        this.alarmCount = 5;
        this.hasAutoLight = false;
        this.hasReminders = false;
        this.shortLightDuration = "1.5s";
        this.longLightDuration = "3s";

        this.initializeModels();
    }

    initializeModels() {
        this.models = [
            new ModelInfo(WATCH_MODEL.GW, 6, 3, 5, true, true, "2s", "4s"),
            new ModelInfo(WATCH_MODEL.GA, 2, 1, 5, false, true, "1.5s", "3s"),
            new ModelInfo(WATCH_MODEL.DW, 2, 1, 5, true, false, "1.5s", "3s"),
            new ModelInfo(WATCH_MODEL.UNKNOWN, 2, 1, 5, false, false, "1.5s", "3s"),
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

        this.model = this.shortName.startsWith("GA") || this.shortName.startsWith("GMA")
            ? WATCH_MODEL.GA
            : this.shortName.startsWith("GW") || this.shortName.startsWith("GMW")
                ? WATCH_MODEL.GW
                : this.shortName.startsWith("DW") || this.shortName.startsWith("GDW")
                    ? WATCH_MODEL.DW
                    : WATCH_MODEL.UNKNOWN;

        const modelInfo = this.modelMap[this.model];
        this.hasReminders = modelInfo.hasReminders;
        this.hasAutoLight = modelInfo.hasAutoLight;
        this.alarmCount = modelInfo.alarmCount;
        this.worldCitiesCount = modelInfo.worldCitiesCount;
        this.dstCount = modelInfo.dstCount;
        this.shortLightDuration = modelInfo.shortLightDuration;
        this.longLightDuration = modelInfo.longLightDuration;

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
        this.model = WATCH_MODEL.UNKNOWN;
    }
}

export const watchInfo = new WatchInfo();
export default WATCH_MODEL;
