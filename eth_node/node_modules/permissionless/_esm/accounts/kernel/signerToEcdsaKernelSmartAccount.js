import { concatHex, encodeFunctionData, isAddressEqual, toHex, zeroAddress } from "viem";
import { getChainId, readContract, signMessage as _signMessage } from "viem/actions";
import { getAccountNonce } from "../../actions/public/getAccountNonce.js";
import { getSenderAddress } from "../../actions/public/getSenderAddress.js";
import { ENTRYPOINT_ADDRESS_V06, getEntryPointVersion } from "../../utils/index.js";
import { getUserOperationHash } from "../../utils/getUserOperationHash.js";
import { isSmartAccountDeployed } from "../../utils/isSmartAccountDeployed.js";
import { toSmartAccount } from "../toSmartAccount.js";
import { SignTransactionNotSupportedBySmartAccount } from "../types.js";
import { KernelInitAbi } from "./abi/KernelAccountAbi.js";
import { KernelV3InitAbi } from "./abi/KernelV3AccountAbi.js";
import { KernelV3MetaFactoryDeployWithFactoryAbi } from "./abi/KernelV3MetaFactoryAbi.js";
import { DUMMY_ECDSA_SIGNATURE, ROOT_MODE_KERNEL_V2, VALIDATOR_TYPE } from "./constants.js";
import { encodeCallData } from "./utils/encodeCallData.js";
import { getNonceKeyWithEncoding } from "./utils/getNonceKey.js";
import { signMessage } from "./utils/signMessage.js";
import { signTypedData } from "./utils/signTypedData.js";
/**
 * The account creation ABI for a kernel smart account (from the KernelFactory)
 */
const createAccountAbi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_implementation",
                type: "address"
            },
            {
                internalType: "bytes",
                name: "_data",
                type: "bytes"
            },
            {
                internalType: "uint256",
                name: "_index",
                type: "uint256"
            }
        ],
        name: "createAccount",
        outputs: [
            {
                internalType: "address",
                name: "proxy",
                type: "address"
            }
        ],
        stateMutability: "payable",
        type: "function"
    }
];
/**
 * Default addresses map for different kernel smart account versions
 */
export const KERNEL_VERSION_TO_ADDRESSES_MAP = {
    "0.2.2": {
        ECDSA_VALIDATOR: "0xd9AB5096a832b9ce79914329DAEE236f8Eea0390",
        ACCOUNT_LOGIC: "0x0DA6a956B9488eD4dd761E59f52FDc6c8068E6B5",
        FACTORY_ADDRESS: "0x5de4839a76cf55d0c90e2061ef4386d962E15ae3"
    },
    "0.3.0-beta": {
        ECDSA_VALIDATOR: "0x8104e3Ad430EA6d354d013A6789fDFc71E671c43",
        ACCOUNT_LOGIC: "0x94F097E1ebEB4ecA3AAE54cabb08905B239A7D27",
        FACTORY_ADDRESS: "0x6723b44Abeec4E71eBE3232BD5B455805baDD22f",
        META_FACTORY_ADDRESS: "0xd703aaE79538628d27099B8c4f621bE4CCd142d5"
    }
};
/**
 * Get supported Kernel Smart Account version based on entryPoint
 * @param entryPoint
 */
const getKernelVersion = (entryPoint) => {
    return entryPoint === ENTRYPOINT_ADDRESS_V06 ? "0.2.2" : "0.3.0-beta";
};
/**
 * Get default addresses for Kernel Smart Account based on entryPoint or user input
 * @param entryPointAddress
 * @param ecdsaValidatorAddress
 * @param accountLogicAddress
 * @param factoryAddress
 * @param metaFactoryAddress
 */
const getDefaultAddresses = (entryPointAddress, { ecdsaValidatorAddress: _ecdsaValidatorAddress, accountLogicAddress: _accountLogicAddress, factoryAddress: _factoryAddress, metaFactoryAddress: _metaFactoryAddress }) => {
    const kernelVersion = getKernelVersion(entryPointAddress);
    const addresses = KERNEL_VERSION_TO_ADDRESSES_MAP[kernelVersion];
    const ecdsaValidatorAddress = _ecdsaValidatorAddress ?? addresses.ECDSA_VALIDATOR;
    const accountLogicAddress = _accountLogicAddress ?? addresses.ACCOUNT_LOGIC;
    const factoryAddress = _factoryAddress ?? addresses.FACTORY_ADDRESS;
    const metaFactoryAddress = _metaFactoryAddress ?? addresses?.META_FACTORY_ADDRESS ?? zeroAddress; // Meta Factory doesn't exists for Kernel v2.2
    return {
        ecdsaValidatorAddress,
        accountLogicAddress,
        factoryAddress,
        metaFactoryAddress
    };
};
export const getEcdsaRootIdentifierForKernelV3 = (validatorAddress) => {
    return concatHex([VALIDATOR_TYPE.VALIDATOR, validatorAddress]);
};
/**
 * Get the initialization data for a kernel smart account
 * @param entryPoint
 * @param owner
 * @param ecdsaValidatorAddress
 */
const getInitialisationData = ({ entryPoint: entryPointAddress, owner, ecdsaValidatorAddress }) => {
    const entryPointVersion = getEntryPointVersion(entryPointAddress);
    if (entryPointVersion === "v0.6") {
        return encodeFunctionData({
            abi: KernelInitAbi,
            functionName: "initialize",
            args: [ecdsaValidatorAddress, owner]
        });
    }
    return encodeFunctionData({
        abi: KernelV3InitAbi,
        functionName: "initialize",
        args: [
            getEcdsaRootIdentifierForKernelV3(ecdsaValidatorAddress),
            zeroAddress /* hookAddress */,
            owner,
            "0x" /* hookData */
        ]
    });
};
/**
 * Get the account initialization code for a kernel smart account
 * @param entryPoint
 * @param owner
 * @param index
 * @param factoryAddress
 * @param accountLogicAddress
 * @param ecdsaValidatorAddress
 */
const getAccountInitCode = async ({ entryPoint: entryPointAddress, owner, index, factoryAddress, accountLogicAddress, ecdsaValidatorAddress }) => {
    if (!owner)
        throw new Error("Owner account not found");
    const entryPointVersion = getEntryPointVersion(entryPointAddress);
    // Build the account initialization data
    const initialisationData = getInitialisationData({
        entryPoint: entryPointAddress,
        ecdsaValidatorAddress,
        owner
    });
    // Build the account init code
    if (entryPointVersion === "v0.6") {
        return encodeFunctionData({
            abi: createAccountAbi,
            functionName: "createAccount",
            args: [accountLogicAddress, initialisationData, index]
        });
    }
    return encodeFunctionData({
        abi: KernelV3MetaFactoryDeployWithFactoryAbi,
        functionName: "deployWithFactory",
        args: [factoryAddress, initialisationData, toHex(index, { size: 32 })]
    });
};
/**
 * Check the validity of an existing account address, or fetch the pre-deterministic account address for a kernel smart wallet
 * @param client
 * @param owner
 * @param entryPoint
 * @param ecdsaValidatorAddress
 * @param initCodeProvider
 * @param deployedAccountAddress
 * @param factoryAddress
 */
const getAccountAddress = async ({ client, owner, entryPoint: entryPointAddress, initCodeProvider, ecdsaValidatorAddress, deployedAccountAddress, factoryAddress }) => {
    // If we got an already deployed account, ensure it's well deployed, and the validator & signer are correct
    if (deployedAccountAddress !== undefined) {
        // Get the owner of the deployed account, ensure it's the same as the owner given in params
        const deployedAccountOwner = await readContract(client, {
            address: ecdsaValidatorAddress,
            abi: [
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "",
                            type: "address"
                        }
                    ],
                    name: "ecdsaValidatorStorage",
                    outputs: [
                        {
                            internalType: "address",
                            name: "owner",
                            type: "address"
                        }
                    ],
                    stateMutability: "view",
                    type: "function"
                }
            ],
            functionName: "ecdsaValidatorStorage",
            args: [deployedAccountAddress]
        });
        // Ensure the address match
        if (!isAddressEqual(deployedAccountOwner, owner)) {
            throw new Error("Invalid owner for the already deployed account");
        }
        // If ok, return the address
        return deployedAccountAddress;
    }
    // Find the init code for this account
    const factoryData = await initCodeProvider();
    const entryPointVersion = getEntryPointVersion(entryPointAddress);
    if (entryPointVersion === "v0.6") {
        return getSenderAddress(client, {
            initCode: concatHex([factoryAddress, factoryData]),
            entryPoint: entryPointAddress
        });
    }
    return getSenderAddress(client, {
        factory: factoryAddress,
        factoryData: factoryData,
        entryPoint: entryPointAddress
    });
};
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
export async function signerToEcdsaKernelSmartAccount(client, { signer, address, entryPoint: entryPointAddress, index = BigInt(0), factoryAddress: _factoryAddress, metaFactoryAddress: _metaFactoryAddress, accountLogicAddress: _accountLogicAddress, ecdsaValidatorAddress: _ecdsaValidatorAddress, deployedAccountAddress }) {
    const entryPointVersion = getEntryPointVersion(entryPointAddress);
    const kernelVersion = getKernelVersion(entryPointAddress);
    const { accountLogicAddress, ecdsaValidatorAddress, factoryAddress, metaFactoryAddress } = getDefaultAddresses(entryPointAddress, {
        ecdsaValidatorAddress: _ecdsaValidatorAddress,
        accountLogicAddress: _accountLogicAddress,
        factoryAddress: _factoryAddress,
        metaFactoryAddress: _metaFactoryAddress
    });
    // Get the private key related account
    const viemSigner = {
        ...signer,
        signTransaction: (_, __) => {
            throw new SignTransactionNotSupportedBySmartAccount();
        }
    };
    // Helper to generate the init code for the smart account
    const generateInitCode = () => getAccountInitCode({
        entryPoint: entryPointAddress,
        owner: viemSigner.address,
        index,
        factoryAddress,
        accountLogicAddress,
        ecdsaValidatorAddress
    });
    // Fetch account address and chain id
    const [accountAddress, chainId] = await Promise.all([
        address ??
            getAccountAddress({
                client,
                entryPoint: entryPointAddress,
                owner: viemSigner.address,
                ecdsaValidatorAddress,
                initCodeProvider: generateInitCode,
                deployedAccountAddress,
                factoryAddress: entryPointVersion === "v0.6"
                    ? factoryAddress
                    : metaFactoryAddress
            }),
        client.chain?.id ?? getChainId(client)
    ]);
    if (!accountAddress)
        throw new Error("Account address not found");
    let smartAccountDeployed = await isSmartAccountDeployed(client, accountAddress);
    return toSmartAccount({
        address: accountAddress,
        async signMessage({ message }) {
            const signature = await signMessage(client, {
                account: viemSigner,
                message,
                accountAddress,
                accountVersion: kernelVersion,
                chainId
            });
            if (kernelVersion === "0.2.2") {
                return signature;
            }
            return concatHex([
                getEcdsaRootIdentifierForKernelV3(ecdsaValidatorAddress),
                signature
            ]);
        },
        async signTransaction(_, __) {
            throw new SignTransactionNotSupportedBySmartAccount();
        },
        async signTypedData(typedData) {
            const signature = await signTypedData(client, {
                account: viemSigner,
                ...typedData,
                accountAddress,
                accountVersion: kernelVersion,
                chainId
            });
            if (kernelVersion === "0.2.2") {
                return signature;
            }
            return concatHex([
                getEcdsaRootIdentifierForKernelV3(ecdsaValidatorAddress),
                signature
            ]);
        },
        client: client,
        publicKey: accountAddress,
        entryPoint: entryPointAddress,
        source: "kernelEcdsaSmartAccount",
        // Get the nonce of the smart account
        async getNonce() {
            const key = getNonceKeyWithEncoding(kernelVersion, ecdsaValidatorAddress
            // @dev specify the custom nonceKey here when integrating the said feature
            /*, nonceKey */
            );
            return getAccountNonce(client, {
                sender: accountAddress,
                entryPoint: entryPointAddress,
                key
            });
        },
        // Sign a user operation
        async signUserOperation(userOperation) {
            const hash = getUserOperationHash({
                userOperation: {
                    ...userOperation,
                    signature: "0x"
                },
                entryPoint: entryPointAddress,
                chainId: chainId
            });
            const signature = await _signMessage(client, {
                account: viemSigner,
                message: { raw: hash }
            });
            // Always use the sudo mode, since we will use external paymaster
            if (kernelVersion === "0.2.2") {
                return concatHex(["0x00000000", signature]);
            }
            return signature;
        },
        // Encode the init code
        async getInitCode() {
            if (smartAccountDeployed)
                return "0x";
            smartAccountDeployed = await isSmartAccountDeployed(client, accountAddress);
            if (smartAccountDeployed)
                return "0x";
            const _factoryAddress = entryPointVersion === "v0.6"
                ? factoryAddress
                : metaFactoryAddress;
            return concatHex([_factoryAddress, await generateInitCode()]);
        },
        async getFactory() {
            if (smartAccountDeployed)
                return undefined;
            smartAccountDeployed = await isSmartAccountDeployed(client, accountAddress);
            if (smartAccountDeployed)
                return undefined;
            return entryPointVersion === "v0.6"
                ? factoryAddress
                : metaFactoryAddress;
        },
        async getFactoryData() {
            if (smartAccountDeployed)
                return undefined;
            smartAccountDeployed = await isSmartAccountDeployed(client, accountAddress);
            if (smartAccountDeployed)
                return undefined;
            return generateInitCode();
        },
        // Encode the deploy call data
        async encodeDeployCallData(_) {
            throw new Error("Simple account doesn't support account deployment");
        },
        // Encode a call
        async encodeCallData(_tx) {
            return encodeCallData(_tx, kernelVersion);
        },
        // Get simple dummy signature
        async getDummySignature(_userOperation) {
            if (kernelVersion === "0.2.2") {
                return concatHex([ROOT_MODE_KERNEL_V2, DUMMY_ECDSA_SIGNATURE]);
            }
            return DUMMY_ECDSA_SIGNATURE;
        }
    });
}
//# sourceMappingURL=signerToEcdsaKernelSmartAccount.js.map