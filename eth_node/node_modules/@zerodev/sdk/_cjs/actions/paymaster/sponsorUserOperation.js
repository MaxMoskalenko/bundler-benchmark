"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sponsorUserOperation = void 0;
const permissionless_1 = require("permissionless");
const utils_1 = require("permissionless/utils");
const sponsorUserOperation = async (client, args) => {
    const response = await client.request({
        method: "zd_sponsorUserOperation",
        params: [
            {
                chainId: client.chain?.id,
                userOp: (0, utils_1.deepHexlify)(args.userOperation),
                entryPointAddress: args.entryPoint,
                gasTokenData: args.gasToken && {
                    tokenAddress: args.gasToken
                },
                shouldOverrideFee: args.shouldOverrideFee ?? false,
                shouldConsume: args.shouldConsume ?? true
            }
        ]
    });
    const entryPointVersion = (0, permissionless_1.getEntryPointVersion)(args.entryPoint);
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
exports.sponsorUserOperation = sponsorUserOperation;
//# sourceMappingURL=sponsorUserOperation.js.map