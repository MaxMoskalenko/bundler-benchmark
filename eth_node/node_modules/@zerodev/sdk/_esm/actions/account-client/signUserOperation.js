import { prepareUserOperationRequest } from "permissionless/actions/smartAccount";
import { AccountOrClientNotFoundError, parseAccount } from "permissionless/utils";
import { getAction } from "viem/utils";
export async function signUserOperation(client, args) {
    const { account: account_ = client.account } = args;
    if (!account_)
        throw new AccountOrClientNotFoundError();
    const account = parseAccount(account_);
    const userOperation = await getAction(client, (prepareUserOperationRequest), "prepareUserOperationRequest")(args);
    userOperation.signature = await account.signUserOperation(userOperation);
    return userOperation;
}
//# sourceMappingURL=signUserOperation.js.map