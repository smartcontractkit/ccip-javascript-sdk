import { describe, it, expect } from 'vitest'
import { address, generateKeyPair, getAddressFromPublicKey } from '@solana/kit'
import {
    encodeSVMExtraArgsV1,
    decodeSVMExtraArgsV1,
    SVM_EXTRA_ARGS_V1_TAG,
    type Address
} from '../encoders/svmExtraArgsV1'

// Helper function to create a random address
async function createRandomAddress(): Promise<Address> {
    const keyPair = await generateKeyPair()
    return await getAddressFromPublicKey(keyPair.publicKey)
}

describe('SVM Extra Args V1', () => {
    describe('encodeSVMExtraArgsV1', () => {
        it('should encode SVM extra args with default values', () => {
            const original = {}

            const encoded = encodeSVMExtraArgsV1(original)

            const expected = "0x1f3b3aba00000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000";

            expect(encoded).toBeInstanceOf(Uint8Array)
            // 4 bytes tag + 4 bytes computeUnits + 8 bytes bitmap + 1 byte bool + 32 bytes tokenReceiver + 4 bytes accounts length = 53 bytes
            expect(encoded.length).toBe(53)
            expect(encoded).toEqual(new Uint8Array(Buffer.from(expected.slice(2), 'hex')))
        })

        it('should encode SVM extra args with all parameters', async () => {
            const tokenReceiver = await createRandomAddress()
            const account1 = await createRandomAddress()
            const account2 = await createRandomAddress()

            const original = {
                computeUnits: 400000,
                accountIsWritableBitmap: 0b1010n, // 2nd and 4th bits set
                allowOutOfOrderExecution: true,
                tokenReceiver,
                accounts: [account1, account2]
            }

            const encoded = encodeSVMExtraArgsV1(original)

            expect(encoded).toBeInstanceOf(Uint8Array)
            // 4 bytes tag + 4 bytes computeUnits + 8 bytes bitmap + 1 byte bool + 32 bytes tokenReceiver + 4 bytes accounts length + 64 bytes accounts = 117 bytes
            expect(encoded.length).toBe(117)
        })

        it('should encode minimal SVM extra args', () => {
            const original = {
                computeUnits: 0,
                accountIsWritableBitmap: 0n,
                allowOutOfOrderExecution: false,
                accounts: []
            }

            const encoded = encodeSVMExtraArgsV1(original)

            const expected = "0x1f3b3aba00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

            expect(encoded).toBeInstanceOf(Uint8Array)
            expect(encoded.length).toBe(53) // Same as default since no accounts
            expect(encoded).toEqual(new Uint8Array(Buffer.from(expected.slice(2), 'hex')))
        })

        it('should include correct tag at the beginning', () => {
            const encoded = encodeSVMExtraArgsV1({})

            // Extract first 4 bytes and convert to uint32 big-endian
            const tag = new DataView(encoded.buffer, encoded.byteOffset, 4).getUint32(0, false)
            expect(tag).toBe(SVM_EXTRA_ARGS_V1_TAG)
            expect(tag).toBe(0x1f3b3aba)
        })

        it('should encode with many accounts', async () => {
            const accounts = await Promise.all(Array.from({ length: 5 }, () => createRandomAddress()))
            const original = {
                accounts
            }

            const encoded = encodeSVMExtraArgsV1(original)

            expect(encoded).toBeInstanceOf(Uint8Array)
            // 4 bytes tag + 4 bytes computeUnits + 8 bytes bitmap + 1 byte bool + 32 bytes tokenReceiver + 4 bytes accounts length + (5 * 32) bytes accounts = 213 bytes
            expect(encoded.length).toBe(213)
        })
    })

    describe('decodeSVMExtraArgsV1', () => {
        it('should decode SVM extra args with default values', () => {
            const original = {
                computeUnits: 0,
                accountIsWritableBitmap: 0n,
                allowOutOfOrderExecution: true,
                accounts: []
            }

            const encoded = encodeSVMExtraArgsV1(original)
            const decoded = decodeSVMExtraArgsV1(encoded)

            expect(decoded.computeUnits).toBe(0)
            expect(decoded.accountIsWritableBitmap).toBe(0n)
            expect(decoded.allowOutOfOrderExecution).toBe(true)
            expect(decoded.accounts).toHaveLength(0)
            expect(typeof decoded.tokenReceiver).toBe('string') // Address is a string type
        })

        it('should decode SVM extra args with all parameters', async () => {
            const tokenReceiver = await createRandomAddress()
            const account1 = await createRandomAddress()
            const account2 = await createRandomAddress()

            const original = {
                computeUnits: 400000,
                accountIsWritableBitmap: 0b1010n, // 2nd and 4th bits set
                allowOutOfOrderExecution: false,
                tokenReceiver,
                accounts: [account1, account2]
            }

            const encoded = encodeSVMExtraArgsV1(original)
            const decoded = decodeSVMExtraArgsV1(encoded)

            expect(decoded.computeUnits).toBe(original.computeUnits)
            expect(decoded.accountIsWritableBitmap).toBe(original.accountIsWritableBitmap)
            expect(decoded.allowOutOfOrderExecution).toBe(original.allowOutOfOrderExecution)
            expect(decoded.tokenReceiver?.toString()).toBe(original.tokenReceiver.toString())
            expect(decoded.accounts?.length).toBe(2)
            expect(decoded.accounts?.[0].toString()).toBe(account1.toString())
            expect(decoded.accounts?.[1].toString()).toBe(account2.toString())
        })

        it('should decode with many accounts', async () => {
            const accounts = await Promise.all(Array.from({ length: 5 }, () => createRandomAddress()))
            const original = {
                computeUnits: 123456,
                accounts
            }

            const encoded = encodeSVMExtraArgsV1(original)
            const decoded = decodeSVMExtraArgsV1(encoded)

            expect(decoded.computeUnits).toBe(original.computeUnits)
            expect(decoded.accounts?.length).toBe(5)
            accounts.forEach((account, index) => {
                expect(decoded.accounts?.[index].toString()).toBe(account.toString())
            })
        })

        it('should throw error for data too short', () => {
            const shortData = new Uint8Array(10) // Too short

            expect(() => decodeSVMExtraArgsV1(shortData)).toThrow('Invalid SVM Extra Args V1: data too short')
        })

        it('should throw error for invalid tag', () => {
            const invalidData = new Uint8Array(53)
            // Set wrong tag (first 4 bytes)
            invalidData[0] = 0x12
            invalidData[1] = 0x34
            invalidData[2] = 0x56
            invalidData[3] = 0x78

            expect(() => decodeSVMExtraArgsV1(invalidData)).toThrow(
                'Invalid SVM Extra Args V1 tag: expected 0x1f3b3aba, got 0x12345678'
            )
        })
    })

    describe('round-trip encoding/decoding', () => {
        it('should maintain data integrity through encode/decode cycle', async () => {
            const tokenReceiver = await createRandomAddress()
            const accounts = await Promise.all([createRandomAddress(), createRandomAddress(), createRandomAddress()])

            const testCases = [
                // Minimal case
                {
                    computeUnits: 0,
                    accountIsWritableBitmap: 0n,
                    allowOutOfOrderExecution: true,
                    accounts: []
                },
                // Full case
                {
                    computeUnits: 500000,
                    accountIsWritableBitmap: 0b11110000n,
                    allowOutOfOrderExecution: false,
                    tokenReceiver,
                    accounts
                },
                // Edge values
                {
                    computeUnits: 4294967295, // max uint32
                    accountIsWritableBitmap: 18446744073709551615n, // max uint64
                    allowOutOfOrderExecution: true,
                    accounts: [await createRandomAddress()]
                },
                // Default values
                {}
            ]

            testCases.forEach((original, index) => {
                const encoded = encodeSVMExtraArgsV1(original)
                const decoded = decodeSVMExtraArgsV1(encoded)

                expect(decoded.computeUnits).toBe(original.computeUnits ?? 0)
                expect(decoded.accountIsWritableBitmap).toBe(original.accountIsWritableBitmap ?? 0n)
                expect(decoded.allowOutOfOrderExecution).toBe(original.allowOutOfOrderExecution ?? true)
                
                if (original.tokenReceiver) {
                    expect(decoded.tokenReceiver?.toString()).toBe(original.tokenReceiver.toString())
                } else {
                    expect(typeof decoded.tokenReceiver).toBe('string') // Address is a string
                }

                expect(decoded.accounts?.length).toBe(original.accounts?.length ?? 0)
                original.accounts?.forEach((account, accountIndex) => {
                    expect(decoded.accounts?.[accountIndex].toString()).toBe(account.toString())
                })
            })
        })
    })

    describe('specific serialization format validation', () => {
        it('should serialize fields in correct Borsh-like format', () => {
            const tokenReceiver = address('11111111111111111111111111111112') // System program
            const account = address('11111111111111111111111111111112')
            
            const original = {
                computeUnits: 0x12345678, // Will be serialized as little-endian
                accountIsWritableBitmap: 0x123456789abcdef0n, // Will be serialized as little-endian
                allowOutOfOrderExecution: false, // Will be serialized as 0
                tokenReceiver,
                accounts: [account]
            }

            const encoded = encodeSVMExtraArgsV1(original)

            // Verify tag (big-endian)
            expect(encoded[0]).toBe(0x1f)
            expect(encoded[1]).toBe(0x3b)
            expect(encoded[2]).toBe(0x3a)
            expect(encoded[3]).toBe(0xba)

            // Verify computeUnits (little-endian u32)
            expect(encoded[4]).toBe(0x78)
            expect(encoded[5]).toBe(0x56)
            expect(encoded[6]).toBe(0x34)
            expect(encoded[7]).toBe(0x12)

            // Verify accountIsWritableBitmap (little-endian u64)
            expect(encoded[8]).toBe(0xf0)
            expect(encoded[9]).toBe(0xde)
            expect(encoded[10]).toBe(0xbc)
            expect(encoded[11]).toBe(0x9a)
            expect(encoded[12]).toBe(0x78)
            expect(encoded[13]).toBe(0x56)
            expect(encoded[14]).toBe(0x34)
            expect(encoded[15]).toBe(0x12)

            // Verify allowOutOfOrderExecution (bool)
            expect(encoded[16]).toBe(0x00) // false

            // Verify accounts length (little-endian u32)
            expect(encoded[49]).toBe(0x01) // 1 account
            expect(encoded[50]).toBe(0x00)
            expect(encoded[51]).toBe(0x00)
            expect(encoded[52]).toBe(0x00)
        })
    })
})