import { getEntryPointVersion } from "permissionless";
import { deepHexlify } from "permissionless/utils";
/**
 * Returns paymasterAndData & updated gas parameters required to sponsor a userOperation.
 */
export const sponsorUserOperation = async (client, args) => {
    const response = await client.request({
        method: "zd_sponsorUserOperation",
        params: [
            {
                chainId: client.chain?.id,
                userOp: deepHexlify(args.userOperation),
                entryPointAddress: args.entryPoint,
                gasTokenData: args.gasToken && {
                    tokenAddress: args.gasToken
                },
                shouldOverrideFee: args.shouldOverrideFee ?? false,
                shouldConsume: args.shouldConsume ?? true
            }
        ]
    });
    const entryPointVersion = getEntryPointVersion(args.entryPoint);
    if (entryPointVersion === "v0.6") {
        return {
            paymasterAndData: response.paymasterAndData,
            preVerificationGas: BigInt(response.preVerificationGas),
            verificationGasLimit: BigInt(response.verificationGasLimit),
            callGasLimit: BigInt(response.callGasLimit),
            maxFeePerGas: response.maxFeePerGas && BigInt(response.maxFeePerGas),
            maxPriorityFeePerGas: response.maxPriorityFeePerGas &&
                BigInt(response.maxPriorityFeePerGas)
        };
    }
    const responseV07 = response;
    return {
        callGasLimit: BigInt(responseV07.callGasLimit),
        verificationGasLimit: BigInt(responseV07.verificationGasLimit),
        preVerificationGas: BigInt(responseV07.preVerificationGas),
        paymaster: responseV07.paymaster,
        paymasterVerificationGasLimit: BigInt(responseV07.paymasterVerificationGasLimit),
        paymasterPostOpGasLimit: BigInt(responseV07.paymasterPostOpGasLimit),
        paymasterData: responseV07.paymasterData
    };
};
//# sourceMappingURL=sponsorUserOperation.js.map