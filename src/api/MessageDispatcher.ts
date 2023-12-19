import { CasioConstants } from "@api/CasioConstants";
import WatchNameIO from "@io/WatchNameIO";
import WorldCitiesIO from "@io/WorldCitiesIO";
import TimerIO from "@io/TimerIO";
import WatchConditionIO from "@io/WatchConditionIO";
import TimeIO from "@io/TimeIO";
import DstWatchStateIO from "@io/DstWatchStateIO";
import DstForWorldCitiesIO from "@io/DstForWorldCitiesIO"
import AlarmsIO from "@io/AlarmsIO";
import EventsIO from "@io/EventsIO";
import SettingsIO from "@io/SettingsIO";
import TimeAdjustmentIO from "@io/TimeAdjustmentIO";
import ButtonPressedIO from "@io/ButtonPressedIO";
import ErrorIO from "@io/ErrorIO";
import UnknownIO from "@io/UnknownIO";
import AppInfoIO from "@io/AppInfoIO";

class MessageDispatcher {
    watchSenders: Record<string, Function> = {
        "GET_ALARMS": AlarmsIO.sendToWatch,
        "SET_ALARMS": AlarmsIO.sendToWatchSet,
        "SET_REMINDERS": EventsIO.sendToWatchSet,
        "GET_SETTINGS": SettingsIO.sendToWatch,
        "SET_SETTINGS": SettingsIO.sendToWatchSet,
        "GET_TIME_ADJUSTMENT": TimeAdjustmentIO.sendToWatch,
        "SET_TIME_ADJUSTMENT": TimeAdjustmentIO.sendToWatchSet,
        "GET_TIMER": TimerIO.sendToWatch,
        "SET_TIMER": TimerIO.sendToWatchSet,
        "SET_TIME": TimeIO.sendToWatchSet,
    };

    dataReceivedMessages: Record<string, Function> = {
        [CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_ALM]: AlarmsIO.onReceived,
        [CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_ALM2]: AlarmsIO.onReceived,
        [CasioConstants.CHARACTERISTICS.CASIO_DST_SETTING]: DstForWorldCitiesIO.onReceived,
        [CasioConstants.CHARACTERISTICS.CASIO_REMINDER_TIME]: EventsIO.onReceived,
        [CasioConstants.CHARACTERISTICS.CASIO_REMINDER_TITLE]: EventsIO.onReceivedTitle,
        [CasioConstants.CHARACTERISTICS.CASIO_TIMER]: TimerIO.onReceived,
        [CasioConstants.CHARACTERISTICS.CASIO_WORLD_CITIES]: WorldCitiesIO.onReceived,
        [CasioConstants.CHARACTERISTICS.CASIO_DST_WATCH_STATE]: DstWatchStateIO.onReceived,
        [CasioConstants.CHARACTERISTICS.CASIO_WATCH_NAME]: WatchNameIO.onReceived,
        [CasioConstants.CHARACTERISTICS.CASIO_WATCH_CONDITION]: WatchConditionIO.onReceved,
        [CasioConstants.CHARACTERISTICS.CASIO_APP_INFORMATION]: AppInfoIO.onReceived,
        [CasioConstants.CHARACTERISTICS.CASIO_BLE_FEATURES]: ButtonPressedIO.onReceived,
        [CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_BASIC]: SettingsIO.onReceived,
        [CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_BLE]: TimeAdjustmentIO.onReceived,
        [CasioConstants.CHARACTERISTICS.ERROR]: ErrorIO.onReceived,
        [CasioConstants.CHARACTERISTICS.UNKNOWN]: UnknownIO.onReceived,
    };

    async sendToWatch(message: string) {
        const parsedMessage = JSON.parse(message);
        const action = parsedMessage.action;
        if (this.watchSenders[action]) {
            await this.watchSenders[action](message);
        } else {
            console.error("Unknown action: " + action);
        }
    }

    onReceived(data: any) {
        const key = data[0];
        if (this.dataReceivedMessages[key]) {
            return this.dataReceivedMessages[key](data);
        } else {
            console.error("GShockAPI", "Unknown key: " + key);
            return null; // You can handle this case as needed
        }
    }
}

export const messageDispatcher = new MessageDispatcher();
