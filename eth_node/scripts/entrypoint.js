const fs = require('fs');
const { Web3 } = require('web3');
const { ENTRYPOINT_ADDRESS_V06 } = require('permissionless');
const { createKernelAccount } = require('@zerodev/sdk');
const {
    createPublicClient,
    http,
    toHex,
    parseUnits,
    pad,
} = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { signerToEcdsaValidator } = require('@zerodev/ecdsa-validator');

const nodeUrl = 'http://0.0.0.0:8545';

let web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
let eth = web3.eth;

let deployerAccount;

web3.extend({
    property: 'cheats',
    methods: [
        {
            name: 'setBalance',
            call: 'anvil_setBalance',
        },
        {
            name: 'setCode',
            call: 'anvil_setCode',
        },
        {
            name: 'getStorageAt',
            call: 'eth_getStorageAt',
        },
        {
            name: 'setStorageAt',
            call: 'anvil_setStorageAt',
        },
        {
            name: 'setLoggingEnabled',
            call: 'anvil_setLoggingEnabled',
        }
    ],
});

const DeployerAddress = process.env.DEPLOYER_ADDRESS;
const DeployerPrivateKey = process.env.DEPLOYER_PK;
const EntryPointAddress = ENTRYPOINT_ADDRESS_V06;
const KernelECDSAValidatorAddress = process.env.KERNEL_ECDSA_VALIDATOR_ADDRESS;
const KernelAddress = process.env.KERNEL_ADDRESS;
const KernelFactoryAddress = process.env.KERNEL_FACTORY_ADDRESS;
const TargetAccountsNumber = process.env.TARGET_ACCOUNTS_NUMBER;

const signer = privateKeyToAccount(`0x${DeployerPrivateKey}`);

const publicClient = createPublicClient({
    transport: http(nodeUrl),
});
let ecdsaValidator;

const contracts = {
    EntryPoint: {
        codePath: '/app/contracts/EntryPoint.json',
        nonce: 0,
    },
    KernelECDSAValidator: {
        codePath: '/app/contracts/KernelECDSAValidator.json',
        nonce: 1,
    },
    Kernel: {
        codePath: '/app/contracts/Kernel.json',
        args: [EntryPointAddress],
        nonce: 2,
    },
    KernelFactory: {
        codePath: '/app/contracts/KernelFactory.json',
        args: [DeployerAddress, EntryPointAddress],
        nonce: 3,
    },
    SessionKeyValidator: {
        codePath: '/app/contracts/SessionKeyValidator.json',
        nonce: 4,
    },
};

async function main() {
    deployerAccount = web3.eth.accounts.privateKeyToAccount(
        '0x' + DeployerPrivateKey
    );
    await web3.cheats.setBalance(DeployerAddress, '0xd3c21bcecceda1000000'); // 1_000_000 ETH
    await web3.cheats.setLoggingEnabled(true);

    ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        entryPoint: EntryPointAddress,
        signer,
        validatorAddress: KernelECDSAValidatorAddress,
        kernelVersion: '0.2.2',
    });

    await deployContracts();
    await fundSmartAccounts();
    await fundAddress(DeployerAddress);
}

main();

async function deployContracts() {
    for (const [name, { codePath, args, nonce }] of Object.entries(contracts)) {
        let { abi, bin } = JSON.parse(fs.readFileSync(codePath));
        let contractAddress = await deployContract(abi, bin, nonce, args);

        contracts[name].address = contractAddress;

        console.log(`==== ${name} deployed at ${contractAddress}`);
    }

    await setKernelImplementation();
    await setEntryPointToHardcodedAddress();
}

async function fundSmartAccounts() {
    for (let i = 0; i < TargetAccountsNumber; i++) {
        await fundSmartAccount(i);
    }
}

async function fundSmartAccount(index) {
    const account = await createKernelAccount(publicClient, {
        plugins: {
            sudo: ecdsaValidator,
        },
        entryPoint: EntryPointAddress,
        factoryAddress: KernelFactoryAddress,
        accountLogicAddress: KernelAddress,
        index,
    });

    console.log(`==== Funding ${account.address} smart account`);

    await fundAddress(account.address);
}

async function fundAddress(address) {
    // Fund the address with 1000 ETH by default
    let balance = toBytes32(
        parseUnits('' + 1000, 18)
    ).toString();
    await web3.cheats.setBalance(address, balance);
}

async function setEntryPointToHardcodedAddress() {
    let contractCode = await eth.getCode(contracts.EntryPoint.address);
    await web3.cheats.setCode(EntryPointAddress, contractCode);
}

async function setKernelImplementation() {
    let { abi } = JSON.parse(fs.readFileSync(contracts.KernelFactory.codePath));
    let contract = new eth.Contract(abi);
    let data = await contract.methods
        .setImplementation(contracts.Kernel.address, true)
        .encodeABI();

    let gas = await eth.estimateGas({
        from: DeployerAddress,
        to: contracts.KernelFactory.address,
        data,
    });

    let signedTx = await deployerAccount.signTransaction({
        from: DeployerAddress,
        to: contracts.KernelFactory.address,
        gas,
        gasPrice: '30000000000',
        data,
    });

    await eth.sendSignedTransaction(signedTx.rawTransaction);
}

async function deployContract(abi, bin, nonce, arguments = undefined) {
    let contract = new eth.Contract(abi);
    let deployData = contract
        .deploy({
            data: bin,
            arguments,
        })
        .encodeABI();

    let gas = await eth.estimateGas({ data: deployData });

    let signedTx = await deployerAccount.signTransaction({
        from: DeployerAddress,
        gas,
        gasPrice: '30000000000',
        data: deployData,
        nonce,
    });

    let receipt = await eth.sendSignedTransaction(signedTx.rawTransaction);

    return receipt.contractAddress;
}

const toBytes32 = (bn) => {
    return pad(toHex(bn), { size: 32 });
};
