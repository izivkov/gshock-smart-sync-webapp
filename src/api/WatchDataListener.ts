import { connection } from "@api/Connection";
import { messageDispatcher } from "@api/MessageDispatcher";
import Utils from "@utils/Utils";

const WatchDataListener = {
    init() {
        function dataReceived(data: DataView) {
            if (data === null) {
                return;
            }

            const intArrayData = Utils.toIntArray(data);
            console.log("---> Received intArrayData " + intArrayData);
            const dataJson = messageDispatcher.onReceived(intArrayData);
        }

        connection.setDataReceivedCallback(dataReceived);
    },
};

export default WatchDataListener;
