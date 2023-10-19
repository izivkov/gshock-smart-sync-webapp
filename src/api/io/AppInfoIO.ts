import { cachedIO } from "@io/CachedIO";
import Utils from "@utils/Utils";
import CasioIO from "@io/CasioIO";

const AppInfoIO = {
    async request(): Promise<void> {
        return await cachedIO.request("22", this.getAppInfo);
    },

    async getAppInfo(key: string): Promise<void> {
        CasioIO.request(key);

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

        const deferredResult = new Promise<void>((resolve) => {
            cachedIO.resultQueue.enqueue({
                key,
                result: resolve,
            });
        });

        cachedIO.subscribe("CASIO_APP_INFORMATION", (keyedData) => {
            const data = keyedData.value;
            const key = keyedData.key;

            const deferred = cachedIO.resultQueue.dequeue(key);
            if (deferred) {
                deferred(data);
            }

            setAppInfo(data);
        });

        return deferredResult;
    },

    toJson(data: any): any {
        const dataStr = Utils.toCompactString(data);
        const json: any = {
            CASIO_APP_INFORMATION: {
                key: cachedIO.createKey(dataStr),
                value: data,
            },
        };
        return json;
    },
};

export default AppInfoIO;
