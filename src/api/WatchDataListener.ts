import { connection } from "@api/Connection";
import WatchDataEvents from "@api/WatchDataEvents";
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
            const dataJson = messageDispatcher.toJson(intArrayData);

            for (const topic in dataJson) {
                const value = dataJson[topic];
                WatchDataEvents.emitEvent(topic, value);
            }
        }

        connection.setDataReceivedCallback(dataReceived);
    },
};

export default WatchDataListener;
