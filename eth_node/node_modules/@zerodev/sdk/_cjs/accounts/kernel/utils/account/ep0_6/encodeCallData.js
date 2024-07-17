"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeCallData = void 0;
const encodeExecuteBatchCall_js_1 = require("../../ep0_6/encodeExecuteBatchCall.js");
const encodeExecuteDelegateCall_js_1 = require("../../ep0_6/encodeExecuteDelegateCall.js");
const encodeExecuteSingleCall_js_1 = require("../../ep0_6/encodeExecuteSingleCall.js");
const encodeCallData = async (tx) => {
    if (Array.isArray(tx)) {
        if (tx.some((t) => t.callType === "delegatecall")) {
            throw new Error("Cannot batch delegatecall");
        }
        return (0, encodeExecuteBatchCall_js_1.encodeExecuteBatchCall)(tx);
    }
    if (!tx.callType || tx.callType === "call") {
        return (0, encodeExecuteSingleCall_js_1.encodeExecuteSingleCall)(tx);
    }
    if (tx.callType === "delegatecall") {
        return (0, encodeExecuteDelegateCall_js_1.encodeExecuteDelegateCall)({
            to: tx.to,
            data: tx.data
        });
    }
    throw new Error("Invalid call type");
};
exports.encodeCallData = encodeCallData;
//# sourceMappingURL=encodeCallData.js.map