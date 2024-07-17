import type { SmartAccount } from "permissionless/accounts/types";
import type { PrepareUserOperationRequestParameters, PrepareUserOperationRequestReturnType } from "permissionless/actions/smartAccount/prepareUserOperationRequest";
import type { EntryPoint, Prettify } from "permissionless/types";
import type { Chain, Client, Transport } from "viem";
export type SignUserOperationParameters<entryPoint extends EntryPoint, TAccount extends SmartAccount<entryPoint> | undefined = SmartAccount<entryPoint> | undefined> = PrepareUserOperationRequestParameters<entryPoint, TAccount>;
export type SignUserOperationReturnType<entryPoint extends EntryPoint> = PrepareUserOperationRequestReturnType<entryPoint>;
export declare function signUserOperation<entryPoint extends EntryPoint, TTransport extends Transport = Transport, TChain extends Chain | undefined = Chain | undefined, TAccount extends SmartAccount<entryPoint> | undefined = SmartAccount<entryPoint> | undefined>(client: Client<TTransport, TChain, TAccount>, args: Prettify<SignUserOperationParameters<entryPoint, TAccount>>): Promise<SignUserOperationReturnType<entryPoint>>;
//# sourceMappingURL=signUserOperation.d.ts.map