import { cachedIO } from "@io/CachedIO";
import Utils from "@utils/Utils";
import CasioIO from "@io/CasioIO";
import { resolve } from "path";

let deferredResult: Promise<string>;
let resolver: ((value?: string | PromiseLike<string>) => void) | undefined;

const WatchNameIO = {

  request: async function (): Promise<string> {
    const key = "23";
    const watchName = await cachedIO.request(key, this.getWatchName);
    return watchName;
  },

  getWatchName: async (key: string): Promise<string> => {
    CasioIO.request(key);

    deferredResult = new Promise<string>((resolve) => {
      resolver = resolve as (value?: string | PromiseLike<string>) => void;
    });

    return deferredResult;
  },

  onReceived: (data: any) => {
    const result = Utils.trimNonAsciiCharacters(Utils.toAsciiString(data, 3));
    resolver!(result);
  },
}

export default WatchNameIO;
