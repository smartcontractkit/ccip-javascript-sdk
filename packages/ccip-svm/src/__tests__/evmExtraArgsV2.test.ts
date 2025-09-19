import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
    encodeEVMExtraArgsV2,
    decodeEVMExtraArgsV2,
    EVM_EXTRA_ARGS_V2_TAG
} from '../encoders/evmExtraArgsV2'

describe('EVM Extra Args V2', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        // Spy on console.warn to test warning messages
        consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })
    })

    afterEach(() => {
        consoleSpy.mockRestore()
    })

    describe('encodeEVMExtraArgsV2', () => {
        it('should encode EVM extra args with default allowOutOfOrderExecution=true', () => {
            const original = {
                gasLimit: 100000n
            }

            const encoded = encodeEVMExtraArgsV2(original)

            // Should not show any warning for default behavior
            expect(consoleSpy).not.toHaveBeenCalled()

            const expected = "0x181dcf1000000000000000000000000000000000000000000000000000000000000186a00000000000000000000000000000000000000000000000000000000000000001";

            expect(encoded).toBeInstanceOf(Uint8Array)
            expect(encoded.length).toBe(68) // 4 bytes tag + 64 bytes ABI encoded data
            expect(encoded).toEqual(new Uint8Array(Buffer.from(expected.slice(2), 'hex')))
        })

        it('should encode EVM extra args with explicit allowOutOfOrderExecution=true', () => {
            const original = {
                gasLimit: 100000n,
                allowOutOfOrderExecution: true
            }

            const encoded = encodeEVMExtraArgsV2(original)

            // Should not show any warning for recommended value
            expect(consoleSpy).not.toHaveBeenCalled()

            const expected = "0x181dcf1000000000000000000000000000000000000000000000000000000000000186a00000000000000000000000000000000000000000000000000000000000000001";

            expect(encoded).toBeInstanceOf(Uint8Array)
            expect(encoded.length).toBe(68)
            expect(encoded).toEqual(new Uint8Array(Buffer.from(expected.slice(2), 'hex')))
        })

        it('should encode EVM extra args with allowOutOfOrderExecution=false and show warning', () => {
            const original = {
                gasLimit: 100000n,
                allowOutOfOrderExecution: false
            }

            const encoded = encodeEVMExtraArgsV2(original)

            // Should show warning when user overrides to false
            expect(consoleSpy).toHaveBeenCalledWith(
                `Warning: Setting allowOutOfOrderExecution to false is not recommended for EVM destinations.`
            )

            const expected = "0x181dcf1000000000000000000000000000000000000000000000000000000000000186a00000000000000000000000000000000000000000000000000000000000000000";

            expect(encoded).toBeInstanceOf(Uint8Array)
            expect(encoded.length).toBe(68)
            expect(encoded).toEqual(new Uint8Array(Buffer.from(expected.slice(2), 'hex')))
        })

        it('should handle token-only transfers (gasLimit = 0)', () => {
            const original = {
                gasLimit: 0n,
                allowOutOfOrderExecution: true
            }

            const encoded = encodeEVMExtraArgsV2(original)

            const expected = "0x181dcf1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001";

            expect(consoleSpy).not.toHaveBeenCalled()
            expect(encoded).toBeInstanceOf(Uint8Array)
            expect(encoded.length).toBe(68)
            expect(encoded).toEqual(new Uint8Array(Buffer.from(expected.slice(2), 'hex')))
        })

        it('should include correct tag at the beginning', () => {
            const encoded = encodeEVMExtraArgsV2({ gasLimit: 0n })

            // Extract first 4 bytes and convert to uint32 big-endian
            const tag = new DataView(encoded.buffer, encoded.byteOffset, 4).getUint32(0, false)
            expect(tag).toBe(EVM_EXTRA_ARGS_V2_TAG)
            expect(tag).toBe(0x181dcf10)
        })
    })

    describe('decodeEVMExtraArgsV2', () => {
        it('should decode EVM extra args correctly with default values', () => {
            const original = {
                gasLimit: 200000n,
                allowOutOfOrderExecution: true
            }

            const encoded = encodeEVMExtraArgsV2(original)
            const decoded = decodeEVMExtraArgsV2(encoded)

            expect(decoded.gasLimit).toBe(original.gasLimit)
            expect(decoded.allowOutOfOrderExecution).toBe(original.allowOutOfOrderExecution)
        })

        it('should decode EVM extra args with allowOutOfOrderExecution=false', () => {
            const original = {
                gasLimit: 150000n,
                allowOutOfOrderExecution: false
            }

            const encoded = encodeEVMExtraArgsV2(original)
            const decoded = decodeEVMExtraArgsV2(encoded)

            expect(decoded.gasLimit).toBe(original.gasLimit)
            expect(decoded.allowOutOfOrderExecution).toBe(original.allowOutOfOrderExecution)
        })

        it('should decode token-only transfers (gasLimit = 0)', () => {
            const original = {
                gasLimit: 0n,
                allowOutOfOrderExecution: true
            }

            const encoded = encodeEVMExtraArgsV2(original)
            const decoded = decodeEVMExtraArgsV2(encoded)

            expect(decoded.gasLimit).toBe(0n)
            expect(decoded.allowOutOfOrderExecution).toBe(true)
        })

        it('should throw error for data too short', () => {
            const shortData = new Uint8Array(10) // Too short

            expect(() => decodeEVMExtraArgsV2(shortData)).toThrow('Invalid EVM Extra Args V2: data too short')
        })

        it('should throw error for invalid tag', () => {
            const invalidData = new Uint8Array(68)
            // Set wrong tag (first 4 bytes)
            invalidData[0] = 0x12
            invalidData[1] = 0x34
            invalidData[2] = 0x56
            invalidData[3] = 0x78

            expect(() => decodeEVMExtraArgsV2(invalidData)).toThrow(
                'Invalid EVM Extra Args V2 tag: expected 0x181dcf10, got 0x12345678'
            )
        })
    })

    describe('round-trip encoding/decoding', () => {
        it('should maintain data integrity through encode/decode cycle', () => {
            const testCases = [
                { gasLimit: 0n, allowOutOfOrderExecution: true },
                { gasLimit: 200000n, allowOutOfOrderExecution: true },
                { gasLimit: 1000000n, allowOutOfOrderExecution: false }
            ]

            testCases.forEach((original) => {
                const encoded = encodeEVMExtraArgsV2(original)
                const decoded = decodeEVMExtraArgsV2(encoded)

                expect(decoded.gasLimit).toBe(original.gasLimit)
                expect(decoded.allowOutOfOrderExecution).toBe(original.allowOutOfOrderExecution ?? true)
            })
        })
    })
})