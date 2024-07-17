import { getEntryPointVersion } from "permissionless";
import { http, createClient } from "viem";
import { getUserOperationGasPrice } from "../actions/account-client/getUserOperationGasPrice.js";
import { kernelAccountClientActions } from "./decorators/kernel.js";
import { isProviderSet, setPimlicoAsProvider } from "./utils.js";
export const createKernelAccountClient = (parameters) => {
    const { key = "Account", name = "Kernel Account Client", bundlerTransport, entryPoint } = parameters;
    const entryPointVersion = getEntryPointVersion(entryPoint);
    const shouldIncludePimlicoProvider = bundlerTransport({}).config.key === "http" &&
        entryPointVersion === "v0.7";
    const client = createClient({
        ...parameters,
        key,
        name,
        transport: (opts) => {
            let _bundlerTransport = bundlerTransport({
                ...opts,
                retryCount: 0
            });
            if (!shouldIncludePimlicoProvider ||
                isProviderSet(_bundlerTransport.value?.url, "ALCHEMY"))
                return _bundlerTransport;
            _bundlerTransport = http(setPimlicoAsProvider(_bundlerTransport.value?.url))({ ...opts, retryCount: 0 });
            return _bundlerTransport;
        },
        type: "kernelAccountClient"
    });
    let middleware = parameters.middleware;
    if ((!middleware ||
        (typeof middleware !== "function" && !middleware.gasPrice)) &&
        client.transport?.url &&
        isProviderSet(client.transport.url, "PIMLICO")) {
        const gasPrice = () => getUserOperationGasPrice(client);
        middleware = {
            ...middleware,
            gasPrice
        };
    }
    return client.extend(kernelAccountClientActions({
        middleware
    }));
};
//# sourceMappingURL=kernelAccountClient.js.map