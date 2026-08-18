import { progressEvents } from "@api/ProgressEvents";
import { watchInfo } from "@/api/WatchInfo";
import Utils from "@utils/Utils";

export const RunActionsIOFunctional = {
    isRunActionsTrigger(data: string | number[]): boolean {
        const hex = typeof data === 'string' ? data : Utils.bytesToHex(data as number[]);
        // Kotlin: data == "0x0A 02" && WatchInfo.alwaysConnected
        // In my impl, hex might be "0A02" or similar depending on how MessageDispatcher passes it.
        return (hex.toLowerCase().replace(/\s/g, '') === "0a02") && watchInfo.alwaysConnected;
    }
};

const RunActionsIO = {
    onReceived(data: any) {
        if (RunActionsIOFunctional.isRunActionsTrigger(data)) {
            console.info("Run actions triggered by always-connected watch");
            progressEvents.onNext("RunActions");
        }
    }
};

export default RunActionsIO;
