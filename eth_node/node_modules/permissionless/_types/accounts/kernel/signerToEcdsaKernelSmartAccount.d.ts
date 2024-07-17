import { type Address, type Chain, type Client, type Transport } from "viem";
import type { EntryPoint, Prettify } from "../../types";
import type { SmartAccount } from "../types";
import { type SmartAccountSigner } from "../types";
export type KernelEcdsaSmartAccount<entryPoint extends EntryPoint, transport extends Transport = Transport, chain extends Chain | undefined = Chain | undefined> = SmartAccount<entryPoint, "kernelEcdsaSmartAccount", transport, chain>;
export type KernelVersion = "0.2.2" | "0.3.0-beta";
/**
 * Default addresses map for different kernel smart account versions
 */
export declare const KERNEL_VERSION_TO_ADDRESSES_MAP: {
    [key in KernelVersion]: {
        ECDSA_VALIDATOR: Address;
        ACCOUNT_LOGIC: Address;
        FACTORY_ADDRESS: Address;
        META_FACTORY_ADDRESS?: Address;
    };
};
export declare const getEcdsaRootIdentifierForKernelV3: (validatorAddress: Address) => `0x${string}`;
export type SignerToEcdsaKernelSmartAccountParameters<entryPoint extends EntryPoint, TSource extends string = string, TAddress extends Address = Address> = Prettify<{
    signer: SmartAccountSigner<TSource, TAddress>;
    entryPoint: entryPoint;
    address?: Address;
    index?: bigint;
    factoryAddress?: Address;
    metaFactoryAddress?: Address;
    accountLogicAddress?: Address;
    ecdsaValidatorAddress?: Address;
    deployedAccountAddress?: Address;
}>;
/**
 * Build a kernel smart account from a private key, that use the ECDSA signer behind the scene
 * @param client
 * @param privateKey
 * @param entryPoint
 * @param index
 * @param factoryAddress
 * @param accountLogicAddress
 * @param ecdsaValidatorAddress
 * @param deployedAccountAddress
 */
export declare function signerToEcdsaKernelSmartAccount<entryPoint extends EntryPoint, TTransport extends Transport = Transport, TChain extends Chain | undefined = Chain | undefined, TSource extends string = string, TAddress extends Address = Address>(client: Client<TTransport, TChain, undefined>, { signer, address, entryPoint: entryPointAddress, index, factoryAddress: _factoryAddress, metaFactoryAddress: _metaFactoryAddress, accountLogicAddress: _accountLogicAddress, ecdsaValidatorAddress: _ecdsaValidatorAddress, deployedAccountAddress }: SignerToEcdsaKernelSmartAccountParameters<entryPoint, TSource, TAddress>): Promise<KernelEcdsaSmartAccount<entryPoint, TTransport, TChain>>;
//# sourceMappingURL=signerToEcdsaKernelSmartAccount.d.ts.map