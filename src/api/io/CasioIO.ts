import { progressEvents } from "@api/ProgressEvents";
import { CasioConstants } from "@api/CasioConstants";
import { connection } from "@api/Connection";
import WatchDataListener from "@api/WatchDataListener";

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

    init: async (): Promise<void> => {
        await WatchDataListener.init();
    },

    request: function (request: string): void {
        this.writeCmdFromString(0xC, request);
    },

    writeCmd: async (handle: number, bytesArray: number[]): Promise<void> => {
        const resolvedHandle = CasioIO.handlesMap.get(handle);
        if (resolvedHandle === undefined) {
            progressEvents.onNext("ApiError");
            return;
        }
        await connection.write(
            resolvedHandle,
            bytesArray
        );
    },

    writeCmdFromString: function (handle: number, bytesStr: string): void {
        const resolvedHandle = CasioIO.handlesMap.get(handle);
        if (resolvedHandle === undefined) {
            progressEvents.onNext("ApiError");
            return;
        }
        connection.write(
            resolvedHandle,
            this.toCasioCmd(bytesStr)
        );
    },

    toCasioCmd: function (bytesStr: string): number[] {
        const parts = bytesStr.match(/.{1,2}/g);
        if (parts === null) {
            progressEvents.onNext("ApiError");
            return [0];
        }
        const byteArray = parts.map(str => {
            try {
                return parseInt(str, 16);
            } catch (e) {
                return 0; // Handle the error appropriately, e.g., throw an exception or log it.
            }
        });

        return byteArray;
    },

    handlesMap: new Map<number, string>([
        [0x04, CasioConstants.CASIO_GET_DEVICE_NAME],
        [0x06, CasioConstants.CASIO_APPEARANCE],
        [0x09, CasioConstants.TX_POWER_LEVEL_CHARACTERISTIC_UUID],
        [0x0c, CasioConstants.CASIO_READ_REQUEST_FOR_ALL_FEATURES_CHARACTERISTIC_UUID],
        [0x0e, CasioConstants.CASIO_ALL_FEATURES_CHARACTERISTIC_UUID],
        [0x11, CasioConstants.CASIO_DATA_REQUEST_SP_CHARACTERISTIC_UUID],
        [0x14, CasioConstants.CASIO_CONVOY_CHARACTERISTIC_UUID],
        [0xff, CasioConstants.SERIAL_NUMBER_STRING]
    ]),
};

export default CasioIO;
