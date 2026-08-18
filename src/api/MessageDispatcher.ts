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
import { watchInfo } from "./WatchInfo";
import Utils from "@utils/Utils";
import StepCounterIO from "@io/StepCounterIO";

class MessageDispatcher {
    private get watchSenders(): Record<string, (message: string) => Promise<void> | void> {
        return {
            "GET_ALARMS": (msg) => AlarmsIO.sendToWatch(msg),
            "SET_ALARMS": (msg) => AlarmsIO.sendToWatchSet(msg),
            "SET_REMINDERS": (msg) => EventsIO.sendToWatchSet(msg),
            "GET_SETTINGS": (msg) => SettingsIO.sendToWatch(msg),
            "SET_SETTINGS": (msg) => SettingsIO.sendToWatchSet(msg),
            "GET_TIME_ADJUSTMENT": (msg) => TimeAdjustmentIO.sendToWatch(msg),
            "SET_TIME_ADJUSTMENT": (msg) => TimeAdjustmentIO.sendToWatchSet(msg),
            "GET_TIMER": (msg) => TimerIO.sendToWatch(msg),
            "SET_TIMER": (msg) => TimerIO.sendToWatchSet(msg),
            "SET_TIME": (msg) => TimeIO.sendToWatchSet(msg),
        };
    }

    async sendToWatch(message: string) {
        const parsedMessage = JSON.parse(message);
        const action = parsedMessage.action;
        const senders = this.watchSenders;
        if (senders[action]) {
            await senders[action](message);
        } else {
            console.error("Unknown action: " + action);
        }
    }

    onReceived(data: number[], characteristicUuid: string) {
        if (characteristicUuid === CasioConstants.CASIO_DATA_REQUEST_SP_CHARACTERISTIC_UUID) {
            return StepCounterIO.onDrspReceived(data);
        }

        const hex = Utils.bytesToHex(data);
        const key = watchInfo.protocol!.extractKey(hex);

        if (key !== null && watchInfo.protocol!.dataReceivedHandlers[key]) {
            const unwrappedHex = watchInfo.protocol!.unwrapPayload(hex, key);
            const unwrappedData = Utils.hexToBytes(unwrappedHex);
            return watchInfo.protocol!.dataReceivedHandlers[key](unwrappedData as any);
        } else {
            console.error("GShockAPI", "Unknown key: " + key + " in data: " + hex + " from char: " + characteristicUuid);
            return null;
        }
    }
}

export const messageDispatcher = new MessageDispatcher();
