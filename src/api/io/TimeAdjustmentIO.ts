import { CasioConstants } from "@api/CasioConstants";
import { cachedIO } from "@io/CachedIO";
import { connection } from "@api/Connection";
import CasioIO from "@io/CasioIO";

let deferredResult: Promise<boolean>;
let resolver: ((value?: boolean | PromiseLike<boolean>) => void);

const CasioIsAutoTimeOriginalValue = {
    value: new Uint8Array(),
};

async function request(): Promise<boolean> {
    const key = "11";
    return await cachedIO.request(key, getTimeAdjustment);
}

async function getTimeAdjustment(key: string): Promise<boolean> {
    CasioIO.request(key);

    deferredResult = new Promise<boolean>((resolve) => {
        resolver = resolve as ((value?: boolean | PromiseLike<boolean>) => void);
    });

    return deferredResult
}

async function set(settings: {
    timeAdjustment: boolean;
}): Promise<void> {
    const settingJson = JSON.stringify(settings);
    cachedIO.delete("GET_TIME_ADJUSTMENT");
    await connection.sendMessage(
        JSON.stringify({ action: "SET_TIME_ADJUSTMENT", value: settingJson })
    );
}

function isTimeAdjustmentSet(data: Uint8Array): boolean {
    const intArray = Array.from(data);
    const timeAdjustmentByte = intArray[12];
    return timeAdjustmentByte === 0;
}

function toJsonTimeAdjustment(isTimeAdjustmentSet: boolean): {
    timeAdjustment: boolean;
} {
    return {
        timeAdjustment: isTimeAdjustmentSet,
    };
}

function onReceived(data: any) {
    const isTimeAdjustmentSet = TimeAdjustmentIO.isTimeAdjustmentSet(data);
    CasioIsAutoTimeOriginalValue.value = data;
    resolver!(isTimeAdjustmentSet);
}

async function sendToWatch(message: string): Promise<void> {
    await CasioIO.writeCmd(
        0x000c,
        [CasioConstants.CHARACTERISTICS.CASIO_SETTING_FOR_BLE]
    );
}

async function sendToWatchSet(message: string): Promise<void> {
    const settings = JSON.parse(JSON.parse(message).value);
    settings.casioIsAutoTimeOriginalValue = CasioIsAutoTimeOriginalValue.value;

    const encodedTimeAdj: any = encodeTimeAdjustment(settings);
    if (encodedTimeAdj.length > 0) {
        await CasioIO.writeCmd(0x000e, encodedTimeAdj);
    }
}

function encodeTimeAdjustment(settings: {
    casioIsAutoTimeOriginalValue: Uint8Array;
    timeAdjustment: boolean;
}): Uint8Array {
    let casioIsAutoTimeOriginalValue = settings.casioIsAutoTimeOriginalValue;
    if (casioIsAutoTimeOriginalValue.length === 0) {
        return new Uint8Array();
    }

    let intArray = Array.from(casioIsAutoTimeOriginalValue);

    if (settings.timeAdjustment === true) {
        intArray[12] = 0x00;
    } else {
        intArray[12] = 0x80;
    }

    return new Uint8Array(intArray);
}

const TimeAdjustmentIO = {
    request,
    set,
    onReceived,
    sendToWatch,
    sendToWatchSet,
    isTimeAdjustmentSet,
    toJsonTimeAdjustment,
};

export default TimeAdjustmentIO;
