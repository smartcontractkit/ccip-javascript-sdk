import type { Address, Chain, Hex, AbiEvent } from 'viem'

// Custom types to eliminate 'as any' casts throughout the adapter layer
export interface ContractCallArgs {
    address: Address
    // Supports both readonly and mutable ABI arrays for maximum compatibility
    // (readonly arrays come from parseAbi, static ABIs, etc.)
    abi: readonly any[] | any[]
    functionName: string
    args?: any[]
    chain?: Chain
}

export interface TransactionArgs {
    address: Address
    // Supports both readonly and mutable ABI arrays for maximum compatibility
    // (readonly arrays come from parseAbi, static ABIs, etc.)
    abi: readonly any[] | any[]
    functionName: string
    args?: any[]
    value?: bigint
    gas?: bigint
    gasPrice?: bigint
    nonce?: number
    chain?: Chain
}

export interface ReceiptArgs {
    hash: Hex
    confirmations?: number
    timeout?: number
    chain?: Chain
}

export interface LogsArgs {
    address?: Address
    event?: AbiEvent
    args?: Record<string, any>
    fromBlock?: bigint
    toBlock?: bigint

    chain?: Chain
}
