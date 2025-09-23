import { encodeEVMExtraArgsV2, decodeEVMExtraArgsV2, EVM_EXTRA_ARGS_V2_TAG } from '../encoders/evmExtraArgsV2'
import { keccak256, toBytes } from 'viem'

describe('EVM Extra Args V2', () => {
  let consoleSpy: jest.SpyInstance
  const evmExtraArgsV2BytesLength = 68 // 4 bytes tag + 32 bytes gasLimit + 32 bytes bool

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  const testCases = [
    {
      name: 'should encode with default allowOutOfOrderExecution=true',
      input: { gasLimit: 100000n },
      expected:
        '0x181dcf1000000000000000000000000000000000000000000000000000000000000186a00000000000000000000000000000000000000000000000000000000000000001',
      shouldWarn: false,
    },
    {
      name: 'should encode with explicit allowOutOfOrderExecution=true',
      input: { gasLimit: 100000n, allowOutOfOrderExecution: true },
      expected:
        '0x181dcf1000000000000000000000000000000000000000000000000000000000000186a00000000000000000000000000000000000000000000000000000000000000001',
      shouldWarn: false,
    },
    {
      name: 'should encode with allowOutOfOrderExecution=false and show warning',
      input: { gasLimit: 100000n, allowOutOfOrderExecution: false },
      expected:
        '0x181dcf1000000000000000000000000000000000000000000000000000000000000186a00000000000000000000000000000000000000000000000000000000000000000',
      shouldWarn: true,
    },
    {
      name: 'should handle token-only transfers (gasLimit = 0)',
      input: { gasLimit: 0n, allowOutOfOrderExecution: true },
      expected:
        '0x181dcf1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001',
      shouldWarn: false,
    },
  ]

  describe('encodeEVMExtraArgsV2', () => {
    test.each(testCases)('$name', ({ input, expected, shouldWarn }) => {
      const encoded = encodeEVMExtraArgsV2(input)

      if (shouldWarn) {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Warning: Setting allowOutOfOrderExecution to false is not recommended for EVM destinations.',
        )
      } else {
        expect(consoleSpy).not.toHaveBeenCalled()
      }

      expect(encoded).toBeInstanceOf(Uint8Array)
      expect(encoded.length).toBe(evmExtraArgsV2BytesLength)
      const tag = new DataView(encoded.buffer, encoded.byteOffset, 4).getUint32(0, false)
      expect(tag).toBe(EVM_EXTRA_ARGS_V2_TAG)
      expect(encoded).toEqual(new Uint8Array(Buffer.from(expected.slice(2), 'hex')))
    })
  })

  describe('decodeEVMExtraArgsV2', () => {
    test.each(testCases)('should decode EVM extra args correctly with $name', ({ input }) => {
      const encoded = encodeEVMExtraArgsV2(input)
      const decoded = decodeEVMExtraArgsV2(encoded)

      expect(decoded.gasLimit).toBe(input.gasLimit)
      expect(decoded.allowOutOfOrderExecution).toBe(input.allowOutOfOrderExecution ?? true)
    })

    const errorTestCases = [
      {
        name: 'data too short',
        data: new Uint8Array(10),
        expectedError:
          'Invalid EVM Extra Args V2: data too short, expected at least 68 bytes (4 bytes tag + 32 bytes gasLimit + 32 bytes bool). Example (100_000 gasLimit and true): 0x181dcf1000000000000000000000000000000000000000000000000000000000000186a00000000000000000000000000000000000000000000000000000000000000001',
      },
      {
        name: 'invalid tag',
        data: (() => {
          const invalidData = new Uint8Array(evmExtraArgsV2BytesLength)
          invalidData[0] = 0x12
          invalidData[1] = 0x34
          invalidData[2] = 0x56
          invalidData[3] = 0x78
          return invalidData
        })(),
        expectedError: 'Invalid EVM Extra Args V2 tag: expected 0x181dcf10, got 0x12345678',
      },
    ]

    test.each(errorTestCases)('should throw error for $name', ({ data, expectedError }) => {
      expect(() => decodeEVMExtraArgsV2(data)).toThrow(expectedError)
    })
  })

  describe('EVM_EXTRA_ARGS_V2_TAG constant validation', () => {
    it('should have correct EVM_EXTRA_ARGS_V2_TAG value matching bytes4(keccak256("CCIP EVMExtraArgsV2"))', () => {
      const hash = keccak256(toBytes('CCIP EVMExtraArgsV2'))
      const tagSelector = parseInt(hash.slice(0, 10), 16) // Take first 4 bytes (8 hex chars + 0x prefix)

      expect(EVM_EXTRA_ARGS_V2_TAG).toBe(tagSelector)
    })
  })
})
