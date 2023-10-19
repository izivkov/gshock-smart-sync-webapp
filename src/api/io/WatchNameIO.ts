import { cachedIO } from "@io/CachedIO";
import Utils from "@utils/Utils";
import CasioIO from "@io/CasioIO";

const WatchNameIO = {
  request: async function (): Promise<string> {
    const key = "23";
    const watchName = await cachedIO.request(key, this.getWatchName);
    return watchName;
  },

  getWatchName: async (key: string): Promise<string> => {
    CasioIO.request(key);

    const deferredResult = new Promise<string>((resolve) => {
      cachedIO.resultQueue.enqueue({
        key: key,
        result: resolve,
      });
    });

    cachedIO.subscribe("CASIO_WATCH_NAME", (keyedData) => {
      const data = keyedData.value;
      const key = keyedData.key;

      const result = Utils.trimNonAsciiCharacters(Utils.toAsciiString(data, 4));
      const deferred = cachedIO.resultQueue.dequeue(key);
      if (deferred) {
        deferred(result);
      }
    });

    return await deferredResult;
  },

  toJson: (data: any): Record<string, any> => {
    const json: Record<string, any> = {};
    const dataStr = Utils.toCompactString(data);

    const dataJson = {
      key: cachedIO.createKey(dataStr),
      value: data,
    };
    json["CASIO_WATCH_NAME"] = dataJson;
    return json;
  },
};

export default WatchNameIO;
