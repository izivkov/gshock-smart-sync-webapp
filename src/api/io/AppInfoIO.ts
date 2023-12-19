import { cachedIO } from "@io/CachedIO";
import Utils from "@utils/Utils";
import CasioIO from "@io/CasioIO";

let deferredResult: Promise<void>;
let resolver: ((value?: void | PromiseLike<void>) => void);

const AppInfoIO = {
    async request(): Promise<void> {
        return await cachedIO.request("22", this.getAppInfo);
    },

    async getAppInfo(key: string): Promise<void> {
        CasioIO.request(key);

        deferredResult = new Promise<void>((resolve) => {
            resolver = resolve as ((value?: void | PromiseLike<void>) => void);
        });

        return deferredResult
    },

    onReceived(data: any): any {
        function setAppInfo(data: any): void {
            // App info:
            // This is needed to re-enable button D (Lower-right) after the watch has been reset or BLE has been cleared.
            // It is a hard-coded value, which is what the official app does as well.

            // If the watch was reset, the app info will come as:
            // 0x22 FF FF FF FF FF FF FF FF FF FF 00
            // In this case, set it to the hardcoded value below, so 'D' button will work again.
            const appInfoCompactStr = Utils.toCompactString(data);
            if (appInfoCompactStr === "22FFFFFFFFFFFFFFFFFFFF00") {
                CasioIO.writeCmdFromString(0xE, "223488F4E5D5AFC829E06D02");
            }
        }

        setAppInfo(data);

        resolver!(data);
    },
};

export default AppInfoIO;
