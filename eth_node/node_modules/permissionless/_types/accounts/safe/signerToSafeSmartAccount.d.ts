import { type Address, type Chain, type Client, type Transport } from "viem";
import type { Prettify } from "../../types";
import type { EntryPoint } from "../../types";
import { type SmartAccount, type SmartAccountSigner } from "../types";
export type SafeVersion = "1.4.1";
export type SafeSmartAccount<entryPoint extends EntryPoint, transport extends Transport = Transport, chain extends Chain | undefined = Chain | undefined> = SmartAccount<entryPoint, "SafeSmartAccount", transport, chain>;
export type SignerToSafeSmartAccountParameters<entryPoint extends EntryPoint, TSource extends string = string, TAddress extends Address = Address> = Prettify<{
    signer: SmartAccountSigner<TSource, TAddress>;
    safeVersion: SafeVersion;
    entryPoint: entryPoint;
    address?: Address;
    safeModuleSetupAddress?: Address;
    safe4337ModuleAddress?: Address;
    safeProxyFactoryAddress?: Address;
    safeSingletonAddress?: Address;
    multiSendAddress?: Address;
    multiSendCallOnlyAddress?: Address;
    saltNonce?: bigint;
    validUntil?: number;
    validAfter?: number;
    setupTransactions?: {
        to: Address;
        data: Address;
        value: bigint;
    }[];
    safeModules?: Address[];
}>;
/**
 * @description Creates an Simple Account from a private key.
 *
 * @returns A Private Key Simple Account.
 */
export declare function signerToSafeSmartAccount<entryPoint extends EntryPoint, TTransport extends Transport = Transport, TChain extends Chain | undefined = Chain | undefined, TSource extends string = string, TAddress extends Address = Address>(client: Client<TTransport, TChain>, { signer, address, safeVersion, entryPoint: entryPointAddress, safeModuleSetupAddress: _safeModuleSetupAddress, safe4337ModuleAddress: _safe4337ModuleAddress, safeProxyFactoryAddress: _safeProxyFactoryAddress, safeSingletonAddress: _safeSingletonAddress, multiSendAddress: _multiSendAddress, multiSendCallOnlyAddress: _multiSendCallOnlyAddress, saltNonce, validUntil, validAfter, safeModules, setupTransactions }: SignerToSafeSmartAccountParameters<entryPoint, TSource, TAddress>): Promise<SafeSmartAccount<entryPoint, TTransport, TChain>>;
//# sourceMappingURL=signerToSafeSmartAccount.d.ts.map