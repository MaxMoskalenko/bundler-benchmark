import { hashMessage, publicActions } from "viem";
import { signMessage as _signMessage } from "viem/actions";
import { wrapMessageHash } from "./wrapMessageHash.js";
export async function signMessage(client, { account: account_ = client.account, message, accountAddress, accountVersion }) {
    if (accountVersion === "0.2.2") {
        return _signMessage(client, {
            account: account_,
            message
        });
    }
    const wrappedMessageHash = wrapMessageHash(hashMessage(message), {
        accountVersion,
        accountAddress,
        chainId: client.chain
            ? client.chain.id
            : await client.extend(publicActions).getChainId()
    });
    const signature = await _signMessage(client, {
        account: account_,
        message: { raw: wrappedMessageHash }
    });
    return signature;
}
//# sourceMappingURL=signMessage.js.map