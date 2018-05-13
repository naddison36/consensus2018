
import BN from 'bn.js';
import {SendOptions} from './BaseContract'
import {providers, utils} from 'ethers'


// export declare module ethers
// {
	export interface TransactionReceipt {
		contractAddress?: string,
		transactionIndex: number,
		root?: string,
		status?: BN,
		gasUsed: BN,
		cumulativeGasUsed: BN,
		logsBloom: string,
		blockHash: string,
		transactionHash: string,
		logs: TransactionReceiptLog[],
		blockNumber: number
	}

	export interface TransactionReceiptLog {
		blockNumber: number,
		blockHash: string,
		transactionHash: string,
		transactionIndex: number,
		transactionLogIndex: number,
		address: string,
		topics: string[],
		data: string,
		logIndex: number
	}
// }

export declare interface TransactionEvent {
	[index:string] : BN | number | string | boolean | object
}

export declare interface TransactionReceiptWithEvents extends TransactionReceipt {
	events: {[eventName:string]: TransactionEvent}
}

export declare interface MinedTransaction {
    hash: string,
	blockHash: string,
    blockNumber: number,
    transactionIndex: number,
    from: string,
    gasPrice: BN,
    gasLimit: BN,
    to: string,
    value: BN,
    nonce: number,
    data: string,
    r: string,
    s: string,
    v: 27 | 28,
    creates?: any,
    raw: string,
    networkId: number
}

export declare type ABI_Interface = object[]

export declare interface BaseContractOptions {
	networkName?: string,
	rpc_url?: string,
	transactionsProvider?: providers.Provider,
	eventsProvider?: providers.Provider,
	abiInterface?: ABI_Interface, // if not passed it can be loaded from disk at compilerOutputFolder/contractName.json
	contractAddress?: string,
	defaultSendOptions?: SendOptions,
    contractName?: string,
	contractBinaryFolder?: string,
	noGasPrice?: boolean, // used for private chains like Quorum which must have zero gas price
	decimals?: number,
	decimalProperties?: string[],
	pollingInterval?: number
	confirmations?: number
	bigNumberFunction?: new (bigNumber: string)=>any
}

export type SendTransaction = {
	from?: string
	to?: string
	data?: string
	nonce: number
	gasPrice: number
	gasLimit: number
	value: number
}