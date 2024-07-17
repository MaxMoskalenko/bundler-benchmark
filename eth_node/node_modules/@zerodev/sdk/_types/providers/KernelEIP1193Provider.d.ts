/// <reference types="node" />
import { EventEmitter } from "events";
import type { KernelAccountClient } from "@zerodev/sdk";
import type { EntryPoint } from "permissionless/types";
import type { EIP1193Parameters, EIP1193RequestFn } from "viem";
export declare class KernelEIP1193Provider<entryPoint extends EntryPoint> extends EventEmitter {
    private kernelClient;
    constructor(kernelClient: KernelAccountClient<entryPoint>);
    request({ method, params }: EIP1193Parameters): ReturnType<EIP1193RequestFn>;
    private handleEthRequestAccounts;
    private handleEthAccounts;
    private handleEthSendTransaction;
    private handleEthSign;
    private handlePersonalSign;
    private handleEthSignTypedDataV4;
}
//# sourceMappingURL=KernelEIP1193Provider.d.ts.map