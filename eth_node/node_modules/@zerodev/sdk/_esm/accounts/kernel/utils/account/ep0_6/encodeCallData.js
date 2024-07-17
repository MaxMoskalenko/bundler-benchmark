import { encodeExecuteBatchCall } from "../../ep0_6/encodeExecuteBatchCall.js";
import { encodeExecuteDelegateCall } from "../../ep0_6/encodeExecuteDelegateCall.js";
import { encodeExecuteSingleCall } from "../../ep0_6/encodeExecuteSingleCall.js";
export const encodeCallData = async (tx) => {
    if (Array.isArray(tx)) {
        if (tx.some((t) => t.callType === "delegatecall")) {
            throw new Error("Cannot batch delegatecall");
        }
        return encodeExecuteBatchCall(tx);
    }
    // Default to `call`
    if (!tx.callType || tx.callType === "call") {
        return encodeExecuteSingleCall(tx);
    }
    if (tx.callType === "delegatecall") {
        return encodeExecuteDelegateCall({
            to: tx.to,
            data: tx.data
        });
    }
    throw new Error("Invalid call type");
};
//# sourceMappingURL=encodeCallData.js.map