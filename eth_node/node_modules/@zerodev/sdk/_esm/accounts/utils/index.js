export { toKernelPluginManager } from "./toKernelPluginManager.js";
export { verifyEIP6492Signature, universalValidatorByteCode } from "./6492.js";
export const parseFactoryAddressAndCallDataFromAccountInitCode = (initCode) => {
    const factoryAddress = `0x${initCode.substring(2, 42)}`;
    const factoryCalldata = `0x${initCode.substring(42)}`;
    return [factoryAddress, factoryCalldata];
};
export { getCustomNonceKeyFromString } from "./getCustomNonceKeyFromString.js";
//# sourceMappingURL=index.js.map