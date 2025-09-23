import { address, getAddressEncoder, getAddressDecoder } from '@solana/kit'

/**
 * SVM Extra Args V1 tag: bytes4(keccak256("CCIP SVMExtraArgsV1"))
 */
export const SVM_EXTRA_ARGS_V1_TAG = 0x1f3b3aba

export type Address = ReturnType<typeof address>

export interface SVMExtraArgsV1 {
  computeUnits?: number
  accountIsWritableBitmap?: bigint
  allowOutOfOrderExecution?: boolean
  tokenReceiver?: Address
  accounts?: Address[]
}

/**
 * Creates properly encoded extraArgs buffer for SVM destinations
 * @param options - SVM extra args configuration
 * @returns Properly encoded extraArgs as Uint8Array
 */
export function encodeSVMExtraArgsV1({
  computeUnits = 0,
  accountIsWritableBitmap = 0n,
  allowOutOfOrderExecution = true,
  tokenReceiver,
  accounts = [],
}: SVMExtraArgsV1): Uint8Array {
  // bytes4(keccak256("CCIP SVMExtraArgsV1")) = 0x1f3b3aba
  const tag = new Uint8Array([0x1f, 0x3b, 0x3a, 0xba])

  // Prepare data for Borsh-like serialization
  const buffer: number[] = []

  // Serialize compute_units (u32, little-endian)
  const computeUnitsBytes = new Uint8Array(4)
  new DataView(computeUnitsBytes.buffer).setUint32(0, computeUnits, true)
  buffer.push(...computeUnitsBytes)

  // Serialize account_is_writable_bitmap (u64, little-endian)
  const bitmapBytes = new Uint8Array(8)
  new DataView(bitmapBytes.buffer).setBigUint64(0, accountIsWritableBitmap, true)
  buffer.push(...bitmapBytes)

  // Serialize allow_out_of_order_execution (bool, 1 byte)
  buffer.push(allowOutOfOrderExecution ? 1 : 0)

  // Serialize token_receiver ([u8; 32])
  const encoder = getAddressEncoder()
  const tokenReceiverBytes = tokenReceiver ? encoder.encode(tokenReceiver) : new Uint8Array(32) // Default/zero address
  buffer.push(...tokenReceiverBytes)

  // Serialize accounts (Vec<[u8; 32]>)
  // First, serialize the length of the vector as u32 little-endian
  const accountsLengthBytes = new Uint8Array(4)
  new DataView(accountsLengthBytes.buffer).setUint32(0, accounts.length, true)
  buffer.push(...accountsLengthBytes)

  // Then serialize each account (32 bytes each)
  for (const account of accounts) {
    buffer.push(...encoder.encode(account))
  }

  // Combine tag + serialized data
  const serializedData = new Uint8Array(buffer)
  const result = new Uint8Array(tag.length + serializedData.length)
  result.set(tag, 0)
  result.set(serializedData, tag.length)

  return result
}

/**
 * Decodes SVM Extra Args V1 from bytes
 * @param data - Encoded extra args bytes
 * @returns Decoded SVMExtraArgsV1 object
 */
export function decodeSVMExtraArgsV1(data: Uint8Array): SVMExtraArgsV1 {
  // 4 bytes tag + 4 bytes computeUnits + 8 bytes bitmap + 1 byte bool + 32 bytes tokenReceiver + 4 bytes accounts length
  if (data.length < 4 + 4 + 8 + 1 + 32 + 4) {
    throw new Error(
      'Invalid SVM Extra Args V1: data too short, expected at least 53 bytes (4 bytes tag + 4 bytes computeUnits + 8 bytes bitmap + 1 byte bool + 32 bytes tokenReceiver + 4 bytes accounts length)',
    )
  }

  // Verify tag
  const tag = new DataView(data.buffer, data.byteOffset, 4).getUint32(0, false) // big endian
  if (tag !== SVM_EXTRA_ARGS_V1_TAG) {
    throw new Error(
      `Invalid SVM Extra Args V1 tag: expected 0x${SVM_EXTRA_ARGS_V1_TAG.toString(16)}, got 0x${tag.toString(16)}`,
    )
  }

  let offset = 4 // Skip tag

  // Deserialize compute_units (u32, little-endian)
  const computeUnits = new DataView(data.buffer, data.byteOffset + offset, 4).getUint32(0, true)
  offset += 4

  // Deserialize account_is_writable_bitmap (u64, little-endian)
  const accountIsWritableBitmap = new DataView(data.buffer, data.byteOffset + offset, 8).getBigUint64(0, true)
  offset += 8

  // Deserialize allow_out_of_order_execution (bool)
  const allowOutOfOrderExecution = data[offset] === 1
  offset += 1

  // Deserialize token_receiver ([u8; 32])
  const tokenReceiverBytes = data.slice(offset, offset + 32)
  const decoder = getAddressDecoder()
  const tokenReceiver = decoder.decode(tokenReceiverBytes)
  offset += 32

  // Deserialize accounts (Vec<[u8; 32]>)
  const accountsLength = new DataView(data.buffer, data.byteOffset + offset, 4).getUint32(0, true)
  offset += 4

  const accounts: Address[] = []
  for (let i = 0; i < accountsLength; i++) {
    const accountBytes = data.slice(offset, offset + 32)
    accounts.push(decoder.decode(accountBytes))
    offset += 32
  }

  return {
    computeUnits,
    accountIsWritableBitmap,
    allowOutOfOrderExecution,
    tokenReceiver,
    accounts,
  }
}
