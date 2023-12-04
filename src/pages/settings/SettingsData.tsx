
export type dateFormatType = "MM:DD" | "DD:MM";
export type timeFormatType = "12h" | "24h";
export type languageType = "English" | "Spanish" | "French" | "German" | "Italian" | "Russian";
export type lightDurationType = "1.5s" | "2s" | "3s" | "4s";

interface SettingsData {

    timeFormat: timeFormatType
    autoLight: boolean,
    buttonTone: boolean,
    dateFormat: dateFormatType,
    language: languageType,
    lightDuration: lightDurationType,
    powerSavingMode: boolean,
    timeAdjustment: boolean,
}

export default SettingsData