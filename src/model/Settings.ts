class Settings {
    timeFormat: string = "";
    dateFormat: string = "";
    language: string = "";
    autoLight: boolean = false;
    lightDuration: string = "";
    powerSavingMode: boolean = false;
    buttonTone: boolean = true;
    timeAdjustment: boolean = true;

    constructor() { }
}

export const settings = new Settings();
