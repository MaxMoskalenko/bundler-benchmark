import { type Hex } from "viem";
import type { KernelEncodeCallDataArgs } from "../../types/index.js";
export declare const MULTISEND_ADDRESS = "0x8ae01fcf7c655655ff2c6ef907b8b4718ab4e17c";
export declare const multiSendAbi: {
    type: string;
    name: string;
    inputs: {
        type: string;
        name: string;
    }[];
}[];
export declare const encodeMultiSend: (calls: KernelEncodeCallDataArgs) => Hex;
//# sourceMappingURL=multisend.d.ts.map