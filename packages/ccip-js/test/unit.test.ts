import { jest, expect, it, describe, afterEach } from '@jest/globals'
import * as CCIP from '../src/api'
import * as Viem from 'viem'
import * as viemActions from 'viem/actions'
import { forkClient } from './helpers/clients'

const ccipClient = CCIP.createClient()

const readContractMock = jest.spyOn(viemActions, 'readContract')
const writeContractMock = jest.spyOn(viemActions, 'writeContract')
const waitForTransactionReceiptMock = jest.spyOn(viemActions, 'waitForTransactionReceipt')
const getLogsMock = jest.spyOn(viemActions, 'getLogs')
const parseEventLogsMock = jest.spyOn(Viem, 'parseEventLogs')

const mockTxHash = '0xc55d92b1212dd24db843e1cbbcaebb1fffe3cd1751313e0fd02cf26bf72b359e'
const mockTxReceipt: Viem.TransactionReceipt = {
  blockHash: '0x565f99df4e32e15432f44c19b3d1d15447c41ca185a09aaf8d53356ce4086d8b',
  blockNumber: 36381676n,
  contractAddress: null,
  cumulativeGasUsed: 288318n,
  effectiveGasPrice: 25000000001n,
  from: '0x748cab9a6993a24ca6208160130b3f7b79098c6d',
  gasUsed: 288318n,
  logs: [
    {
      address: '0x0b9d5d9136855f6fec3c0993fee6e9ce8a297846',
      blockHash: '0x565f99df4e32e15432f44c19b3d1d15447c41ca185a09aaf8d53356ce4086d8b',
      blockNumber: 36381676n,
      data: '0x0000000000000000000000000000000000000000000000000070c7afd6bb1899',
      logIndex: 0,
      removed: false,
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000748cab9a6993a24ca6208160130b3f7b79098c6d',
        '0x000000000000000000000000a9946ba30daec98745755e4410d6e8e894edc53b',
      ],
      transactionHash: '0xc55d92b1212dd24db843e1cbbcaebb1fffe3cd1751313e0fd02cf26bf72b359e',
      transactionIndex: 0,
    },
    {
      address: '0x70f5c5c40b873ea597776da2c21929a8282a3b35',
      blockHash: '0x565f99df4e32e15432f44c19b3d1d15447c41ca185a09aaf8d53356ce4086d8b',
      blockNumber: 36381676n,
      data: '0x0000000000000000000000000000000000000000000000000000000000000000',
      logIndex: 1,
      removed: false,
      topics: [
        '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
        '0x000000000000000000000000748cab9a6993a24ca6208160130b3f7b79098c6d',
        '0x000000000000000000000000f694e193200268f9a4868e4aa017a0118c9a8177',
      ],
      transactionHash: '0xc55d92b1212dd24db843e1cbbcaebb1fffe3cd1751313e0fd02cf26bf72b359e',
      transactionIndex: 0,
    },
  ],
  logsBloom:
    '0x01000000000000000001000000000004000000000000800000000000000000000000000008000000002000000000000000000000000000000000080000200000000000020000020000000008000000000100100000000000000010000000000000000000060000000000004000000802040000000000000000001050000000000002000000000000200000000000000400000000000080000800040000000000020000000000200600000000000000000080000000000000008100000000008100000002000000000001000000000000000000000000000800000000000024000010000000000000000000000000000004000200000000000000000000000000',
  status: 'success',
  to: '0xf694e193200268f9a4868e4aa017a0118c9a8177',
  transactionHash: '0xc55d92b1212dd24db843e1cbbcaebb1fffe3cd1751313e0fd02cf26bf72b359e',
  transactionIndex: 0,
  type: 'eip1559',
}
const mockLog = [
  {
    address: '0x0aec1ac9f6d0c21332d7a66ddf1fbcb32cf3b0b3' as Viem.Address,
    blockHash: '0xd8a5943213a52e0e453c0c7ffe921f3c4c84b15ee02915e59ada0d058f33ab2a' as Viem.Hash,
    args: {
      message: {
        data: '0x0000000000000000000000000000000000000000000000000000000000000000',
        feeToken: '0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846',
        feeTokenAmount: 317861394337043364n,
        gasLimit: 0n,
        messageId: '0xde438245515b78c2294263a821316b5d5b49af90464dafcedaf13901050bf062',
        nonce: 7n,
        receiver: '0x748Cab9A6993A24CA6208160130b3f7b79098c6d',
        sender: '0x748Cab9A6993A24CA6208160130b3f7b79098c6d',
        sequenceNumber: 1265n,
        sourceChainSelector: 14767482510784806043n,
      },
    },
    blockNumber: 36381795n,
    data: '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000ccf0a31a221f3c9b000000000000000000000000748cab9a6993a24ca6208160130b3f7b79098c6d000000000000000000000000748cab9a6993a24ca6208160130b3f7b79098c6d00000000000000000000000000000000000000000000000000000000000004f10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000070000000000000000000000000b9d5d9136855f6fec3c0993fee6e9ce8a29784600000000000000000000000000000000000000000000000004694541094513a400000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000240de438245515b78c2294263a821316b5d5b49af90464dafcedaf13901050bf06200000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000070f5c5c40b873ea597776da2c21929a8282a3b35000000000000000000000000000000000000000000000000000000003b9aca000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000015f9000000000000000000000000000000000000000000000000000000000000000200000000000000000000000008e35eb0dfb39ec5f84254c3f863986a913171e0b0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000a98fa8a008371b9408195e52734b1768c0d1cb5c0000000000000000000000000000000000000000000000000000000000000000',
    eventName: 'CCIPMessageSent',
    logIndex: 8,
    removed: false,
    topics: ['0xd0c3c799bf9e2639de44391e7f524d229b2b55f5b1ea94b2bf7da42f7243dddd' as Viem.Address],
    transactionHash: '0xb96c7d676f69e904fe283312386f375352e407446b7b0c4b8452d09a13cc6b10',
    transactionIndex: 0,
  },
]
const mockLogWOMessageId = [
  {
    address: '0x0aec1ac9f6d0c21332d7a66ddf1fbcb32cf3b0b3' as Viem.Address,
    blockHash: '0xd8a5943213a52e0e453c0c7ffe921f3c4c84b15ee02915e59ada0d058f33ab2a' as Viem.Hash,
    args: {},
    blockNumber: 36381795n,
    data: '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000ccf0a31a221f3c9b000000000000000000000000748cab9a6993a24ca6208160130b3f7b79098c6d000000000000000000000000748cab9a6993a24ca6208160130b3f7b79098c6d00000000000000000000000000000000000000000000000000000000000004f10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000070000000000000000000000000b9d5d9136855f6fec3c0993fee6e9ce8a29784600000000000000000000000000000000000000000000000004694541094513a400000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000240de438245515b78c2294263a821316b5d5b49af90464dafcedaf13901050bf06200000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000070f5c5c40b873ea597776da2c21929a8282a3b35000000000000000000000000000000000000000000000000000000003b9aca000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000015f9000000000000000000000000000000000000000000000000000000000000000200000000000000000000000008e35eb0dfb39ec5f84254c3f863986a913171e0b0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000a98fa8a008371b9408195e52734b1768c0d1cb5c0000000000000000000000000000000000000000000000000000000000000000',
    eventName: 'CCIPMessageSent',
    logIndex: 8,
    removed: false,
    topics: ['0xd0c3c799bf9e2639de44391e7f524d229b2b55f5b1ea94b2bf7da42f7243dddd' as Viem.Address],
    transactionHash: '0xb96c7d676f69e904fe283312386f375352e407446b7b0c4b8452d09a13cc6b10',
    transactionIndex: 0,
  },
]

describe('Unit', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  describe('approve router', () => {
    it('should reject with invalid router address', async () => {
      await expect(
        async () =>
          await ccipClient.approveRouter({
            client: forkClient,
            routerAddress: Viem.zeroAddress,
            amount: 0n,
            tokenAddress: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
          }),
      ).rejects.toThrow('Router address 0x0000000000000000000000000000000000000000 is not valid')
    })

    it('should reject with invalid amount', async () => {
      await expect(
        async () =>
          await ccipClient.approveRouter({
            client: forkClient,
            routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
            amount: -1n,
            tokenAddress: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
          }),
      ).rejects.toThrow('Invalid approve amount. Amount can not be negative')
    })

    it('should reject with invalid token address', async () => {
      await expect(
        async () =>
          await ccipClient.approveRouter({
            client: forkClient,
            routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
            amount: 0n,
            tokenAddress: Viem.zeroAddress,
          }),
      ).rejects.toThrow('Token address 0x0000000000000000000000000000000000000000 is not valid')
    })

    // it('should reject with invalid account', async () => {
    //   await expect(
    //     async () =>
    //       await ccipClient.approveRouter({
    //         client: walletClientWOAccount,
    //         routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
    //         amount: 0n,
    //         tokenAddress: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
    //         waitForReceipt: true,
    //       }),
    //   ).rejects.toThrow('Account address is not valid')
    // })

    it('should succeed with valid input', async () => {
      writeContractMock.mockResolvedValueOnce(mockTxHash)
      waitForTransactionReceiptMock.mockResolvedValue(mockTxReceipt)

      const approve = await ccipClient.approveRouter({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        amount: 0n,
        tokenAddress: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
        waitForReceipt: true,
      })

      expect(approve).toStrictEqual({ txHash: mockTxHash, txReceipt: mockTxReceipt })
    })

    it('should get txReceipt if approve invoked with waitForReceipt', async () => {
      writeContractMock.mockResolvedValueOnce(mockTxHash)
      waitForTransactionReceiptMock.mockResolvedValue(mockTxReceipt)

      const { txReceipt } = await ccipClient.approveRouter({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        amount: 0n,
        tokenAddress: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
        waitForReceipt: true,
      })

      expect(txReceipt).toStrictEqual(mockTxReceipt)
    })

    it('should not get txReceipt if approve invoked without waitForReceipt', async () => {
      writeContractMock.mockResolvedValueOnce(mockTxHash)
      waitForTransactionReceiptMock.mockResolvedValueOnce(mockTxReceipt)

      const { txReceipt } = await ccipClient.approveRouter({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        amount: 0n,
        tokenAddress: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
      })

      expect(txReceipt).toBe(undefined)
    })
  })

  describe('getAllowance', () => {
    it('should reject with invalid router address', async () => {
      await expect(
        async () =>
          await ccipClient.getAllowance({
            client: forkClient,
            routerAddress: Viem.zeroAddress,
            tokenAddress: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
            account: '0x0000000000000000000000000000000000000001',
          }),
      ).rejects.toThrow('Router address 0x0000000000000000000000000000000000000000 is not valid')
    })

    it('should reject with invalid account address', async () => {
      await expect(
        async () =>
          await ccipClient.getAllowance({
            client: forkClient,
            routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
            tokenAddress: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
            account: Viem.zeroAddress,
          }),
      ).rejects.toThrow('Account address 0x0000000000000000000000000000000000000000 is not valid')
    })

    it('should reject with invalid token address', async () => {
      await expect(
        async () =>
          await ccipClient.getAllowance({
            client: forkClient,
            routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
            tokenAddress: Viem.zeroAddress,
            account: '0x0000000000000000000000000000000000000001',
          }),
      ).rejects.toThrow('Token address 0x0000000000000000000000000000000000000000 is not valid')
    })

    it('should return the allowance for a given account', async () => {
      readContractMock.mockResolvedValueOnce(1000000000000000000n)
      const allowance = await ccipClient.getAllowance({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        tokenAddress: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
        account: '0x0000000000000000000000000000000000000001',
      })
      expect(allowance).toBe(1000000000000000000n)
    })
  })

  describe('getOnRampAddress', () => {
    it('should reject if onRamp is not valid', async () => {
      await expect(
        async () =>
          await ccipClient.getOnRampAddress({
            client: forkClient,
            routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
            destinationChainSelector: '0',
          }),
      ).rejects.toThrow('OnRamp address is not valid. Execution can not be continued')
    })
    it('should reject if router address is not valid', async () => {
      await expect(
        async () =>
          await ccipClient.getOnRampAddress({
            client: forkClient,
            routerAddress: Viem.zeroAddress,
            destinationChainSelector: '0',
          }),
      ).rejects.toThrow('Router address 0x0000000000000000000000000000000000000000 is not valid')
    })
    it('should return the address of the onRamp contract', async () => {
      readContractMock.mockResolvedValueOnce('0x8F35B097022135E0F46831f798a240Cc8c4b0B01')
      const onRampAddress = await ccipClient.getOnRampAddress({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        destinationChainSelector: '14767482510784806043',
      })
      expect(onRampAddress).toBe('0x8F35B097022135E0F46831f798a240Cc8c4b0B01')
    })
  })

  describe('getSupportedFeeTokens', () => {
    it('should reject with invalid router address', async () => {
      await expect(
        async () =>
          await ccipClient.getSupportedFeeTokens({
            client: forkClient,
            routerAddress: Viem.zeroAddress,
            destinationChainSelector: '14767482510784806043',
          }),
      ).rejects.toThrow('Router address 0x0000000000000000000000000000000000000000 is not valid')
    })

    it('should reject if onRamp is not valid', async () => {
      readContractMock.mockResolvedValueOnce(Viem.zeroAddress)
      await expect(
        async () =>
          await ccipClient.getSupportedFeeTokens({
            client: forkClient,
            routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
            destinationChainSelector: '0',
          }),
      ).rejects.toThrow('OnRamp address is not valid. Execution can not be continued')
    })

    it('should return supported fee tokens for valid chains', async () => {
      readContractMock.mockResolvedValueOnce('0x8F35B097022135E0F46831f798a240Cc8c4b0B01')
      readContractMock.mockResolvedValueOnce({ feeQuoter: '0x9EF7D57a4ea30b9e37794E55b0C75F2A70275dCc' })
      readContractMock.mockResolvedValueOnce([
        '0x779877A7B0D9E8603169DdbD7836e478b4624789',
        '0x097D90c9d3E0B50Ca60e1ae45F6A81010f9FB534',
        '0xc4bF5CbDaBE595361438F8c6a187bDc330539c60',
      ])

      const supportedFeeTokens = await ccipClient.getSupportedFeeTokens({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        destinationChainSelector: '14767482510784806043',
      })

      expect(supportedFeeTokens).toStrictEqual([
        '0x779877A7B0D9E8603169DdbD7836e478b4624789',
        '0x097D90c9d3E0B50Ca60e1ae45F6A81010f9FB534',
        '0xc4bF5CbDaBE595361438F8c6a187bDc330539c60',
      ])
    })
  })
  describe('getLaneRateRefillLimits', () => {
    it('should reject with invalid router address', async () => {
      await expect(
        async () =>
          await ccipClient.getLaneRateRefillLimits({
            client: forkClient,
            routerAddress: Viem.zeroAddress,
            destinationChainSelector: '14767482510784806043',
          }),
      ).rejects.toThrow('Router address 0x0000000000000000000000000000000000000000 is not valid')
    })

    it('should reject if onRamp is not valid', async () => {
      await expect(
        async () =>
          await ccipClient.getLaneRateRefillLimits({
            client: forkClient,
            routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
            destinationChainSelector: '0',
          }),
      ).rejects.toThrow('OnRamp address is not valid. Execution can not be continued')
    })

    it('should return lane rate refill limits for valid chains', async () => {
      readContractMock.mockResolvedValueOnce('0x8F35B097022135E0F46831f798a240Cc8c4b0B01')
      readContractMock.mockResolvedValueOnce({
        tokens: 0n,
        lastUpdated: 1729679256,
        isEnabled: false,
        capacity: 0n,
        rate: 0n,
      })

      const laneRateRefillLimits = await ccipClient.getLaneRateRefillLimits({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        destinationChainSelector: '14767482510784806043',
      })

      expect(laneRateRefillLimits).toStrictEqual({
        tokens: 0n,
        lastUpdated: 1729679256,
        isEnabled: false,
        capacity: 0n,
        rate: 0n,
      })
    })
  })

  describe('getTokenRateLimitByLane', () => {
    it('should reject with invalid router address', async () => {
      await expect(
        async () =>
          await ccipClient.getTokenRateLimitByLane({
            client: forkClient,
            routerAddress: Viem.zeroAddress,
            destinationChainSelector: '14767482510784806043',
            supportedTokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
          }),
      ).rejects.toThrow('Router address 0x0000000000000000000000000000000000000000 is not valid')
    })

    it('should reject if token address is not valid', async () => {
      await expect(
        async () =>
          await ccipClient.getTokenRateLimitByLane({
            client: forkClient,
            routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
            destinationChainSelector: '14767482510784806043',
            supportedTokenAddress: Viem.zeroAddress,
          }),
      ).rejects.toThrow(
        'Token address 0x0000000000000000000000000000000000000000 is not valid. Execution can not be continued',
      )
    })

    it('should reject if onRamp is not valid', async () => {
      await expect(async () =>
        ccipClient.getTokenRateLimitByLane({
          client: forkClient,
          routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
          destinationChainSelector: '0',
          supportedTokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        }),
      ).rejects.toThrow('OnRamp address is not valid. Execution can not be continued')
    })

    it('should reject if laneTokenTransferPool is not set or zero-address', async () => {
      readContractMock.mockResolvedValueOnce('0x8F35B097022135E0F46831f798a240Cc8c4b0B01')
      readContractMock.mockResolvedValueOnce(Viem.zeroAddress)
      await expect(async () =>
        ccipClient.getTokenRateLimitByLane({
          client: forkClient,
          routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
          destinationChainSelector: '0',
          supportedTokenAddress: '0xc4bF5CbDaBE595361438F8c6a187bDc330539c60',
        }),
      ).rejects.toThrow(
        'Token pool for 0xc4bF5CbDaBE595361438F8c6a187bDc330539c60 is missing. Execution can not be continued',
      )
    })

    it('should return token rate limit by lane for a supported token', async () => {
      readContractMock.mockResolvedValueOnce('0x8F35B097022135E0F46831f798a240Cc8c4b0B01')
      readContractMock.mockResolvedValueOnce('0x12492154714fBD28F28219f6fc4315d19de1025B')
      readContractMock.mockResolvedValueOnce({
        tokens: 0n,
        lastUpdated: 1729679256,
        isEnabled: false,
        capacity: 0n,
        rate: 0n,
      })

      const tokenRateLimitByLane = await ccipClient.getTokenRateLimitByLane({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        destinationChainSelector: '14767482510784806043',
        supportedTokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
      })

      expect(tokenRateLimitByLane).toStrictEqual({
        tokens: 0n,
        lastUpdated: 1729679256,
        isEnabled: false,
        capacity: 0n,
        rate: 0n,
      })
    })
  })

  describe('getFee', () => {
    it('should reject with invalid router address', async () => {
      await expect(async () =>
        ccipClient.getFee({
          client: forkClient,
          routerAddress: Viem.zeroAddress,
          destinationChainSelector: '14767482510784806043',
          destinationAccount: Viem.zeroAddress,
          amount: 1000000000000000000n,
          tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        }),
      ).rejects.toThrow('Router address 0x0000000000000000000000000000000000000000 is not valid')
    })

    it('should reject if token address is not valid', async () => {
      await expect(async () =>
        ccipClient.getFee({
          client: forkClient,
          routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
          destinationChainSelector: '14767482510784806043',
          destinationAccount: Viem.zeroAddress,
          amount: 1000000000000000000n,
          tokenAddress: Viem.zeroAddress,
        }),
      ).rejects.toThrow('Token address 0x0000000000000000000000000000000000000000 is not valid')
    })

    it('should reject if amount is not valid', async () => {
      await expect(async () =>
        ccipClient.getFee({
          client: forkClient,
          routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
          destinationChainSelector: '14767482510784806043',
          destinationAccount: Viem.zeroAddress,
          amount: -1000000000000000000n,
          tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        }),
      ).rejects.toThrow('Invalid amount. Amount can not be negative')
    })

    it('should reject if destination account address is not valid', async () => {
      await expect(async () =>
        ccipClient.getFee({
          client: forkClient,
          routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
          destinationChainSelector: '14767482510784806043',
          destinationAccount: 'address' as Viem.Address,
          amount: 1000000000000000000n,
          tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        }),
      ).rejects.toThrow('address is not a valid destionation account address')
    })

    it('should reject if fee token is not valid', async () => {
      await expect(async () =>
        ccipClient.getFee({
          client: forkClient,
          routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
          destinationChainSelector: '14767482510784806043',
          destinationAccount: Viem.zeroAddress,
          amount: 1000000000000000000n,
          tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
          feeTokenAddress: 'address' as Viem.Address,
        }),
      ).rejects.toThrow('PARAMETER INPUT ERROR: address is not a valid fee token address')
    })

    it('should return the correct fee for a transfer', async () => {
      readContractMock.mockResolvedValueOnce(300000000000000n)
      const fee = await ccipClient.getFee({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        destinationChainSelector: '14767482510784806043',
        destinationAccount: Viem.zeroAddress,
        amount: 1000000000000000000n,
        tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
      })

      expect(fee).toEqual(300000000000000n)
    })
  })

  describe('getTransactionReceipt', () => {
    it('should reject if hash is invalid', async () => {
      await expect(async () =>
        ccipClient.getTransactionReceipt({
          client: forkClient,
          hash: 'hash' as Viem.Hash,
        }),
      ).rejects.toThrow('hash is not a valid transaction hash')
    })

    it('should return the status of a transfer', async () => {
      waitForTransactionReceiptMock.mockResolvedValueOnce(mockTxReceipt)
      const transferStatus = await ccipClient.getTransactionReceipt({
        client: forkClient,
        hash: '0xc94dff6318a839d806aaff3bbf32cfe5898319ad4af25ecfbc24fa09b0ef0d4d',
      })

      expect(transferStatus.blockHash).toBe('0xeb3e2e65c939bd65d6983704a21dda6ae7157079b1e6637ff11bb97228accdc2')
    })
  })

  describe('getTransferStatus', () => {
    it('should reject with invalid message id', async () => {
      await expect(async () =>
        ccipClient.getTransferStatus({
          client: forkClient,
          messageId: 'hash' as Viem.Hash,
          destinationRouterAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
          sourceChainSelector: '14767482510784806043',
        }),
      ).rejects.toThrow('hash is not a valid message ID')
    })

    it('should reject with invalid destination router address', async () => {
      await expect(async () =>
        ccipClient.getTransferStatus({
          client: forkClient,
          messageId: '0xc94dff6318a839d806aaff3bbf32cfe5898319ad4af25ecfbc24fa09b0ef0d4d',
          destinationRouterAddress: Viem.zeroAddress,
          sourceChainSelector: '14767482510784806043',
        }),
      ).rejects.toThrow(`Destination router address ${Viem.zeroAddress} is not valid`)
    })

    it('should reject with invalid source chain selector', async () => {
      await expect(async () =>
        ccipClient.getTransferStatus({
          client: forkClient,
          messageId: '0xc94dff6318a839d806aaff3bbf32cfe5898319ad4af25ecfbc24fa09b0ef0d4d',
          destinationRouterAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
          sourceChainSelector: '',
        }),
      ).rejects.toThrow('Source chain selector is missing or invalid')
    })

    it('should reject if no matching off-ramps found', async () => {
      readContractMock.mockResolvedValueOnce([{ offRamp: Viem.zeroAddress, sourceChainSelector: 69n }])
      await expect(async () =>
        ccipClient.getTransferStatus({
          client: forkClient,
          messageId: '0xc94dff6318a839d806aaff3bbf32cfe5898319ad4af25ecfbc24fa09b0ef0d4d',
          destinationRouterAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
          sourceChainSelector: '1',
        }),
      ).rejects.toThrow('No matching off-ramp found')
    })

    it('should return null if the status of a transfer is undefined', async () => {
      readContractMock.mockResolvedValueOnce([
        {
          sourceChainSelector: 9284632837123596123n,
          offRamp: '0x46b639a3C1a4CBfD326b94a2dB7415c27157282f',
        },
        {
          sourceChainSelector: 14767482510784806043n,
          offRamp: '0x000b26f604eAadC3D874a4404bde6D64a97d95ca',
        },
        {
          sourceChainSelector: 2027362563942762617n,
          offRamp: '0x4e897e5cF3aC307F0541B2151A88bCD781c153a3',
        },
      ])
      const transferStatus = await ccipClient.getTransferStatus({
        client: forkClient,
        messageId: Viem.zeroHash,
        destinationRouterAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        sourceChainSelector: '14767482510784806043',
      })

      expect(transferStatus).toBe(null)
    })

    it('should return the status of a transfer', async () => {
      readContractMock.mockResolvedValueOnce([
        {
          sourceChainSelector: 9284632837123596123n,
          offRamp: '0x46b639a3C1a4CBfD326b94a2dB7415c27157282f',
        },
        {
          sourceChainSelector: 14767482510784806043n,
          offRamp: '0x000b26f604eAadC3D874a4404bde6D64a97d95ca',
        },
        {
          sourceChainSelector: 2027362563942762617n,
          offRamp: '0x4e897e5cF3aC307F0541B2151A88bCD781c153a3',
        },
      ])
      getLogsMock.mockResolvedValueOnce([
        {
          address: '0x3ab3a3d35cac95ffcfccc127ef01ea8d87b0a64e',
          args: {
            sequenceNumber: 1266n,
            messageId: '0xa59eff480402ef673b5edf4bb52ff7c2f18426dc59cf3295b525f14b0779186a',
            state: 2,
            returnData: '0x',
          },
          blockHash: '0xf160e33291d0b85251fbb52cd395cc374a096ca1f0724a8e7731aab33ab8b9c2',
          blockNumber: 16962416n,
          data: '0x0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000',
          logIndex: 33,
          transactionHash: '0x29e10b1e1fa029d378f573c3c11d979e139894482a5e1835970d2ec57a403f58',
          transactionIndex: 14,
          removed: false,
          eventName: 'ExecutionStateChanged',
          topics: [],
        },
      ])

      const transferStatus = await ccipClient.getTransferStatus({
        client: forkClient,
        messageId: '0xc94dff6318a839d806aaff3bbf32cfe5898319ad4af25ecfbc24fa09b0ef0d4d',
        destinationRouterAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        sourceChainSelector: '14767482510784806043',
      })

      expect(transferStatus).toBe(2)
    })
  })

  describe('getTokenAdminRegistry', () => {
    it('should reject with invalid router address', async () => {
      await expect(
        async () =>
          await ccipClient.getTokenAdminRegistry({
            client: forkClient,
            routerAddress: Viem.zeroAddress,
            destinationChainSelector: '14767482510784806043',
            tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
          }),
      ).rejects.toThrow('Router address 0x0000000000000000000000000000000000000000 is not valid')
    })
    it('should reject with invalid token address', async () => {
      await expect(
        async () =>
          await ccipClient.getTokenAdminRegistry({
            client: forkClient,
            routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
            destinationChainSelector: '14767482510784806043',
            tokenAddress: Viem.zeroAddress,
          }),
      ).rejects.toThrow('Token address 0x0000000000000000000000000000000000000000 is not valid')
    })
    it('should reject if token admin registry address is not valid', async () => {
      readContractMock.mockResolvedValueOnce('0x12492154714fBD28F28219f6fc4315d19de1025B')
      readContractMock.mockResolvedValueOnce({
        linkToken: '0x',
        chainSelector: 0n,
        destChainSelector: 0n,
        defaultTxGasLimit: 0n,
        maxNopFeesJuels: 0n,
        prevOnRamp: '0x',
        rmnProxy: '0x',
        tokenAdminRegistry: '0x',
      })
      await expect(
        async () =>
          await ccipClient.getTokenAdminRegistry({
            client: forkClient,
            routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
            destinationChainSelector: '14767482510784806043',
            tokenAddress: '0x1525C31ebf98c8b0C90c59e04f7d04F421c1b746',
          }),
      ).rejects.toThrow('Token admin registry address is not valid. Execution can not be continued')
    })
  })

  describe('isTokenSupported', () => {
    it('should return true if token is supported', async () => {
      readContractMock.mockResolvedValueOnce('0x12492154714fBD28F28219f6fc4315d19de1025B')
      readContractMock.mockResolvedValueOnce({
        linkToken: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
        chainSelector: 16015286601757825753n,
        destChainSelector: 14767482510784806043n,
        defaultTxGasLimit: 200000n,
        maxNopFeesJuels: 100000000000000000000000000n,
        prevOnRamp: '0x0477cA0a35eE05D3f9f424d88bC0977ceCf339D4',
        rmnProxy: '0xba3f6251de62dED61Ff98590cB2fDf6871FbB991',
        tokenAdminRegistry: '0x95F29FEE11c5C55d26cCcf1DB6772DE953B37B82',
      })
      readContractMock.mockResolvedValueOnce('0xF081aCC599dFD65cdFD43934d2D8e2C7ad0277aE')
      readContractMock.mockResolvedValueOnce(true)

      const isTokenSupported = await ccipClient.isTokenSupported({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        destinationChainSelector: '14767482510784806043',
        tokenAddress: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
      })

      expect(isTokenSupported).toBe(true)
    })

    it('should return false if token is not supported on the destination chain', async () => {
      readContractMock.mockResolvedValueOnce('0x12492154714fBD28F28219f6fc4315d19de1025B')
      readContractMock.mockResolvedValueOnce({
        linkToken: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
        chainSelector: 16015286601757825753n,
        destChainSelector: 14767482510784806043n,
        defaultTxGasLimit: 200000n,
        maxNopFeesJuels: 100000000000000000000000000n,
        prevOnRamp: '0x0477cA0a35eE05D3f9f424d88bC0977ceCf339D4',
        rmnProxy: '0xba3f6251de62dED61Ff98590cB2fDf6871FbB991',
        tokenAdminRegistry: '0x95F29FEE11c5C55d26cCcf1DB6772DE953B37B82',
      })
      readContractMock.mockResolvedValueOnce('0xF081aCC599dFD65cdFD43934d2D8e2C7ad0277aE')
      readContractMock.mockResolvedValueOnce(false)

      const isTokenSupported = await ccipClient.isTokenSupported({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        destinationChainSelector: '14767482510784806043',
        tokenAddress: '0x1525C31ebf98c8b0C90c59e04f7d04F421c1b746',
      })

      expect(isTokenSupported).toBe(false)
    })

    it('should return false if there is no pool for the token', async () => {
      readContractMock.mockResolvedValueOnce('0x12492154714fBD28F28219f6fc4315d19de1025B')
      readContractMock.mockResolvedValueOnce({
        linkToken: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
        chainSelector: 16015286601757825753n,
        destChainSelector: 14767482510784806043n,
        defaultTxGasLimit: 200000n,
        maxNopFeesJuels: 100000000000000000000000000n,
        prevOnRamp: '0x0477cA0a35eE05D3f9f424d88bC0977ceCf339D4',
        rmnProxy: '0xba3f6251de62dED61Ff98590cB2fDf6871FbB991',
        tokenAdminRegistry: '0x95F29FEE11c5C55d26cCcf1DB6772DE953B37B82',
      })
      readContractMock.mockResolvedValueOnce('0x')

      const isTokenSupported = await ccipClient.isTokenSupported({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        destinationChainSelector: '1111111111111',
        tokenAddress: '0x1525C31ebf98c8b0C90c59e04f7d04F421c1b746',
      })

      expect(isTokenSupported).toBe(false)
    })
  })

  describe('transferTokens', () => {
    it('should reject with invalid router address', async () => {
      await expect(async () =>
        ccipClient.transferTokens({
          client: forkClient,
          routerAddress: Viem.zeroAddress,
          destinationChainSelector: '14767482510784806043',
          destinationAccount: Viem.zeroAddress,
          amount: 1000000000000000000n,
          tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        }),
      ).rejects.toThrow('Router address 0x0000000000000000000000000000000000000000 is not valid')
    })

    it('should reject if token address is not valid', async () => {
      await expect(async () =>
        ccipClient.transferTokens({
          client: forkClient,
          routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
          destinationChainSelector: '14767482510784806043',
          destinationAccount: Viem.zeroAddress,
          amount: 1000000000000000000n,
          tokenAddress: Viem.zeroAddress,
        }),
      ).rejects.toThrow('Token address 0x0000000000000000000000000000000000000000 is not valid')
    })

    it('should reject if amount is not valid', async () => {
      await expect(async () =>
        ccipClient.transferTokens({
          client: forkClient,
          routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
          destinationChainSelector: '14767482510784806043',
          destinationAccount: Viem.zeroAddress,
          amount: 0n,
          tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        }),
      ).rejects.toThrow('Invalid amount. Amount must be greater than 0')
    })

    it('should reject if destination account address is not valid', async () => {
      await expect(async () =>
        ccipClient.transferTokens({
          client: forkClient,
          routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
          destinationChainSelector: '14767482510784806043',
          destinationAccount: 'address' as Viem.Address,
          amount: 1000000000000000000n,
          tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        }),
      ).rejects.toThrow('address is not a valid destionation account address')
    })

    it('should reject if fee token is not valid', async () => {
      await expect(
        async () =>
          await ccipClient.transferTokens({
            client: forkClient,
            routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
            destinationChainSelector: '14767482510784806043',
            destinationAccount: Viem.zeroAddress,
            amount: 1000000000000000000n,
            tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
            feeTokenAddress: 'address' as Viem.Address,
          }),
      ).rejects.toThrow('PARAMETER INPUT ERROR: address is not a valid fee token address')
    })

    it('should successfully transfer tokens with minimal input', async () => {
      readContractMock.mockResolvedValueOnce(300000000000000n)
      writeContractMock.mockResolvedValueOnce(mockTxHash)
      waitForTransactionReceiptMock.mockResolvedValueOnce(mockTxReceipt)
      parseEventLogsMock.mockReturnValue(mockLog as never)

      const transfer = await ccipClient.transferTokens({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        destinationChainSelector: '14767482510784806043',
        destinationAccount: Viem.zeroAddress,
        tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        amount: 1000000000000000000n,
      })
      expect(transfer.txHash).toEqual('0xc55d92b1212dd24db843e1cbbcaebb1fffe3cd1751313e0fd02cf26bf72b359e')
      expect(transfer.messageId).toEqual('0xde438245515b78c2294263a821316b5d5b49af90464dafcedaf13901050bf062')
      expect(transfer.txReceipt.blockHash).toEqual('0x565f99df4e32e15432f44c19b3d1d15447c41ca185a09aaf8d53356ce4086d8b')
    })

    it('should successfully transfer tokens with all inputs', async () => {
      readContractMock.mockResolvedValueOnce(300000000000000n)
      writeContractMock.mockResolvedValueOnce(mockTxHash)
      waitForTransactionReceiptMock.mockResolvedValueOnce(mockTxReceipt)
      parseEventLogsMock.mockReturnValue(mockLog as never)

      const transfer = await ccipClient.transferTokens({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        destinationChainSelector: '14767482510784806043',
        destinationAccount: Viem.zeroAddress,
        tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        feeTokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        amount: 1000000000000000000n,
        data: Viem.encodeAbiParameters([{ type: 'string', name: 'data' }], ['Hello']),
      })
      expect(transfer.txHash).toEqual('0xc55d92b1212dd24db843e1cbbcaebb1fffe3cd1751313e0fd02cf26bf72b359e')
      expect(transfer.messageId).toEqual('0xde438245515b78c2294263a821316b5d5b49af90464dafcedaf13901050bf062')
      expect(transfer.txReceipt.blockHash).toEqual('0x565f99df4e32e15432f44c19b3d1d15447c41ca185a09aaf8d53356ce4086d8b')
    })

    it('should get txReceipt if transferTokens invoked', async () => {
      readContractMock.mockResolvedValueOnce(300000000000000n)
      writeContractMock.mockResolvedValueOnce(mockTxHash)
      waitForTransactionReceiptMock.mockResolvedValueOnce(mockTxReceipt)
      parseEventLogsMock.mockReturnValue(mockLog as never)

      const { txReceipt } = await ccipClient.transferTokens({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        destinationChainSelector: '14767482510784806043',
        destinationAccount: Viem.zeroAddress,
        tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        feeTokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        amount: 1000000000000000000n,
      })

      expect(txReceipt.blockHash).toEqual('0x565f99df4e32e15432f44c19b3d1d15447c41ca185a09aaf8d53356ce4086d8b')
    })

    it('should throw if messageId can not be retrieved', async () => {
      readContractMock.mockResolvedValueOnce(300000000000000n)
      writeContractMock.mockResolvedValueOnce(mockTxHash)
      waitForTransactionReceiptMock.mockResolvedValueOnce(mockTxReceipt)
      parseEventLogsMock.mockReturnValue(mockLogWOMessageId as never)

      await expect(async () =>
        ccipClient.transferTokens({
          client: forkClient,
          routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
          destinationChainSelector: '14767482510784806043',
          destinationAccount: Viem.zeroAddress,
          tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
          feeTokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
          amount: 1000000000000000000n,
          waitForTransactionReceiptParameters: {
            confirmations: 3,
          },
        }),
      ).rejects.toThrow('Message ID not found in the transaction logs')
    })

    it('should get messageId on transferTokens', async () => {
      readContractMock.mockResolvedValueOnce(300000000000000n)
      writeContractMock.mockResolvedValueOnce(mockTxHash)
      waitForTransactionReceiptMock.mockResolvedValueOnce(mockTxReceipt)
      parseEventLogsMock.mockReturnValue(mockLog as never)

      const { messageId } = await ccipClient.transferTokens({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        destinationChainSelector: '14767482510784806043',
        destinationAccount: Viem.zeroAddress,
        tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        feeTokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        amount: 1000000000000000000n,
      })
      expect(messageId).toEqual('0xde438245515b78c2294263a821316b5d5b49af90464dafcedaf13901050bf062')
    })
  })

  describe('sendCCIPMessage', () => {
    it('should reject with invalid router address', async () => {
      await expect(async () =>
        ccipClient.sendCCIPMessage({
          client: forkClient,
          routerAddress: Viem.zeroAddress,
          destinationChainSelector: '14767482510784806043',
          destinationAccount: Viem.zeroAddress,
          data: Viem.encodeAbiParameters([{ type: 'string', name: 'data' }], ['Hello']),
        }),
      ).rejects.toThrow('Router address 0x0000000000000000000000000000000000000000 is not valid')
    })

    it('should reject if destination account address is not valid', async () => {
      await expect(async () =>
        ccipClient.sendCCIPMessage({
          client: forkClient,
          routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
          destinationChainSelector: '14767482510784806043',
          destinationAccount: 'address' as Viem.Address,
          data: Viem.encodeAbiParameters([{ type: 'string', name: 'data' }], ['Hello']),
        }),
      ).rejects.toThrow('address is not a valid destionation account address')
    })

    it('should reject if fee token is not valid', async () => {
      await expect(
        async () =>
          await ccipClient.sendCCIPMessage({
            client: forkClient,
            routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
            destinationChainSelector: '14767482510784806043',
            destinationAccount: Viem.zeroAddress,
            data: Viem.encodeAbiParameters([{ type: 'string', name: 'data' }], ['Hello']),
            feeTokenAddress: 'address' as Viem.Address,
          }),
      ).rejects.toThrow('PARAMETER INPUT ERROR: address is not a valid fee token address')
    })

    // it('should reject with invalid account', async () => {
    //   await expect(
    //     async () =>
    //       await ccipClient.sendCCIPMessage({
    //         client: walletClientWOAccount,
    //         routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
    //         destinationChainSelector: '14767482510784806043',
    //         destinationAccount: Viem.zeroAddress,
    //         data: Viem.encodeAbiParameters([{ type: 'string', name: 'data' }], ['Hello']),
    //       }),
    //   ).rejects.toThrow('Account address is not valid')
    // })

    it('should successfully send message', async () => {
      readContractMock.mockResolvedValueOnce(300000000000000n)
      writeContractMock.mockResolvedValueOnce(mockTxHash)
      waitForTransactionReceiptMock.mockResolvedValueOnce(mockTxReceipt)
      parseEventLogsMock.mockReturnValue(mockLog as never)

      const transfer = await ccipClient.sendCCIPMessage({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        destinationChainSelector: '14767482510784806043',
        destinationAccount: Viem.zeroAddress,
        data: Viem.encodeAbiParameters([{ type: 'string', name: 'data' }], ['Hello']),
      })
      expect(transfer.txHash).toEqual('0xc55d92b1212dd24db843e1cbbcaebb1fffe3cd1751313e0fd02cf26bf72b359e')
      expect(transfer.messageId).toEqual('0xde438245515b78c2294263a821316b5d5b49af90464dafcedaf13901050bf062')
      expect(transfer.txReceipt.blockHash).toEqual('0x565f99df4e32e15432f44c19b3d1d15447c41ca185a09aaf8d53356ce4086d8b')
    })

    it('should get txReceipt if transferTokens invoked', async () => {
      readContractMock.mockResolvedValueOnce(300000000000000n)
      writeContractMock.mockResolvedValueOnce(mockTxHash)
      waitForTransactionReceiptMock.mockResolvedValueOnce(mockTxReceipt)
      parseEventLogsMock.mockReturnValue(mockLog as never)

      const { txReceipt } = await ccipClient.sendCCIPMessage({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        destinationChainSelector: '14767482510784806043',
        destinationAccount: Viem.zeroAddress,
        data: Viem.encodeAbiParameters([{ type: 'string', name: 'data' }], ['Hello']),
        feeTokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
      })

      expect(txReceipt.blockHash).toEqual('0x565f99df4e32e15432f44c19b3d1d15447c41ca185a09aaf8d53356ce4086d8b')
    })

    it('should throw if messageId can not be retrieved', async () => {
      readContractMock.mockResolvedValueOnce(300000000000000n)
      writeContractMock.mockResolvedValueOnce(mockTxHash)
      waitForTransactionReceiptMock.mockResolvedValueOnce(mockTxReceipt)
      parseEventLogsMock.mockReturnValue(mockLogWOMessageId as never)

      await expect(async () =>
        ccipClient.sendCCIPMessage({
          client: forkClient,
          routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
          destinationChainSelector: '14767482510784806043',
          destinationAccount: Viem.zeroAddress,
          feeTokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
          data: Viem.encodeAbiParameters([{ type: 'string', name: 'data' }], ['Hello']),
          waitForTransactionReceiptParameters: {
            confirmations: 3,
          },
        }),
      ).rejects.toThrow('Message ID not found in the transaction logs')
    })

    it('should get messageId on sendCCIPMessage', async () => {
      readContractMock.mockResolvedValueOnce(300000000000000n)
      writeContractMock.mockResolvedValueOnce(mockTxHash)
      waitForTransactionReceiptMock.mockResolvedValueOnce(mockTxReceipt)
      parseEventLogsMock.mockReturnValue(mockLog as never)

      const { messageId } = await ccipClient.sendCCIPMessage({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        destinationChainSelector: '14767482510784806043',
        destinationAccount: Viem.zeroAddress,
        feeTokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        data: Viem.encodeAbiParameters([{ type: 'string', name: 'data' }], ['Hello']),
      })
      expect(messageId).toEqual('0xde438245515b78c2294263a821316b5d5b49af90464dafcedaf13901050bf062')
    })

    it('should send message with a function as data', async () => {
      readContractMock.mockResolvedValueOnce(300000000000000n)
      writeContractMock.mockResolvedValueOnce(mockTxHash)
      waitForTransactionReceiptMock.mockResolvedValueOnce(mockTxReceipt)
      parseEventLogsMock.mockReturnValue(mockLog as never)

      const { messageId } = await ccipClient.sendCCIPMessage({
        client: forkClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        destinationChainSelector: '14767482510784806043',
        destinationAccount: Viem.zeroAddress,
        feeTokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        data: Viem.encodeFunctionData({
          abi: CCIP.IERC20ABI,
          functionName: 'transfer',
          args: [Viem.zeroAddress, Viem.parseEther('0.12')],
        }),
      })
      expect(messageId).toEqual('0xde438245515b78c2294263a821316b5d5b49af90464dafcedaf13901050bf062')
    })
  })
})
