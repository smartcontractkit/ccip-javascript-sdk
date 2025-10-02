import { address } from '@solana/kit'
import {
  encodeSVMExtraArgsV1,
  decodeSVMExtraArgsV1,
  SVM_EXTRA_ARGS_V1_TAG,
  SVM_EXTRA_ARGS_V1_MIN_LENGTH,
} from '../encoders/svmExtraArgsV1'
import { keccak256, toBytes } from 'viem'
import { fromHexBuffer } from '../utils/hex'

const MOCK_TOKEN_RECEIVER = address('11111111111111111111111111111112') // System Program ID (Devnet)
const MOCK_ACCOUNT_1 = address('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') // Token Program ID (Devnet)
const MOCK_ACCOUNT_2 = address('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL') // Associated Token Program ID (Devnet)
const MOCK_ACCOUNT_3 = address('So11111111111111111111111111111111111111112') // Wrapped SOL Token Mint (Devnet)
const MOCK_ACCOUNT_4 = address('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU') // USDC Token Mint (Devnet)
const MOCK_ACCOUNT_5 = address('DzcwGnG1kM1i6zE9vR4YmzjL48mF8Eik1gC9CkJTQ7K1') // USDT Token Mint (Devnet)

describe('SVM Extra Args V1', () => {
  const testCases = [
    {
      name: 'should encode with default values',
      input: {},
      expectedLength: SVM_EXTRA_ARGS_V1_MIN_LENGTH,
      expectedHex:
        '0x1f3b3aba00000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000',
    },
    {
      name: 'should encode minimal SVM extra args',
      input: {
        computeUnits: 0,
        accountIsWritableBitmap: 0n,
        allowOutOfOrderExecution: false,
        accounts: [],
      },
      expectedLength: SVM_EXTRA_ARGS_V1_MIN_LENGTH,
      expectedHex:
        '0x1f3b3aba00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    },
    {
      name: 'should handle token-only transfers (computeUnits = 0)',
      input: { computeUnits: 0, allowOutOfOrderExecution: true },
      expectedLength: SVM_EXTRA_ARGS_V1_MIN_LENGTH,
    },
    {
      name: 'should encode SVM extra args with all parameters',
      input: {
        computeUnits: 400000,
        accountIsWritableBitmap: 0b1010n,
        allowOutOfOrderExecution: true,
        tokenReceiver: MOCK_TOKEN_RECEIVER,
        accounts: [MOCK_ACCOUNT_1, MOCK_ACCOUNT_2],
      },
      expectedLength: SVM_EXTRA_ARGS_V1_MIN_LENGTH + 2 * 32, // 53 + 64 bytes for 2 accounts
    },
    {
      name: 'should encode with many accounts',
      input: {
        accounts: [MOCK_ACCOUNT_1, MOCK_ACCOUNT_2, MOCK_ACCOUNT_3, MOCK_ACCOUNT_4, MOCK_ACCOUNT_5],
      },
      expectedLength: SVM_EXTRA_ARGS_V1_MIN_LENGTH + 5 * 32, // 53 + 160 bytes for 5 accounts
    },
  ]

  describe('encodeSVMExtraArgsV1', () => {
    test.each(testCases)('$name', ({ input, expectedLength, expectedHex }) => {
      const encoded = encodeSVMExtraArgsV1(input)

      expect(encoded).toBeInstanceOf(Uint8Array)
      expect(encoded.length).toBe(expectedLength)

      const tag = new DataView(encoded.buffer, encoded.byteOffset, 4).getUint32(0, false)
      expect(tag).toBe(SVM_EXTRA_ARGS_V1_TAG)

      if (expectedHex) {
        expect(encoded).toEqual(fromHexBuffer(expectedHex))
      }
    })
  })

  describe('decodeSVMExtraArgsV1', () => {
    test.each(testCases)('should decode SVM extra args correctly with $name', ({ input }) => {
      const encoded = encodeSVMExtraArgsV1(input)
      const decoded = decodeSVMExtraArgsV1(encoded)

      expect(decoded.computeUnits).toBe(input.computeUnits ?? 0)
      expect(decoded.accountIsWritableBitmap).toBe(input.accountIsWritableBitmap ?? 0n)
      expect(decoded.allowOutOfOrderExecution).toBe(input.allowOutOfOrderExecution ?? true)
      expect(decoded.accounts?.length).toBe(input.accounts?.length ?? 0)
      expect(typeof decoded.tokenReceiver).toBe('string')

      if (input.tokenReceiver) {
        expect(decoded.tokenReceiver?.toString()).toBe(input.tokenReceiver.toString())
      }
      if (input.accounts) {
        input.accounts.forEach((account, index) => {
          expect(decoded.accounts?.[index].toString()).toBe(account.toString())
        })
      }
    })

    const errorTestCases = [
      {
        name: 'data too short',
        data: new Uint8Array(10),
        expectedError: `Invalid SVM Extra Args V1: data too short, expected at least ${SVM_EXTRA_ARGS_V1_MIN_LENGTH} bytes (4 bytes tag + 4 bytes computeUnits + 8 bytes bitmap + 1 byte bool + 32 bytes tokenReceiver + 4 bytes accounts length)`,
      },
      {
        name: 'invalid tag',
        data: (() => {
          const invalidData = new Uint8Array(SVM_EXTRA_ARGS_V1_MIN_LENGTH)
          invalidData[0] = 0x12
          invalidData[1] = 0x34
          invalidData[2] = 0x56
          invalidData[3] = 0x78
          return invalidData
        })(),
        expectedError: 'Invalid SVM Extra Args V1 tag: expected 0x1f3b3aba, got 0x12345678',
      },
    ]

    test.each(errorTestCases)('should throw error for $name', ({ data, expectedError }) => {
      expect(() => decodeSVMExtraArgsV1(data)).toThrow(expectedError)
    })
  })

  describe('serialization format validation', () => {
    it('should serialize fields in correct Borsh-like format', () => {
      const input = {
        computeUnits: 0x12345678,
        accountIsWritableBitmap: 0x123456789abcdef0n,
        allowOutOfOrderExecution: false,
        tokenReceiver: MOCK_TOKEN_RECEIVER,
        accounts: [MOCK_ACCOUNT_1],
      }

      const encoded = encodeSVMExtraArgsV1(input)

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

      // Verify allowOutOfOrderExecution (bool)
      expect(encoded[16]).toBe(0x00) // false

      // Verify accounts length (little-endian u32)
      expect(encoded[49]).toBe(0x01) // 1 account
      expect(encoded[50]).toBe(0x00)
      expect(encoded[51]).toBe(0x00)
      expect(encoded[52]).toBe(0x00)
    })
  })

  describe('SVM_EXTRA_ARGS_V1_TAG constant validation', () => {
    it('should have correct SVM_EXTRA_ARGS_V1_TAG value matching bytes4(keccak256("CCIP SVMExtraArgsV1"))', () => {
      const hash = keccak256(toBytes('CCIP SVMExtraArgsV1'))
      const tagSelector = parseInt(hash.slice(0, 10), 16) // Take first 4 bytes (8 hex chars + 0x prefix)

      expect(SVM_EXTRA_ARGS_V1_TAG).toBe(tagSelector)
    })
  })
})
