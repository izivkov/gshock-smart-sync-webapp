
import { dateFormatType, languageType, timeFormatType, lightDurationType } from '@/api/WatchInfo';

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