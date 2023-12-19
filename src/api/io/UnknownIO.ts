import Utils from "@utils/Utils";

interface UnknownData {
    key: string;
    value: string;
}

const UnknownIO = {
    async request(): Promise<string> {
        return "UNKNOWN";
    },

    onReceived(data: any): Record<string, UnknownData> {
        return data;
    },
};

export default UnknownIO;
