import Utils from "@utils/Utils";

const ErrorIO = {
    async request(): Promise<string> {
        return "ERROR";
    },

    onReceived(data: any): any {
        return data;
    }
};

export default ErrorIO;
