import { ENTRYPOINT_ADDRESS_V06 } from "permissionless";
import { deepHexlify } from "permissionless/utils";
/**
 * Returns paymasterAndData & updated gas parameters required to sponsor a userOperation.
 */
export const estimateGasInERC20 = async (client, args) => {
    const response = await client.request({
        method: "stackup_getERC20TokenQuotes",
        params: [
            {
                chainId: client.chain?.id,
                userOp: deepHexlify(args.userOperation),
                tokenAddress: args.gasTokenAddress,
                entryPointAddress: args.entryPoint ?? ENTRYPOINT_ADDRESS_V06
            }
        ]
    });
    const result = {
        maxGasCostToken: response.maxGasCostToken,
        tokenDecimals: response.tokenDecimals
    };
    const amount = Number(result.maxGasCostToken) / 10 ** Number(result.tokenDecimals);
    return { amount };
};
//# sourceMappingURL=estimateGasInERC20.js.map