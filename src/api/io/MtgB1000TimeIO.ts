import CasioIO, { GET_SET_MODE, CasioIOFunctional } from "@io/CasioIO";
import DstWatchStateIO from "@io/DstWatchStateIO";
import DstForWorldCitiesIO from "@io/DstForWorldCitiesIO";
import WorldCitiesIO from "@io/WorldCitiesIO";
import Utils from "@utils/Utils";

const RESET_SEQUENCE_START = [0x21, 0x00, 0x01]; // dial 0
const RESET_SEQUENCE_END = [0x21, 0x01, 0x01];   // dial 1

const MtgB1000TimeIO = {
    async setSecondDial(): Promise<void> {
        try {
            console.info("MtgB1000TimeIO: starting second dial sequence");

            // ResetSequence start
            await CasioIO.writeCmd(GET_SET_MODE.SET, RESET_SEQUENCE_START);
            console.info("ResetSequence start (210001)");

            // Read and write back DST watch state (0x1d)
            const dstData = await DstWatchStateIO.request(CasioIO.DTS_STATE.ZERO);
            // In web app, request already returns the byte array (number[])
            await CasioIO.writeCmd(GET_SET_MODE.SET, dstData);
            console.info("DST watch state written back");

            // Read and write back DST city settings (0x1e) for both cities
            const dstCity0 = await DstForWorldCitiesIO.request(0);
            const dstCity1 = await DstForWorldCitiesIO.request(1);
            await CasioIO.writeCmd(GET_SET_MODE.SET, dstCity0);
            await CasioIO.writeCmd(GET_SET_MODE.SET, dstCity1);
            console.info("DST city data written back");

            // Read and write back world city coordinates (0x1f) for both cities
            const wc0 = await WorldCitiesIO.request(0);
            const wc1 = await WorldCitiesIO.request(1);
            // WorldCitiesIO.request returns string? or number array?
            // In web app it seems it returns whatever resolver received.
            // MessageDispatcher passes number array.
            await CasioIO.writeCmd(GET_SET_MODE.SET, wc0 as any);
            await CasioIO.writeCmd(GET_SET_MODE.SET, wc1 as any);
            console.info("World city data written back");

            // ResetSequence end
            await CasioIO.writeCmd(GET_SET_MODE.SET, RESET_SEQUENCE_END);
            console.info("ResetSequence end (210101)");

            console.info("MtgB1000TimeIO: second dial sequence complete");
        } catch (e) {
            console.error("MtgB1000TimeIO: error during second dial sequence", e);
            throw e;
        }
    }
};

export default MtgB1000TimeIO;
