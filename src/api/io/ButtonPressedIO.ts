import { cachedIO } from "@io/CachedIO";
import Utils from "@utils/Utils";
import CasioIO from "@io/CasioIO";

let deferredResult: Promise<string>;
let resolver: ((value?: string | PromiseLike<string>) => void);

const ButtonPressedIO = {
    async request(): Promise<string> {
        const value = await cachedIO.request("10", this.getPressedButton);
        ButtonPressedIO.put(value);
        return value;
    },

    async getPressedButton(key: string): Promise<string> {
        CasioIO.request(key);

        deferredResult = new Promise<string>((resolve) => {
            resolver = resolve as ((value?: string | PromiseLike<string>) => void);
        });

        return deferredResult
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

    onReceived(data: any): any {
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

        resolver!(ret);
    },
};

export default ButtonPressedIO;
