import { progressEvents } from "@api/ProgressEvents";
import { CasioConstants } from "@api/CasioConstants";
import { cachedIO } from "./CachedIO";

export enum GET_SET_MODE {
    GET = 0x0c,
    SET = 0x0e,
    SP_REQUEST = 0x17,
    SP_DATA = 0x19,
    DATA_REQUEST = 0x11,
    CONVOY = 0x14
}

export const CasioIOFunctional = {
    toCasioCmd(bytesStr: string): number[] {
        const parts = bytesStr.match(/.{1,2}/g);
        if (parts === null) {
            progressEvents.onNext("ApiError");
            return [0];
        }
        return parts.map(str => {
            try {
                return parseInt(str, 16);
            } catch (e) {
                return 0;
            }
        });
    }
};

let externalWriter: ((handle: string, value: number[]) => Promise<void>) | null = null;

const CasioIO = {
    mAvailableCharacteristics: null,

    WATCH_BUTTON: {
        UPPER_LEFT: 'UPPER_LEFT',
        LOWER_LEFT: 'LOWER_LEFT',
        UPPER_RIGHT: 'UPPER_RIGHT',
        LOWER_RIGHT: 'LOWER_RIGHT',
        NO_BUTTON: 'NO_BUTTON',
        FIND_PHONE: 'FIND_PHONE',
        INVALID: 'INVALID',
    },

    DTS_STATE: {
        ZERO: 0,
        TWO: 2,
        FOUR: 4,
    },

    setWriter: (writer: (handle: string, value: number[]) => Promise<void>) => {
        externalWriter = writer;
    },

    init: async (): Promise<void> => {
        // NO-OP
    },

    request: async function (request: string): Promise<void> {
        await this.writeCmdFromString(GET_SET_MODE.GET, request);
    },

    writeCmd: async (handle: number, bytesArray: number[]): Promise<void> => {
        const resolvedHandle = CasioIO.handlesMap.get(handle);
        if (resolvedHandle === undefined) {
            progressEvents.onNext("ApiError");
            return;
        }
        if (externalWriter) {
            await externalWriter(resolvedHandle, bytesArray);
        } else {
            console.error("CasioIO: No writer registered!");
        }
    },

    writeCmdFromString: async function (handle: number, bytesStr: string): Promise<void> {
        const resolvedHandle = CasioIO.handlesMap.get(handle);
        if (resolvedHandle === undefined) {
            progressEvents.onNext("ApiError");
            return;
        }
        if (externalWriter) {
            await externalWriter(
                resolvedHandle,
                CasioIOFunctional.toCasioCmd(bytesStr)
            );
        } else {
            console.error("CasioIO: No writer registered!");
        }
    },

    toCasioCmd: function (bytesStr: string): number[] {
        return CasioIOFunctional.toCasioCmd(bytesStr);
    },

    removeFromCache: function (newValue: string): void {
        const key = cachedIO.createKey(newValue)
        cachedIO.remove(key)
    },

    handlesMap: new Map<number, string>([
        [0x04, CasioConstants.CASIO_GET_DEVICE_NAME],
        [0x06, CasioConstants.CASIO_APPEARANCE],
        [0x09, CasioConstants.TX_POWER_LEVEL_CHARACTERISTIC_UUID],
        [0x0c, CasioConstants.CASIO_READ_REQUEST_FOR_ALL_FEATURES_CHARACTERISTIC_UUID],
        [0x0e, CasioConstants.CASIO_ALL_FEATURES_CHARACTERISTIC_UUID],
        [0x11, CasioConstants.CASIO_DATA_REQUEST_SP_CHARACTERISTIC_UUID],
        [0x14, CasioConstants.CASIO_CONVOY_CHARACTERISTIC_UUID],
        [0x17, CasioConstants.CASIO_SET_CONFIGURATION_CHARACTERISTIC_UUID],
        [0x19, CasioConstants.CASIO_GET_CONFIGURATION_CHARACTERISTIC_UUID],
        [0xff, CasioConstants.SERIAL_NUMBER_STRING]
    ]),
};

export default CasioIO;
