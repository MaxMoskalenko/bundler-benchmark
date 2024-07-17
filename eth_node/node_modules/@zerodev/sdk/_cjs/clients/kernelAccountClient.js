"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKernelAccountClient = void 0;
const permissionless_1 = require("permissionless");
const viem_1 = require("viem");
const getUserOperationGasPrice_js_1 = require("../actions/account-client/getUserOperationGasPrice.js");
const kernel_js_1 = require("./decorators/kernel.js");
const utils_js_1 = require("./utils.js");
const createKernelAccountClient = (parameters) => {
    const { key = "Account", name = "Kernel Account Client", bundlerTransport, entryPoint } = parameters;
    const entryPointVersion = (0, permissionless_1.getEntryPointVersion)(entryPoint);
    const shouldIncludePimlicoProvider = bundlerTransport({}).config.key === "http" &&
        entryPointVersion === "v0.7";
    const client = (0, viem_1.createClient)({
        ...parameters,
        key,
        name,
        transport: (opts) => {
            let _bundlerTransport = bundlerTransport({
                ...opts,
                retryCount: 0
            });
            if (!shouldIncludePimlicoProvider ||
                (0, utils_js_1.isProviderSet)(_bundlerTransport.value?.url, "ALCHEMY"))
                return _bundlerTransport;
            _bundlerTransport = (0, viem_1.http)((0, utils_js_1.setPimlicoAsProvider)(_bundlerTransport.value?.url))({ ...opts, retryCount: 0 });
            return _bundlerTransport;
        },
        type: "kernelAccountClient"
    });
    let middleware = parameters.middleware;
    if ((!middleware ||
        (typeof middleware !== "function" && !middleware.gasPrice)) &&
        client.transport?.url &&
        (0, utils_js_1.isProviderSet)(client.transport.url, "PIMLICO")) {
        const gasPrice = () => (0, getUserOperationGasPrice_js_1.getUserOperationGasPrice)(client);
        middleware = {
            ...middleware,
            gasPrice
        };
    }
    return client.extend((0, kernel_js_1.kernelAccountClientActions)({
        middleware
    }));
};
exports.createKernelAccountClient = createKernelAccountClient;
//# sourceMappingURL=kernelAccountClient.js.map