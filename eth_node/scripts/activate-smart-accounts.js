const {
    createKernelAccount,
    createKernelAccountClient,
} = require('@zerodev/sdk');
const { createPublicClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { signerToEcdsaValidator } = require('@zerodev/ecdsa-validator');
const {
    createPimlicoBundlerClient,
} = require('permissionless/clients/pimlico');
const { ENTRYPOINT_ADDRESS_V06, bundlerActions } = require('permissionless');

const DeployerPrivateKey = process.env.DEPLOYER_PK;
const EntryPointAddress = ENTRYPOINT_ADDRESS_V06;
const KernelECDSAValidatorAddress = process.env.KERNEL_ECDSA_VALIDATOR_ADDRESS;
const KernelAddress = process.env.KERNEL_ADDRESS;
const KernelFactoryAddress = process.env.KERNEL_FACTORY_ADDRESS;
const TargetAccountsNumber = process.env.TARGET_ACCOUNTS_NUMBER;

const bundlerUrl = 'http://bundler:3000';
const nodeUrl = 'http://0.0.0.0:8545';

const signer = privateKeyToAccount(`0x${DeployerPrivateKey}`);

const publicClient = createPublicClient({
    transport: http(nodeUrl),
});

const pimlicoBundlerClient = createPimlicoBundlerClient({
    entryPoint: EntryPointAddress,
    transport: http(bundlerUrl),
}).extend(bundlerActions);

async function main() {
    await activateSmartAccounts();
}

main();

async function activateSmartAccounts() {
    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        entryPoint: EntryPointAddress,
        signer,
        validatorAddress: KernelECDSAValidatorAddress,
        kernelVersion: '0.2.2',
    });

    console.log("sending transactions...")
    let hashes = await activateAccounts(ecdsaValidator);
    await waitForAccountActivation(hashes);
}

async function activateAccounts(ecdsaValidator) {
    let promises = [];

    for (let i = 0; i < Number(TargetAccountsNumber); i++) {
        const account = await createKernelAccount(publicClient, {
            plugins: {
                sudo: ecdsaValidator,
            },
            entryPoint: EntryPointAddress,
            factoryAddress: KernelFactoryAddress,
            accountLogicAddress: KernelAddress,
            index: i,
        });

        const kernelClient = createKernelAccountClient({
            account,
            bundlerTransport: http(bundlerUrl),
            middleware: {
                gasPrice: async () => {
                    return (
                        await pimlicoBundlerClient.getUserOperationGasPrice()
                    ).fast;
                },
            },
            entryPoint: EntryPointAddress,
        });

        const promise = kernelClient.sendUserOperation({
            userOperation: {
                callData: kernelClient.account.encodeCallData({
                    to: '0x5fbdb2315678afecb367f032d93f642f64180aa3',
                    value: BigInt(1),
                    data: '0x',
                }),
                initCode: await kernelClient.account.getInitCode(),
            },
        });
        promises.push(promise);
    }

    return Promise.all(promises);
}

async function waitForAccountActivation(hashes) {
    let promises = [];

    for (const [i, hash] of hashes.entries()) {
        const promise = waitForUserOp(hash, i);
        promises.push(promise);
    }

    return Promise.all(promises);
}

async function waitForUserOp(hash, index) {
    const { status } = await pimlicoBundlerClient.getUserOperationStatus({
        hash,
    });

    if (status == 'not_found') {
        console.log(
            `Account ${index} activation failed. Hash: ${hash}. Status: ${status}`
        );
        return;
    }

    let i = 0;
    for (i = 0; i >= 0; i++) {
        const status = await pimlicoBundlerClient.getUserOperationStatus({
            hash,
        });

        if (status.status === 'not_found') {
            console.log(
                `Account ${index} activation failed. UserOpHash: ${hash}`
            );
            break;
        }

        if (status.status === 'included') {
            console.log(
                `Account ${index} activated. UserOpHash: ${hash}. TxHash: ${status.transactionHash}. Iteration: ${i}`
            );
            break;
        }

        if (i % 50 === 0 && i != 0) {
            console.log(
                `Account ${index} activation in progress. UserOpHash: ${hash}. Iteration: ${i}. Status: ${status.status}`
            );
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}
