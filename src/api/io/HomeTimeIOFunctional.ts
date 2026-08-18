import Utils from "@utils/Utils";

const HomeTimeIOFunctional = {
    parseHomeCity(data: string | number[], offset: number): string {
        if (!data || (typeof data === 'string' && data.length === 0) || (Array.isArray(data) && data.length === 0)) {
            return "N/A";
        }
        const name = Utils.toAsciiString(data, offset);
        const trimmed = Utils.trimNonAsciiCharacters(name);
        return (trimmed.length === 0 || trimmed.split('').every(c => c === 'ÿ')) ? "N/A" : trimmed;
    }
};

export default HomeTimeIOFunctional;
