import type { ENTRYPOINT_ADDRESS_V06_TYPE, EntryPoint } from "permissionless/types/entrypoint";
import type { UserOperation } from "permissionless/types/userOperation.js";
import type { Hex } from "viem";
import type { PartialBy } from "viem/types/utils";
import type { ZeroDevPaymasterClient } from "../../clients/paymasterClient.js";
export type SponsorUserOperationParameters<entryPoint extends EntryPoint> = {
    userOperation: entryPoint extends ENTRYPOINT_ADDRESS_V06_TYPE ? PartialBy<UserOperation<"v0.6">, "callGasLimit" | "preVerificationGas" | "verificationGasLimit"> : PartialBy<UserOperation<"v0.7">, "callGasLimit" | "preVerificationGas" | "verificationGasLimit" | "paymasterVerificationGasLimit" | "paymasterPostOpGasLimit">;
    entryPoint: entryPoint;
    gasToken?: Hex;
    shouldOverrideFee?: boolean;
    shouldConsume?: boolean;
};
export type PartialPick<T, K extends keyof T> = Partial<Pick<T, K>>;
export type SponsorUserOperationReturnType<entryPoint extends EntryPoint> = entryPoint extends ENTRYPOINT_ADDRESS_V06_TYPE ? Pick<UserOperation<"v0.6">, "callGasLimit" | "verificationGasLimit" | "preVerificationGas" | "paymasterAndData"> & PartialPick<UserOperation<"v0.6">, "maxFeePerGas" | "maxPriorityFeePerGas"> : Pick<UserOperation<"v0.7">, "callGasLimit" | "verificationGasLimit" | "preVerificationGas" | "paymaster" | "paymasterVerificationGasLimit" | "paymasterPostOpGasLimit" | "paymasterData"> & PartialPick<UserOperation<"v0.7">, "maxFeePerGas" | "maxPriorityFeePerGas">;
/**
 * Returns paymasterAndData & updated gas parameters required to sponsor a userOperation.
 */
export declare const sponsorUserOperation: <entryPoint extends EntryPoint>(client: ZeroDevPaymasterClient<entryPoint>, args: SponsorUserOperationParameters<entryPoint>) => Promise<SponsorUserOperationReturnType<entryPoint>>;
//# sourceMappingURL=sponsorUserOperation.d.ts.map