"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomNonceKeyFromString = void 0;
const permissionless_1 = require("permissionless");
const viem_1 = require("viem");
const hashAndTruncate = (input, byteSize) => {
    const hash = (0, viem_1.keccak256)((0, viem_1.toHex)(input));
    const truncatedHash = hash.substring(2, byteSize * 2 + 2);
    return BigInt(`0x${truncatedHash}`);
};
const getCustomNonceKeyFromString = (input, entryPoint) => {
    const entryPointVersion = (0, permissionless_1.getEntryPointVersion)(entryPoint);
    if (entryPointVersion === "v0.6") {
        return hashAndTruncate(input, 24);
    }
    return hashAndTruncate(input, 2);
};
exports.getCustomNonceKeyFromString = getCustomNonceKeyFromString;
//# sourceMappingURL=getCustomNonceKeyFromString.js.map