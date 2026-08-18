import { StandardProtocol } from "./StandardProtocol";
import { watchInfo } from "@/api/WatchInfo";
import HomeTimeIO from "@io/HomeTimeIO";
import HomeTimeIOFunctional from "@io/HomeTimeIOFunctional";
import MtgB1000TimeIO from "@io/MtgB1000TimeIO";
import TimeIO from "@io/TimeIO";
import Utils from "@utils/Utils";

export class AnalogueProtocol extends StandardProtocol {
    extractKey(data: string): number | null {
        try {
            const ints = Utils.hexToBytes(data);
            const firstByte = ints[0];
            if (firstByte === 0x28 && ints.length > 4) {
                if (ints[1] === 0x01 && this.dataReceivedHandlers[ints[4]]) {
                    return ints[4];
                } else if (ints[1] === 0x00 && this.dataReceivedHandlers[ints[3]]) {
                    return ints[3];
                } else {
                    return 0x28;
                }
            } else {
                return firstByte;
            }
        } catch (e) {
            return null;
        }
    }

    unwrapPayload(data: string, key: number): string {
        const ints = Utils.hexToBytes(data);
        if (ints.length > 0 && ints[0] === 0x28 && key !== 0x28) {
            const skip = ints[1] === 0x01 ? 4 : 3;
            return Utils.bytesToHex(ints.slice(skip));
        }
        return data;
    }

    getWatchConditionRequest(): string {
        return "280000";
    }

    async setTime(timeMs?: number, offset?: number): Promise<void> {
        await TimeIO.writeDST();
        await TimeIO.writeDSTForWorldCities();
        await TimeIO.writeWorldCities();
        await TimeIO.set();

        if (watchInfo.hasSecondDial) {
            await MtgB1000TimeIO.setSecondDial();
        }
    }

    getTimerRequest(): string {
        return "182000";
    }

    getTimerSize(): number {
        return 15;
    }

    async getHomeTime(): Promise<string> {
        const raw = await HomeTimeIO.requestRaw(0);
        return HomeTimeIOFunctional.parseHomeCity(raw, 4);
    }
}

export const analogueProtocol = new AnalogueProtocol();
