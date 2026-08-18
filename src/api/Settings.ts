export interface Settings {
    timeFormat: "12h" | "24h";
    buttonTone: boolean;
    autoLight: boolean;
    powerSavingMode: boolean;
    lightDuration: "2s" | "4s";
    dateFormat: "DD:MM" | "MM:DD";
    language: "English" | "Spanish" | "French" | "German" | "Italian" | "Russian";
    keyVibration?: boolean;   // vibrate (DW-H5600 extended format)
    hourlyChime?:  boolean;   // chime   (DW-H5600 extended format)
    DnD?:          boolean;   // Do Not Disturb
    font?:         "Standard" | "Classic";  // hasMultipleFonts models
    timeAdjustment?: boolean;
    adjustmentTimeMinutes?: number;
}
