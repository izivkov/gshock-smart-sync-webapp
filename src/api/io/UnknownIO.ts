import Utils from "@utils/Utils";

interface UnknownData {
    key: string;
    value: string;
}

const UnknownIO = {
    async request(): Promise<string> {
        return "UNKNOWN";
    },

    toJson(data: any): Record<string, UnknownData> {
        const dataStr = Utils.toCompactString(data);
        const json: Record<string, UnknownData> = {
            UNKNOWN: {
                key: "UNKNOWN",
                value: dataStr,
            },
        };
        return json;
    },
};

export default UnknownIO;
