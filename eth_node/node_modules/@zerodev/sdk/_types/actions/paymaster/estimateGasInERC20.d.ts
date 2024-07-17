import type { EntryPoint } from "permissionless/types";
import type { UserOperation } from "permissionless/types/userOperation.js";
import type { Address, Hex } from "viem";
import type { ZeroDevPaymasterClient } from "../../clients/paymasterClient.js";
export type EstimateGasInERC20Parameters = {
    userOperation: UserOperation<"v0.6">;
    gasTokenAddress: Hex;
    entryPoint?: Address;
};
export type GetERC20TokenQuotesReturnType = {
    maxGasCostToken: string;
    tokenDecimals: string;
};
export type EstimateGasInERC20ReturnType = {
    amount: number;
};
/**
 * Returns paymasterAndData & updated gas parameters required to sponsor a userOperation.
 */
export declare const estimateGasInERC20: <entryPoint extends EntryPoint>(client: ZeroDevPaymasterClient<entryPoint>, args: EstimateGasInERC20Parameters) => Promise<EstimateGasInERC20ReturnType>;
//# sourceMappingURL=estimateGasInERC20.d.ts.map