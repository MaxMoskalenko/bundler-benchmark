"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createZeroDevPaymasterClient = void 0;
const permissionless_1 = require("permissionless");
const viem_1 = require("viem");
const kernel_js_1 = require("./decorators/kernel.js");
const utils_js_1 = require("./utils.js");
const createZeroDevPaymasterClient = (parameters) => {
    const { key = "public", name = "ZeroDev Paymaster Client", entryPoint: entryPointAddress, transport } = parameters;
    const entryPointVersion = (0, permissionless_1.getEntryPointVersion)(entryPointAddress);
    const shouldIncludePimlicoProvider = transport({}).config.key === "http" && entryPointVersion === "v0.7";
    const client = (0, viem_1.createClient)({
        ...parameters,
        transport: (opts) => {
            let _transport = transport({
                ...opts,
                retryCount: 0
            });
            if (!shouldIncludePimlicoProvider ||
                (0, utils_js_1.isProviderSet)(_transport.value?.url, "ALCHEMY"))
                return _transport;
            _transport = (0, viem_1.http)((0, utils_js_1.setPimlicoAsProvider)(_transport.value?.url))({
                ...opts,
                retryCount: 0
            });
            return _transport;
        },
        key,
        name,
        type: "zerodevPaymasterClient"
    });
    return client.extend((0, kernel_js_1.zerodevPaymasterActions)(parameters.entryPoint));
};
exports.createZeroDevPaymasterClient = createZeroDevPaymasterClient;
//# sourceMappingURL=paymasterClient.js.map