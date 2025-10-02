/**
 * Converts a Uint8Array to a hex string with 0x prefix
 * @param bytes - The bytes to convert
 * @returns Hex string with 0x prefix
 */
export function toHex(bytes: Uint8Array): `0x${string}` {
  return `0x${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}` as `0x${string}`
}

/**
 * Converts a hex string (with or without 0x prefix) to Uint8Array
 * @param hex - The hex string to convert
 * @returns Uint8Array containing the bytes
 */
export function fromHex(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Invalid hex string: length must be even')
  }

  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.slice(i, i + 2), 16)
  }
  return bytes
}

/**
 * Converts a hex string to Uint8Array using Buffer (for compatibility)
 * @param hex - The hex string to convert (with or without 0x prefix)
 * @returns Uint8Array containing the bytes
 */
export function fromHexBuffer(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex
  return new Uint8Array(Buffer.from(cleanHex, 'hex'))
}
