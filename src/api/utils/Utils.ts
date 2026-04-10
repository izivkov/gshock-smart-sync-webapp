const Utils = {
    hexToBytes(hexStr: string): number[] {
        return hexStr.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16));
    },

    byteArrayOfInts(...integers: number[]): Uint8Array {
        const byteArray = new Uint8Array(integers.length);

        for (let i = 0; i < integers.length; i++) {
            byteArray[i] = integers[i] & 0xFF; // Ensure each integer is within the byte range (0-255)
        }

        return byteArray;
    },

    byteArrayOfIntArray(intArray: number[]): Uint8Array {
        return new Uint8Array(intArray);
    },

    toByteArray(inputString: string, maxLen: number): Uint8Array {
        const encoder = new TextEncoder();
        let retArr = encoder.encode(inputString);
        if (retArr.length > maxLen) {
            return retArr.slice(0, maxLen);
        }
        if (retArr.length < maxLen) {
            const newArr = new Uint8Array(maxLen);
            newArr.set(retArr);
            retArr = newArr;
        }
        return retArr;
    },

    parseStringToIntArray(inputString: string): number[] {
        const stringArray = inputString.split(','); // Split the string by commas
        const intArray = stringArray.map(str => parseInt(str, 10)); // Convert substrings to integers

        return intArray;
    },

    fromByteArrayToHexStr(byteArray: Uint8Array): string {
        return Array.from(byteArray, byte => byte.toString(16).padStart(2, '0')).join('');
    },

    fromByteArrayToHexStrWithSpaces(byteArray: Uint8Array): string {
        return '0x' + Array.from(byteArray, byte => byte.toString(16).padStart(2, '0')).join(' ');
    },

    toHexStr(asciiStr: string): string {
        return Array.from(asciiStr, char => char.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    },

    byteArray(...bytes: number[]): Uint8Array {
        return new Uint8Array(bytes);
    },

    intArray(...bytes: number[]): Uint16Array {
        return new Uint16Array(bytes);
    },

    toIntArray(dataView: DataView, start?: number): number[] {
        if (start === undefined) {
            start = 0;
        }

        const intArray: number[] = [];
        for (let i = start; i < dataView.byteLength; i += 1) {
            const value = dataView.getInt8(i); // Use true for little-endian encoding
            intArray.push(value);
        }
        return intArray;
    },

    toAsciiString(intArray: number[], commandLengthToSkip?: number): string {
        const extractedChars: string[] = [];

        for (let i = commandLengthToSkip || 0; i < intArray.length; i++) {
            const charCode = intArray[i];
            const char = String.fromCharCode(charCode);
            extractedChars.push(char);
        }

        const extractedString = extractedChars.join('');
        return extractedString;
    },

    toCompactString(intArray: number[]): string {
        const hexString = intArray.map(num => (num < 16 ? '0' : '') + num.toString(16)).join('');
        console.log(hexString);
        return hexString;
    },

    trimNonAsciiCharacters(string: string): string {
        const regex = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/g;
        const cleanStr = string.replace(regex, '');
        return cleanStr;
    },
};

export default Utils;
