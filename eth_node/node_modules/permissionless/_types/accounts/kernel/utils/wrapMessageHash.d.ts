import { type Hex } from "viem";
import { type Address } from "viem";
export type WrapMessageHashParams = {
    accountVersion: string;
    accountAddress: Address;
    chainId?: number;
};
export declare const wrapMessageHash: (messageHash: Hex, { accountAddress, accountVersion, chainId }: WrapMessageHashParams) => `0x${string}`;
//# sourceMappingURL=wrapMessageHash.d.ts.map