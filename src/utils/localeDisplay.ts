/**
 * Display rules for time (12h in North America) and temperature (°F in US).
 * Uses `navigator` / `Intl` only; safe to call from client components.
 */

const NORTH_AMERICA_12H_REGIONS = new Set([
    "US",
    "CA",
    "MX",
    "PR",
    "VI",
    "GU",
    "AS",
    "MP",
    "UM",
    "BM",
    "TC",
]);

function regionFromLanguageTag(tag: string | undefined): string | undefined {
    if (!tag) return undefined;
    try {
        const Loc = typeof Intl !== "undefined" && (Intl as typeof Intl & { Locale?: typeof Intl.Locale }).Locale;
        if (Loc) {
            const r = new Loc(tag).maximize().region;
            if (r) return r;
        }
    } catch {
        /* fall through */
    }
    const m = /^[a-z]{2,3}-([A-Za-z]{2}|\d{3})\b/i.exec(tag.trim());
    return m ? m[1].toUpperCase() : undefined;
}

/** ISO 3166-1 alpha-2 from the first usable language tag, or from `Intl` default locale. */
export function getLikelyRegion(): string | undefined {
    if (typeof navigator === "undefined") return undefined;
    for (const tag of [navigator.language, ...(navigator.languages ?? [])]) {
        const r = regionFromLanguageTag(tag);
        if (r) return r;
    }
    try {
        const fallback = Intl.DateTimeFormat().resolvedOptions().locale;
        return regionFromLanguageTag(fallback);
    } catch {
        return undefined;
    }
}

/** US / Canada / Mexico (+ common territories): show clock times with AM/PM. */
export function isNorthAmerica12HourClock(): boolean {
    const r = getLikelyRegion();
    return r !== undefined && NORTH_AMERICA_12H_REGIONS.has(r);
}

/** IANA zones for Canada (used when language is `en-US` but the device is in Canada). */
const CANADA_TIME_ZONES = new Set<string>([
    "America/St_Johns",
    "America/Halifax",
    "America/Glace_Bay",
    "America/Moncton",
    "America/Goose_Bay",
    "America/Blanc-Sablon",
    "America/Toronto",
    "America/Nipigon",
    "America/Thunder_Bay",
    "America/Iqaluit",
    "America/Pangnirtung",
    "America/Atikokan",
    "America/Winnipeg",
    "America/Regina",
    "America/Swift_Current",
    "America/Edmonton",
    "America/Cambridge_Bay",
    "America/Yellowknife",
    "America/Inuvik",
    "America/Creston",
    "America/Dawson_Creek",
    "America/Fort_Nelson",
    "America/Vancouver",
    "America/Whitehorse",
    "America/Dawson",
    "America/Rainy_River",
    "America/Rankin_Inlet",
    "America/Resolute",
    "America/Coral_Harbour",
]);

function isLikelyCanadaFromTimeZone(): boolean {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return tz !== undefined && CANADA_TIME_ZONES.has(tz);
    } catch {
        return false;
    }
}

/**
 * °F only for United States. Canada and Mexico use °C (official); the watch still sends °C.
 *
 * Why this is not just `region === "US"`: many Canadians have `navigator.language` of `en-US`,
 * which resolves to region **US**, so we would wrongly show °F. We therefore:
 * - Prefer **any** `navigator.languages` entry with region CA or MX, or suffix `-CA` / `-MX`.
 * - If the system time zone is a Canadian IANA zone, treat as Canada (°C).
 */
export function useFahrenheitForTemperature(): boolean {
    if (typeof navigator === "undefined") return false;

    const tags = [...(navigator.languages ?? []), navigator.language];
    for (const tag of tags) {
        if (!tag) continue;
        if (/-(CA|MX)\b/i.test(tag)) return false;
        const r = regionFromLanguageTag(tag);
        if (r === "CA" || r === "MX") return false;
    }

    if (isLikelyCanadaFromTimeZone()) return false;

    return getLikelyRegion() === "US";
}

/**
 * Watch home time is treated as 24h `H:mm` or `HH:mm` from the device.
 * Reformats for display only (does not change watch data).
 */
export function formatHomeTimeForDisplay(
    homeTime: string | null | undefined,
    use12Hour: boolean
): string {
    if (homeTime == null || homeTime.trim() === "") return "--:--";
    const trimmed = homeTime.trim();
    const m = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!m) return trimmed;

    let h = parseInt(m[1], 10);
    const min = m[2].padStart(2, "0");
    if (h < 0 || h > 23) return trimmed;

    if (use12Hour) {
        const period = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${h12}:${min} ${period}`;
    }
    return `${h.toString().padStart(2, "0")}:${min}`;
}

/** Watch reports temperature as an integer °C (sensor byte). */
export function formatTemperatureFromCelsius(
    celsius: number,
    useFahrenheit: boolean
): { text: string; unit: "°C" | "°F" } {
    if (useFahrenheit) {
        const f = (celsius * 9) / 5 + 32;
        return { text: Math.round(f).toString(), unit: "°F" };
    }
    return { text: Math.round(celsius).toString(), unit: "°C" };
}
