import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

export interface CasioTimeZoneData {
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

function getDSTOffsetMinutes(zoneName: string): number {
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
    const exact = timeZoneMap.get(timeZoneName);
    if (exact) return exact;

    const entries = [...timeZoneMap.values()];
    for (const entry of entries) {
        if (isEquivalent(entry.zoneName, timeZoneName)) {
            return entry;
        }
    }

    const name = timeZoneName.split("/").pop()?.toUpperCase() ?? "UNKNOWN";
    const DEFAULT_OFFSET = 0x00;
    return makeCasioTimeZone(name, timeZoneName, DEFAULT_OFFSET);
}

const worldCityCoordinates: Record<string, { lat: number, lon: number }> = {
    "Asia/Ho_Chi_Minh": { lat: 10.7958, lon: 106.7062 },
    "Europe/Madrid": { lat: 41.4548, lon: 2.2502 },
    "Asia/Shanghai": { lat: 22.7230, lon: 114.2611 },
    "UTC-12": { lat: 0.1936, lon: -176.4769 },
    "Pacific/Marquesas": { lat: -8.9167, lon: -140.1000 },
    "Pacific/Pago_Pago": { lat: -14.2781, lon: -170.7025 },
    "Pacific/Honolulu": { lat: 21.3069, lon: -157.8583 },
    "America/Anchorage": { lat: 61.2181, lon: -149.9003 },
    "America/Los_Angeles": { lat: 34.0522, lon: -118.2437 },
    "America/Denver": { lat: 39.7392, lon: -104.9903 },
    "America/Chicago": { lat: 41.8781, lon: -87.6298 },
    "America/New_York": { lat: 40.7128, lon: -74.0060 },
    "America/Halifax": { lat: 44.6488, lon: -63.5752 },
    "America/St_Johns": { lat: 47.5615, lon: -52.7126 },
    "America/Sao_Paulo": { lat: -22.9068, lon: -43.1729 },
    "America/Noronha": { lat: -3.8536, lon: -32.4297 },
    "Atlantic/Cape_Verde": { lat: 14.9330, lon: -23.5133 },
    "UTC": { lat: 0.0, lon: 0.0 },
    "Europe/London": { lat: 51.5074, lon: -0.1278 },
    "Europe/Paris": { lat: 48.8566, lon: 2.3522 },
    "Europe/Athens": { lat: 37.9838, lon: 23.7275 },
    "Asia/Riyadh": { lat: 21.4858, lon: 39.1925 },
    "Asia/Jerusalem": { lat: 31.7683, lon: 35.2137 },
    "Asia/Tehran": { lat: 35.6892, lon: 51.3890 },
    "Asia/Dubai": { lat: 25.2048, lon: 55.2708 },
    "Asia/Kabul": { lat: 34.5553, lon: 69.2075 },
    "Asia/Karachi": { lat: 24.8607, lon: 67.0011 },
    "Asia/Kolkata": { lat: 28.6139, lon: 77.2090 },
    "Asia/Kathmandu": { lat: 27.7172, lon: 85.3240 },
    "Asia/Dhaka": { lat: 23.8103, lon: 90.4125 },
    "Asia/Yangon": { lat: 16.8661, lon: 96.1951 },
    "Asia/Bangkok": { lat: 13.7563, lon: 100.5018 },
    "Asia/Hong_Kong": { lat: 22.3193, lon: 114.1694 },
    "Asia/Pyongyang": { lat: 39.0392, lon: 125.7625 },
    "Australia/Eucla": { lat: -31.6784, lon: 128.8869 },
    "Asia/Tokyo": { lat: 35.6762, lon: 139.6503 },
    "Australia/Adelaide": { lat: -34.9285, lon: 138.6007 },
    "Australia/Sydney": { lat: -33.8688, lon: 151.2093 },
    "Australia/Lord_Howe": { lat: -31.5553, lon: 159.0821 },
    "Pacific/Noumea": { lat: -22.2758, lon: 166.4581 },
    "Pacific/Auckland": { lat: -41.2865, lon: 174.7762 },
    "Pacific/Chatham": { lat: -43.9500, lon: -176.5500 },
    "Pacific/Tongatapu": { lat: -21.1789, lon: -175.1982 },
    "Pacific/Kiritimati": { lat: 1.8721, lon: -157.4278 },
    "Africa/Casablanca": { lat: 33.5731, lon: -7.5898 },
    "Asia/Beirut": { lat: 33.8938, lon: 35.5018 },
    "Pacific/Norfolk": { lat: -29.0408, lon: 167.9547 },
    "Pacific/Easter": { lat: -27.1127, lon: -109.3497 },
    "America/Havana": { lat: 23.1136, lon: -82.3666 },
    "America/Santiago": { lat: -33.4489, lon: -70.6693 },
    "America/Asuncion": { lat: -25.2637, lon: -57.5759 },
    "Atlantic/Azores": { lat: 37.7412, lon: -25.6756 },
};

export function getWorldCityCoordinates(zoneId: string): { lat: number, lon: number, isConfirmed: boolean } {
    const coords = worldCityCoordinates[zoneId];
    if (coords) return { ...coords, isConfirmed: true };

    try {
        const offsetMinutes = dayjs().tz(zoneId).utcOffset();
        const approxLon = (offsetMinutes / 60.0) * 15.0;
        return { lat: 0.0, lon: Math.max(-180, Math.min(180, approxLon)), isConfirmed: false };
    } catch {
        return { lat: 0.0, lon: 0.0, isConfirmed: false };
    }
}
