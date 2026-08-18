import { StandardProtocol } from "./StandardProtocol";
import GwBx5600TimeIO from "@io/GwBx5600TimeIO";

export class MipProtocol extends StandardProtocol {
    async setTime(timeMs?: number, offset?: number): Promise<void> {
        await GwBx5600TimeIO.set(timeMs);
    }
}

export const mipProtocol = new MipProtocol();
