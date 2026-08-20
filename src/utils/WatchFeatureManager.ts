import { watchInfo } from "@/api/WatchInfo";

export type FeatureId =
    | "locale.date_format"
    | "locale.time_format"
    | "locale.week_language"
    | "settings.power_saving"
    | "settings.multiple_fonts"
    | "light.auto_light"
    | "light.duration"
    | "operation_tone.sound"
    | "operation_tone.vibrate"
    | "time.battery"
    | "time.world_cities"
    | "time.home_time"
    | "time.temperature"
    | "actions.find_phone"
    | "actions.reminders"
    | "time.step_counter"
    | "alarms.chime"
    | "time_adjustment.supported"
    | "time_adjustment.always_connected";

export type CardId =
    | "locale_card"
    | "power_saving_card"
    | "font_card"
    | "light_card"
    | "operation_tone_card"
    | "step_counter_card"
    | "time_adjustment_card"
    | "home_time_card"
    | "battery_temperature_card";

const featureMap: Record<FeatureId, () => boolean> = {
    "locale.date_format": () => watchInfo.hasDateFormat,
    "locale.time_format": () => watchInfo.hasTimeFormat,
    "locale.week_language": () => watchInfo.weekLanguageSupported,
    "settings.power_saving": () => watchInfo.hasPowerSavingMode,
    "settings.multiple_fonts": () => watchInfo.hasMultipleFonts,
    "light.auto_light": () => watchInfo.hasAutoLight,
    "light.duration": () => true,
    "operation_tone.sound": () => true,
    "operation_tone.vibrate": () => watchInfo.vibrate,
    "time.battery": () => watchInfo.hasBatteryLevel,
    "time.world_cities": () => watchInfo.hasWorldCities,
    "time.home_time": () => watchInfo.hasHomeTime,
    "time.temperature": () => watchInfo.hasTemperature,
    "actions.find_phone": () => watchInfo.findButtonUserDefined,
    "actions.reminders": () => watchInfo.hasReminders,
    "time.step_counter": () => watchInfo.hasStepCounter || watchInfo.hasStepCounterMock,
    "alarms.chime": () => watchInfo.chimeInSettings,
    "time_adjustment.supported": () => watchInfo.hasTimeAdjustment,
    "time_adjustment.always_connected": () => watchInfo.alwaysConnected,
};

const cardGroups: Record<CardId, FeatureId[]> = {
    "locale_card": ["locale.date_format", "locale.time_format", "locale.week_language"],
    "power_saving_card": ["settings.power_saving"],
    "font_card": ["settings.multiple_fonts"],
    "light_card": ["light.auto_light", "light.duration"],
    "operation_tone_card": ["operation_tone.sound", "operation_tone.vibrate"],
    "step_counter_card": ["time.step_counter"],
    "time_adjustment_card": ["time_adjustment.supported", "time_adjustment.always_connected"],
    "home_time_card": ["time.home_time"],
    "battery_temperature_card": ["time.battery", "time.temperature"],
};

export const WatchFeatureManager = {
    isFeatureSupported(featureId: FeatureId | CardId): boolean {
        if (featureId in cardGroups) {
            return this.isCardSupported(featureId as CardId);
        }

        const lookup = featureMap[featureId as FeatureId];
        return lookup ? lookup() : true;
    },

    isCardSupported(cardId: CardId): boolean {
        const features = cardGroups[cardId];
        if (!features) return true;
        return features.some((id) => this.isFeatureSupported(id));
    },

    getWatchName(): string {
        return watchInfo.name;
    },

    getAlarmCount(): number {
        return watchInfo.alarmCount;
    },
};
