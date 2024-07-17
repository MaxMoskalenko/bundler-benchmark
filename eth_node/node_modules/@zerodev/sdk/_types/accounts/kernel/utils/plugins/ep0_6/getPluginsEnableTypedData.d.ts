import type { EntryPoint } from "permissionless/types/entrypoint";
import { type Address, type CustomSource } from "viem";
import type { Action, KernelValidator, PluginValidityData } from "../../../../../types/index.js";
export type Kernel2_0_plugins<entryPoint extends EntryPoint> = {
    validator: KernelValidator<entryPoint>;
    action: Action;
};
export declare const getPluginsEnableTypedData: <entryPoint extends EntryPoint = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789">({ accountAddress, chainId, kernelVersion, action, validator, validUntil, validAfter }: {
    accountAddress: Address;
    chainId: number;
    kernelVersion: string;
} & Kernel2_0_plugins<entryPoint> & PluginValidityData) => Promise<Parameters<CustomSource["signTypedData"]>[0]>;
//# sourceMappingURL=getPluginsEnableTypedData.d.ts.map