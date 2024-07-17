"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signerToEcdsaKernelSmartAccount = exports.getEcdsaRootIdentifierForKernelV3 = exports.KERNEL_VERSION_TO_ADDRESSES_MAP = void 0;
const viem_1 = require("viem");
const actions_1 = require("viem/actions");
const getAccountNonce_1 = require("../../actions/public/getAccountNonce.js");
const getSenderAddress_1 = require("../../actions/public/getSenderAddress.js");
const utils_1 = require("../../utils/index.js");
const getUserOperationHash_1 = require("../../utils/getUserOperationHash.js");
const isSmartAccountDeployed_1 = require("../../utils/isSmartAccountDeployed.js");
const toSmartAccount_1 = require("../toSmartAccount.js");
const types_1 = require("../types.js");
const KernelAccountAbi_1 = require("./abi/KernelAccountAbi.js");
const KernelV3AccountAbi_1 = require("./abi/KernelV3AccountAbi.js");
const KernelV3MetaFactoryAbi_1 = require("./abi/KernelV3MetaFactoryAbi.js");
const constants_1 = require("./constants.js");
const encodeCallData_1 = require("./utils/encodeCallData.js");
const getNonceKey_1 = require("./utils/getNonceKey.js");
const signMessage_1 = require("./utils/signMessage.js");
const signTypedData_1 = require("./utils/signTypedData.js");
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
exports.KERNEL_VERSION_TO_ADDRESSES_MAP = {
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
const getKernelVersion = (entryPoint) => {
    return entryPoint === utils_1.ENTRYPOINT_ADDRESS_V06 ? "0.2.2" : "0.3.0-beta";
};
const getDefaultAddresses = (entryPointAddress, { ecdsaValidatorAddress: _ecdsaValidatorAddress, accountLogicAddress: _accountLogicAddress, factoryAddress: _factoryAddress, metaFactoryAddress: _metaFactoryAddress }) => {
    const kernelVersion = getKernelVersion(entryPointAddress);
    const addresses = exports.KERNEL_VERSION_TO_ADDRESSES_MAP[kernelVersion];
    const ecdsaValidatorAddress = _ecdsaValidatorAddress ?? addresses.ECDSA_VALIDATOR;
    const accountLogicAddress = _accountLogicAddress ?? addresses.ACCOUNT_LOGIC;
    const factoryAddress = _factoryAddress ?? addresses.FACTORY_ADDRESS;
    const metaFactoryAddress = _metaFactoryAddress ?? addresses?.META_FACTORY_ADDRESS ?? viem_1.zeroAddress;
    return {
        ecdsaValidatorAddress,
        accountLogicAddress,
        factoryAddress,
        metaFactoryAddress
    };
};
const getEcdsaRootIdentifierForKernelV3 = (validatorAddress) => {
    return (0, viem_1.concatHex)([constants_1.VALIDATOR_TYPE.VALIDATOR, validatorAddress]);
};
exports.getEcdsaRootIdentifierForKernelV3 = getEcdsaRootIdentifierForKernelV3;
const getInitialisationData = ({ entryPoint: entryPointAddress, owner, ecdsaValidatorAddress }) => {
    const entryPointVersion = (0, utils_1.getEntryPointVersion)(entryPointAddress);
    if (entryPointVersion === "v0.6") {
        return (0, viem_1.encodeFunctionData)({
            abi: KernelAccountAbi_1.KernelInitAbi,
            functionName: "initialize",
            args: [ecdsaValidatorAddress, owner]
        });
    }
    return (0, viem_1.encodeFunctionData)({
        abi: KernelV3AccountAbi_1.KernelV3InitAbi,
        functionName: "initialize",
        args: [
            (0, exports.getEcdsaRootIdentifierForKernelV3)(ecdsaValidatorAddress),
            viem_1.zeroAddress,
            owner,
            "0x"
        ]
    });
};
const getAccountInitCode = async ({ entryPoint: entryPointAddress, owner, index, factoryAddress, accountLogicAddress, ecdsaValidatorAddress }) => {
    if (!owner)
        throw new Error("Owner account not found");
    const entryPointVersion = (0, utils_1.getEntryPointVersion)(entryPointAddress);
    const initialisationData = getInitialisationData({
        entryPoint: entryPointAddress,
        ecdsaValidatorAddress,
        owner
    });
    if (entryPointVersion === "v0.6") {
        return (0, viem_1.encodeFunctionData)({
            abi: createAccountAbi,
            functionName: "createAccount",
            args: [accountLogicAddress, initialisationData, index]
        });
    }
    return (0, viem_1.encodeFunctionData)({
        abi: KernelV3MetaFactoryAbi_1.KernelV3MetaFactoryDeployWithFactoryAbi,
        functionName: "deployWithFactory",
        args: [factoryAddress, initialisationData, (0, viem_1.toHex)(index, { size: 32 })]
    });
};
const getAccountAddress = async ({ client, owner, entryPoint: entryPointAddress, initCodeProvider, ecdsaValidatorAddress, deployedAccountAddress, factoryAddress }) => {
    if (deployedAccountAddress !== undefined) {
        const deployedAccountOwner = await (0, actions_1.readContract)(client, {
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
        if (!(0, viem_1.isAddressEqual)(deployedAccountOwner, owner)) {
            throw new Error("Invalid owner for the already deployed account");
        }
        return deployedAccountAddress;
    }
    const factoryData = await initCodeProvider();
    const entryPointVersion = (0, utils_1.getEntryPointVersion)(entryPointAddress);
    if (entryPointVersion === "v0.6") {
        return (0, getSenderAddress_1.getSenderAddress)(client, {
            initCode: (0, viem_1.concatHex)([factoryAddress, factoryData]),
            entryPoint: entryPointAddress
        });
    }
    return (0, getSenderAddress_1.getSenderAddress)(client, {
        factory: factoryAddress,
        factoryData: factoryData,
        entryPoint: entryPointAddress
    });
};
async function signerToEcdsaKernelSmartAccount(client, { signer, address, entryPoint: entryPointAddress, index = BigInt(0), factoryAddress: _factoryAddress, metaFactoryAddress: _metaFactoryAddress, accountLogicAddress: _accountLogicAddress, ecdsaValidatorAddress: _ecdsaValidatorAddress, deployedAccountAddress }) {
    const entryPointVersion = (0, utils_1.getEntryPointVersion)(entryPointAddress);
    const kernelVersion = getKernelVersion(entryPointAddress);
    const { accountLogicAddress, ecdsaValidatorAddress, factoryAddress, metaFactoryAddress } = getDefaultAddresses(entryPointAddress, {
        ecdsaValidatorAddress: _ecdsaValidatorAddress,
        accountLogicAddress: _accountLogicAddress,
        factoryAddress: _factoryAddress,
        metaFactoryAddress: _metaFactoryAddress
    });
    const viemSigner = {
        ...signer,
        signTransaction: (_, __) => {
            throw new types_1.SignTransactionNotSupportedBySmartAccount();
        }
    };
    const generateInitCode = () => getAccountInitCode({
        entryPoint: entryPointAddress,
        owner: viemSigner.address,
        index,
        factoryAddress,
        accountLogicAddress,
        ecdsaValidatorAddress
    });
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
        client.chain?.id ?? (0, actions_1.getChainId)(client)
    ]);
    if (!accountAddress)
        throw new Error("Account address not found");
    let smartAccountDeployed = await (0, isSmartAccountDeployed_1.isSmartAccountDeployed)(client, accountAddress);
    return (0, toSmartAccount_1.toSmartAccount)({
        address: accountAddress,
        async signMessage({ message }) {
            const signature = await (0, signMessage_1.signMessage)(client, {
                account: viemSigner,
                message,
                accountAddress,
                accountVersion: kernelVersion,
                chainId
            });
            if (kernelVersion === "0.2.2") {
                return signature;
            }
            return (0, viem_1.concatHex)([
                (0, exports.getEcdsaRootIdentifierForKernelV3)(ecdsaValidatorAddress),
                signature
            ]);
        },
        async signTransaction(_, __) {
            throw new types_1.SignTransactionNotSupportedBySmartAccount();
        },
        async signTypedData(typedData) {
            const signature = await (0, signTypedData_1.signTypedData)(client, {
                account: viemSigner,
                ...typedData,
                accountAddress,
                accountVersion: kernelVersion,
                chainId
            });
            if (kernelVersion === "0.2.2") {
                return signature;
            }
            return (0, viem_1.concatHex)([
                (0, exports.getEcdsaRootIdentifierForKernelV3)(ecdsaValidatorAddress),
                signature
            ]);
        },
        client: client,
        publicKey: accountAddress,
        entryPoint: entryPointAddress,
        source: "kernelEcdsaSmartAccount",
        async getNonce() {
            const key = (0, getNonceKey_1.getNonceKeyWithEncoding)(kernelVersion, ecdsaValidatorAddress);
            return (0, getAccountNonce_1.getAccountNonce)(client, {
                sender: accountAddress,
                entryPoint: entryPointAddress,
                key
            });
        },
        async signUserOperation(userOperation) {
            const hash = (0, getUserOperationHash_1.getUserOperationHash)({
                userOperation: {
                    ...userOperation,
                    signature: "0x"
                },
                entryPoint: entryPointAddress,
                chainId: chainId
            });
            const signature = await (0, actions_1.signMessage)(client, {
                account: viemSigner,
                message: { raw: hash }
            });
            if (kernelVersion === "0.2.2") {
                return (0, viem_1.concatHex)(["0x00000000", signature]);
            }
            return signature;
        },
        async getInitCode() {
            if (smartAccountDeployed)
                return "0x";
            smartAccountDeployed = await (0, isSmartAccountDeployed_1.isSmartAccountDeployed)(client, accountAddress);
            if (smartAccountDeployed)
                return "0x";
            const _factoryAddress = entryPointVersion === "v0.6"
                ? factoryAddress
                : metaFactoryAddress;
            return (0, viem_1.concatHex)([_factoryAddress, await generateInitCode()]);
        },
        async getFactory() {
            if (smartAccountDeployed)
                return undefined;
            smartAccountDeployed = await (0, isSmartAccountDeployed_1.isSmartAccountDeployed)(client, accountAddress);
            if (smartAccountDeployed)
                return undefined;
            return entryPointVersion === "v0.6"
                ? factoryAddress
                : metaFactoryAddress;
        },
        async getFactoryData() {
            if (smartAccountDeployed)
                return undefined;
            smartAccountDeployed = await (0, isSmartAccountDeployed_1.isSmartAccountDeployed)(client, accountAddress);
            if (smartAccountDeployed)
                return undefined;
            return generateInitCode();
        },
        async encodeDeployCallData(_) {
            throw new Error("Simple account doesn't support account deployment");
        },
        async encodeCallData(_tx) {
            return (0, encodeCallData_1.encodeCallData)(_tx, kernelVersion);
        },
        async getDummySignature(_userOperation) {
            if (kernelVersion === "0.2.2") {
                return (0, viem_1.concatHex)([constants_1.ROOT_MODE_KERNEL_V2, constants_1.DUMMY_ECDSA_SIGNATURE]);
            }
            return constants_1.DUMMY_ECDSA_SIGNATURE;
        }
    });
}
exports.signerToEcdsaKernelSmartAccount = signerToEcdsaKernelSmartAccount;
//# sourceMappingURL=signerToEcdsaKernelSmartAccount.js.map