import { connection } from "@api/Connection";
import { messageDispatcher } from "@api/MessageDispatcher";
import Utils from "@utils/Utils";

const WatchDataListener = {
    init() {
        function dataReceived(data: DataView, characteristicUuid: string) {
            if (data === null) {
                return;
            }

            const intArrayData = Utils.toIntArray(data);
            console.log(`---> Received intArrayData from ${characteristicUuid}: ${intArrayData}`);
            messageDispatcher.onReceived(intArrayData, characteristicUuid);
        }

        connection.setDataReceivedCallback(dataReceived);
    },
};

export default WatchDataListener;
