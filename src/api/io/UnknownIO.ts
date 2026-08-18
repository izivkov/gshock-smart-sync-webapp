const UnknownIO = {
    onReceived(data: number[]) {
        console.warn("Unknown data received", data);
    },
};

export default UnknownIO;
