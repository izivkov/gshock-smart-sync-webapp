import { DateTime, IANAZone } from "luxon";

interface CasioTimeZoneData {
    name: string;
    zoneName: string;
    dstRules: number;
    zoneId: string;
    dstOffset: number;  // in 15-min intervals
    offset: number;     // in 15-min intervals
}

function makeCasioTimeZone(
    name: string,
    zoneName: string,
    dstRules: number = 0
): CasioTimeZoneData {
    const now = DateTime.now().setZone(zoneName);
    const zone = IANAZone.create(zoneName);

    // Standard offset in 15-min intervals
    const offsetMinutes = now.offset; // total current offset in minutes
    const dstOffsetMinutes = getDSTOffset(zoneName);
    const standardOffsetMinutes = offsetMinutes - dstOffsetMinutes;

    const offset = standardOffsetMinutes / 15;
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

function getDSTOffset(zoneName: string): number {
    const zone = IANAZone.create(zoneName);
    if (!zone.isValid) return 0;

    const now = DateTime.now().setZone(zoneName);
    const isInDST = now.isInDST;

    if (!isInDST) {
        // Look ahead up to a year to find a DST period
        for (let days = 1; days <= 365; days++) {
            const future = now.plus({ days });
            if (future.isInDST) {
                const dstTotal = future.offset;
                const stdTotal = now.offset;
                return dstTotal - stdTotal;
            }
        }
        return 0;
    } else {
        // Currently in DST — find the standard offset by looking forward
        for (let days = 1; days <= 365; days++) {
            const future = now.plus({ days });
            if (!future.isInDST) {
                return now.offset - future.offset;
            }
        }
        return 0;
    }
}

function isEquivalent(zoneName1: string, zoneName2: string): boolean {
    const year = DateTime.now().year;

    const toSamples = (zone: string) => ({
        winter: DateTime.fromObject({ year, month: 1, day: 1 }, { zone }),
        summer: DateTime.fromObject({ year, month: 7, day: 1 }, { zone }),
    });

    const s1 = toSamples(zoneName1);
    const s2 = toSamples(zoneName2);

    return (
        s1.winter.offset === s2.winter.offset &&
        s1.summer.offset === s2.summer.offset
    );
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
    // Convert the iterator to an array using the spread operator [...]
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
