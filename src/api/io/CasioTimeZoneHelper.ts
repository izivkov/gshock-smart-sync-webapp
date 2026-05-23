import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

interface CasioTimeZoneData {
    name: string;
    zoneName: string;
    dstRules: number;
    zoneId: string;
    dstOffset: number;  // in 15-min intervals
    offset: number;     // in 15-min intervals
}

export function getStandardAndSummerOffsets(zoneName: string): { stdOffset: number, dstOffset: number } {
    try {
        const year = dayjs().year();
        const janOffset = dayjs.tz(`${year}-01-01`, zoneName).utcOffset();
        const julOffset = dayjs.tz(`${year}-07-01`, zoneName).utcOffset();

        const stdOffset = Math.min(janOffset, julOffset);
        const summerOffset = Math.max(janOffset, julOffset);
        return { stdOffset, dstOffset: summerOffset - stdOffset };
    } catch {
        return { stdOffset: 0, dstOffset: 0 };
    }
}

function getDSTOffset(zoneName: string): number {
    return getStandardAndSummerOffsets(zoneName).dstOffset;
}

function isEquivalent(zoneName1: string, zoneName2: string): boolean {
    const s1 = getStandardAndSummerOffsets(zoneName1);
    const s2 = getStandardAndSummerOffsets(zoneName2);

    return (
        s1.stdOffset === s2.stdOffset &&
        s1.dstOffset === s2.dstOffset
    );
}

function makeCasioTimeZone(
    name: string,
    zoneName: string,
    dstRules: number = 0
): CasioTimeZoneData {
    let nowOffset = 0;
    try {
        nowOffset = dayjs().tz(zoneName).utcOffset();
    } catch {
        // fallback
    }

    const { stdOffset, dstOffset: dstOffsetMinutes } = getStandardAndSummerOffsets(zoneName);

    const offset = stdOffset / 15;
    const dstOffset = dstOffsetMinutes / 15;

    // If no DST, override dstRules to 0
    const adjustedDstRules = dstOffset === 0 ? 0 : dstRules;

    return {
        name,
        zoneName,
        dstRules: adjustedDstRules,
        zoneId: zoneName,
        dstOffset,
        offset,
    };
}

// --- The table ---

const timeZoneTable: CasioTimeZoneData[] = [
    makeCasioTimeZone("BAKER ISLAND", "UTC-12"),
    makeCasioTimeZone("MARQUESAS ISLANDS", "Pacific/Marquesas", 0xDA),
    makeCasioTimeZone("PAGO PAGO", "Pacific/Pago_Pago"),
    makeCasioTimeZone("HONOLULU", "Pacific/Honolulu"),
    makeCasioTimeZone("ANCHORAGE", "America/Anchorage", 0x1),
    makeCasioTimeZone("LOS ANGELES", "America/Los_Angeles", 0x1),
    makeCasioTimeZone("DENVER", "America/Denver", 0x1),
    makeCasioTimeZone("CHICAGO", "America/Chicago", 0x1),
    makeCasioTimeZone("NEW YORK", "America/New_York", 0x1),
    makeCasioTimeZone("HALIFAX", "America/Halifax", 0x1),
    makeCasioTimeZone("ST.JOHN'S", "America/St_Johns", 0x1),
    makeCasioTimeZone("RIO DE JANEIRO", "America/Sao_Paulo"),
    makeCasioTimeZone("F.DE NORONHA", "America/Noronha"),
    makeCasioTimeZone("PRAIA", "Atlantic/Cape_Verde"),
    makeCasioTimeZone("UTC", "UTC"),
    makeCasioTimeZone("LONDON", "Europe/London", 0x02),
    makeCasioTimeZone("PARIS", "Europe/Paris", 0x02),
    makeCasioTimeZone("ATHENS", "Europe/Athens", 0x02),
    makeCasioTimeZone("JEDDAH", "Asia/Riyadh"),
    makeCasioTimeZone("JERUSALEM", "Asia/Jerusalem", 0x2A),
    makeCasioTimeZone("TEHRAN", "Asia/Tehran", 0x2B),
    makeCasioTimeZone("DUBAI", "Asia/Dubai"),
    makeCasioTimeZone("KABUL", "Asia/Kabul"),
    makeCasioTimeZone("KARACHI", "Asia/Karachi"),
    makeCasioTimeZone("DELHI", "Asia/Kolkata"),
    makeCasioTimeZone("KATHMANDU", "Asia/Kathmandu"),
    makeCasioTimeZone("DHAKA", "Asia/Dhaka"),
    makeCasioTimeZone("YANGON", "Asia/Yangon"),
    makeCasioTimeZone("BANGKOK", "Asia/Bangkok"),
    makeCasioTimeZone("HONG KONG", "Asia/Hong_Kong"),
    makeCasioTimeZone("PYONGYANG", "Asia/Pyongyang"),
    makeCasioTimeZone("EUCLA", "Australia/Eucla"),
    makeCasioTimeZone("TOKYO", "Asia/Tokyo"),
    makeCasioTimeZone("ADELAIDE", "Australia/Adelaide", 0x4),
    makeCasioTimeZone("SYDNEY", "Australia/Sydney", 0x4),
    makeCasioTimeZone("LORD HOWE ISLAND", "Australia/Lord_Howe", 0x12),
    makeCasioTimeZone("NOUMEA", "Pacific/Noumea"),
    makeCasioTimeZone("WELLINGTON", "Pacific/Auckland", 0x5),
    makeCasioTimeZone("CHATHAM ISLANDS", "Pacific/Chatham", 0x17),
    makeCasioTimeZone("NUKUALOFA", "Pacific/Tongatapu"),
    makeCasioTimeZone("KIRITIMATI", "Pacific/Kiritimati"),
    makeCasioTimeZone("CASABLANCA", "Africa/Casablanca", 0x0f),
    makeCasioTimeZone("BEIRUT", "Asia/Beirut", 0x0C),
    makeCasioTimeZone("NORFOLK ISLAND", "Pacific/Norfolk", 0x04),
    makeCasioTimeZone("EASTER ISLAND", "Pacific/Easter", 0x1C),
    makeCasioTimeZone("HAVANA", "America/Havana", 0x15),
    makeCasioTimeZone("SANTIAGO", "America/Santiago", 0x1B),
    makeCasioTimeZone("ASUNCION", "America/Asuncion", 0x09),
    makeCasioTimeZone("PONTA DELGADA", "Atlantic/Azores", 0x02),
];

const timeZoneMap = new Map<string, CasioTimeZoneData>(
    timeZoneTable.map(tz => [tz.zoneName, tz])
);

export function findTimeZone(timeZoneName: string): CasioTimeZoneData {
    // 1. Exact match
    const exact = timeZoneMap.get(timeZoneName);
    if (exact) return exact;

    // 2. Equivalent rules match
    const entries = [...timeZoneMap.values()];

    for (const entry of entries) {
        if (isEquivalent(entry.zoneName, timeZoneName)) {
            return entry;
        }
    }

    // 3. Fallback
    const name = timeZoneName.split("/").pop()?.toUpperCase() ?? "UNKNOWN";
    const DEFAULT_OFFSET = 0x00;
    return makeCasioTimeZone(name, timeZoneName, DEFAULT_OFFSET);
}
