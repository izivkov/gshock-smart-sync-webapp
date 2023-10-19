import Utils from "@utils/Utils";

const ErrorIO = {
    async request(): Promise<string> {
        return "ERROR";
    },

    toJson(data: any): any {
        const dataStr = Utils.toCompactString(data);
        const json: any = {
            ERROR: {
                key: "ERROR",
                value: dataStr
            }
        };
        return json;
    }
};

export default ErrorIO;
