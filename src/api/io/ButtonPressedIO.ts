import { cachedIO } from "@io/CachedIO";
import Utils from "@utils/Utils";
import CasioIO from "@io/CasioIO";

const ButtonPressedIO = {
    async request(): Promise<string> {
        const value = await cachedIO.request("10", this.getPressedButton);
        ButtonPressedIO.put(value);
        return value;
    },

    async getPressedButton(key: string): Promise<string> {
        CasioIO.request(key);

        const deferredResult = new Promise<string>((resolve) => {
            cachedIO.resultQueue.enqueue({
                key,
                result: resolve,
            });
        });

        cachedIO.subscribe("BUTTON_PRESSED", (keyedData) => {
            const data = keyedData.value;
            const key = keyedData.key;

            let ret = CasioIO.WATCH_BUTTON.INVALID;

            if (data && data.length >= 19) {
                const bleIntArr = data;
                switch (bleIntArr[8]) {
                    case 0:
                    case 1:
                        ret = CasioIO.WATCH_BUTTON.LOWER_LEFT;
                        break;
                    case 2:
                        ret = CasioIO.WATCH_BUTTON.FIND_PHONE;
                        break;
                    case 4:
                        ret = CasioIO.WATCH_BUTTON.LOWER_RIGHT;
                        break;
                    case 3:
                        ret = CasioIO.WATCH_BUTTON.NO_BUTTON;
                        break;
                    default:
                        ret = CasioIO.WATCH_BUTTON.INVALID;
                }
            }

            const deferred = cachedIO.resultQueue.dequeue(key);
            if (deferred) {
                deferred(ret);
            }
        });

        return deferredResult;
    },

    get(): string {
        return cachedIO.get("10");
    },

    put(value: string): void {
        cachedIO.put("10", value);
    },

    clear(): void {
        cachedIO.delete("10");
    },

    toJson(data: any): any {
        const dataStr = Utils.toCompactString(data);
        const json: any = {
            BUTTON_PRESSED: {
                key: cachedIO.createKey(dataStr),
                value: data,
            },
        };
        return json;
    },
};

export default ButtonPressedIO;
