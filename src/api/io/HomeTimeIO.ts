import Utils from "@utils/Utils";
import WorldCitiesIO from "@io/WorldCitiesIO";

const HomeTimeIO = {
    async request() {
        const homeCityRaw: any = await WorldCitiesIO.request(0);
        return Utils.trimNonAsciiCharacters(Utils.toAsciiString(homeCityRaw, 2));
    }
};

export default HomeTimeIO
