import GShockAPI from "@/api/GShockAPI";
import {
    watchInfo,
    type dateFormatType,
    type languageType,
    type lightDurationType,
    type timeFormatType,
} from "@api/WatchInfo";

/** Matches Kotlin `Locale.DayOfWeekLanguage` → API `language` string. */
function languageFromNavigator(): languageType {
    const lang =
        typeof navigator !== "undefined"
            ? navigator.language.split("-")[0].toLowerCase()
            : "en";
    const map: Record<string, languageType> = {
        en: "English",
        es: "Spanish",
        fr: "French",
        de: "German",
        it: "Italian",
        ru: "Russian",
    };
    return map[lang] ?? "English";
}

function browserLocale(): string | undefined {
    return typeof navigator !== "undefined" ? navigator.language : undefined;
}

/**
 * Prefer how the locale actually *prints* afternoon time (with am/pm or with 15:00).
 * `resolvedOptions().hour12` is often `undefined` when date+time options are combined,
 * and `undefined` was previously treated as falsy → wrong 24h. For `en-CA`, some
 * engines also report `hour12: false` while time-only formats still use a 12-hour clock.
 */
function prefers12HourFromFormattedTime(locale?: string): boolean {
    const afternoon = new Date(2000, 6, 15, 15, 30, 0); // 3:30 PM
    const fmt = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "numeric" });
    return fmt.formatToParts(afternoon).some((p) => p.type === "dayPeriod");
}

/**
 * Infer date order (MM:DD vs DD:MM) and 12h vs 24h from the browser locale.
 * Uses a fixed calendar day (23) so month vs day order is unambiguous (unlike e.g. 3/4).
 */
function localeTimeAndDateDefaults(): {
    dateFormat: dateFormatType;
    timeFormat: timeFormatType;
} {
    try {
        const locale = browserLocale();
        const anchor = new Date(2000, 0, 23); // 23 Jan — day > 12 avoids m/d ambiguity

        const dateFmt = new Intl.DateTimeFormat(locale, {
            year: "numeric",
            month: "numeric",
            day: "numeric",
        });
        const parts = dateFmt.formatToParts(anchor);
        const dayIdx = parts.findIndex((p) => p.type === "day");
        const monthIdx = parts.findIndex((p) => p.type === "month");
        const dateFormat: dateFormatType =
            dayIdx !== -1 && monthIdx !== -1 && dayIdx < monthIdx ? "DD:MM" : "MM:DD";

        const timeFormat: timeFormatType = prefers12HourFromFormattedTime(locale)
            ? "12h"
            : "24h";

        return { dateFormat, timeFormat };
    } catch {
        return { dateFormat: "MM:DD", timeFormat: "12h" };
    }
}

/** Kotlin: INTERRUPTION_FILTER_ALL → button tone on; web: treat denied as off. */
function buttonToneFromEnvironment(): boolean {
    if (typeof Notification === "undefined") return true;
    return Notification.permission !== "denied";
}

export interface SettingsFormState {
    autoLight: boolean;
    buttonTone: boolean;
    dateFormat: dateFormatType;
    language: languageType;
    lightDuration: lightDurationType;
    powerSavingMode: boolean;
    timeAdjustment: boolean;
    timeFormat: timeFormatType;
}

/**
 * Smart defaults aligned with Android `SettingsViewModel.getSmartDefaults()`:
 * locale from browser, button tone from notification permission, light off + short,
 * power saving if battery ≤ 15 or already on (watch read), time sync on.
 * Does not send anything to the watch.
 */
export async function getSmartDefaultsForSettings(
    current: SettingsFormState
): Promise<Partial<SettingsFormState>> {
    const { dateFormat, timeFormat } = localeTimeAndDateDefaults();
    const short: lightDurationType = watchInfo.shortLightDuration || "2s";

    const patch: Partial<SettingsFormState> = {
        timeFormat,
        dateFormat,
        language: languageFromNavigator(),
        buttonTone: buttonToneFromEnvironment(),
        autoLight: false,
        lightDuration: short,
        timeAdjustment: true,
    };

    if (watchInfo.hasPowerSavingMode) {
        let battery: number | null = null;
        try {
            battery = await GShockAPI.getBatteryLevel();
        } catch {
            battery = null;
        }
        const lowBattery = battery !== null && battery <= 15;
        patch.powerSavingMode = lowBattery || current.powerSavingMode;
    }

    return patch;
}
