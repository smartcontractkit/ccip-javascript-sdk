import { encodeAbiParameters, parseAbiParameters, decodeAbiParameters } from 'viem'

/**
 * EVM Extra Args V2 tag: bytes4(keccak256("CCIP EVMExtraArgsV2"))
 */
export const EVM_EXTRA_ARGS_V2_TAG = 0x181dcf10

export interface EVMExtraArgsV2 {
    gasLimit: bigint
    allowOutOfOrderExecution?: boolean
}

/**
 * Creates properly encoded extraArgs buffer for EVM destinations
 * @param gasLimit - Gas limit for execution on destination chain (use 0 for token-only transfers)
 * @param allowOutOfOrderExecution - Whether messages can be executed out of order (default: true)
 * @returns Properly encoded extraArgs as Uint8Array
 */
export function encodeEVMExtraArgsV2({
    gasLimit,
    allowOutOfOrderExecution = true
}: EVMExtraArgsV2): Uint8Array {
    if (allowOutOfOrderExecution === false) {
        console.warn(
            `Warning: Setting allowOutOfOrderExecution to false is not recommended for EVM destinations.`
        )
    }

    // bytes4(keccak256("CCIP EVMExtraArgsV2")) = 0x181dcf10
    const tag = new Uint8Array([0x18, 0x1d, 0xcf, 0x10])

    const encodedExtraArgs = encodeAbiParameters(
        parseAbiParameters('uint128 gasLimit, bool allowOutOfOrderExecution'),
        [gasLimit, allowOutOfOrderExecution]
    )

    const encodedExtraArgsBytes = new Uint8Array(Buffer.from(encodedExtraArgs.slice(2), 'hex'))

    // abi.encodeWithSelector(EVM_EXTRA_ARGS_V2_TAG, extraArgs)
    const result = new Uint8Array(tag.length + encodedExtraArgsBytes.length)
    result.set(tag, 0)
    result.set(encodedExtraArgsBytes, tag.length)

    return result
}

/**
 * Decodes EVM Extra Args V2 from bytes
 * @param data - Encoded extra args bytes
 * @returns Decoded EVMExtraArgsV2 object
 */
export function decodeEVMExtraArgsV2(data: Uint8Array): EVMExtraArgsV2 {
    // 4 bytes tag + 32 bytes gasLimit + 32 bytes bool = 68 bytes
    // For example (100_000 gasLimit and true), 0x181dcf1000000000000000000000000000000000000000000000000000000000000186a00000000000000000000000000000000000000000000000000000000000000001
    if (data.length < 68) {
        throw new Error('Invalid EVM Extra Args V2: data too short')
    }

    const tag = new DataView(data.buffer, data.byteOffset, 4).getUint32(0, false) // big endian
    if (tag !== EVM_EXTRA_ARGS_V2_TAG) {
        throw new Error(`Invalid EVM Extra Args V2 tag: expected 0x${EVM_EXTRA_ARGS_V2_TAG.toString(16)}, got 0x${tag.toString(16)}`)
    }

    const extraArgsData = data.slice(4)
    const extraArgsHex = '0x' + Array.from(extraArgsData).map(b => b.toString(16).padStart(2, '0')).join('')

    const [gasLimit, allowOutOfOrderExecution] = decodeAbiParameters(
        parseAbiParameters('uint128 gasLimit, bool allowOutOfOrderExecution'),
        extraArgsHex as `0x${string}`
    )

    return {
        gasLimit,
        allowOutOfOrderExecution
    }
}