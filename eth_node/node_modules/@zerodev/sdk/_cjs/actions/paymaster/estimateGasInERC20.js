"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateGasInERC20 = void 0;
const permissionless_1 = require("permissionless");
const utils_1 = require("permissionless/utils");
const estimateGasInERC20 = async (client, args) => {
    const response = await client.request({
        method: "stackup_getERC20TokenQuotes",
        params: [
            {
                chainId: client.chain?.id,
                userOp: (0, utils_1.deepHexlify)(args.userOperation),
                tokenAddress: args.gasTokenAddress,
                entryPointAddress: args.entryPoint ?? permissionless_1.ENTRYPOINT_ADDRESS_V06
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
exports.estimateGasInERC20 = estimateGasInERC20;
//# sourceMappingURL=estimateGasInERC20.js.map