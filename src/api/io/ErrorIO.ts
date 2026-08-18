const ErrorIO = {
    onReceived(data: number[]) {
        console.error("Watch error received", data);
    }
};

export default ErrorIO;
