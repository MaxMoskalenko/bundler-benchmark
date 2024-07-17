import type { EntryPoint } from "permissionless/types/entrypoint";
import { type Address, type Hex } from "viem";
import { type PluginValidityData } from "../../../../../types/index.js";
import type { Kernel2_0_plugins } from "./getPluginsEnableTypedData.js";
export declare const getEncodedPluginsData: <entryPoint extends EntryPoint = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789">({ accountAddress, enableSignature, action, validator, validUntil, validAfter }: {
    accountAddress: Address;
    enableSignature: Hex;
} & Kernel2_0_plugins<entryPoint> & PluginValidityData) => Promise<`0x${string}`>;
//# sourceMappingURL=getEncodedPluginsData.d.ts.map