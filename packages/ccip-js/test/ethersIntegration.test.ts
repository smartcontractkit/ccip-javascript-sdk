import { jest, expect, it, describe, afterEach, beforeAll } from '@jest/globals'
import * as CCIP from '../src/api'
import { ethers } from 'ethers'
import { testClient } from './helpers/clients'
import { account, ccipLog, ccipTxHash, ccipTxReceipt } from './helpers/constants'
import { getContracts } from './helpers/contracts'
import { mineBlock } from './helpers/utils'
import { EthersAdapter } from '../src/ethersAdapter'

// Mock ethers.js provider and signer
let ethersProvider: ethers.Provider
let ethersSigner: ethers.Signer
let ethersAdapter: EthersAdapter
let ccipClient: ReturnType<typeof CCIP.createClient>

// Mock ethers.js transaction response
const mockTxResponse: ethers.TransactionResponse = {
  hash: ccipTxHash,
  to: '0xRouterAddress',
  from: '0xSenderAddress',
  nonce: 1,
  gasLimit: 1000000n,
  gasPrice: 1000000000n,
  data: '0x',
  value: 0n,
  chainId: 1,
  signature: {
    r: '0x',
    s: '0x',
    v: 27n,
    yParity: 0,
    networkV: null,
  },
  accessList: [],
  blockHash: null,
  blockNumber: null,
  index: 0,
  type: 0,
  maxFeePerGas: null,
  maxPriorityFeePerGas: null,
  wait: async () => ({
    ...ccipTxReceipt,
    status: 1,
    cumulativeGasUsed: 100000n,
    effectiveGasPrice: 1000000000n,
    type: 0,
    to: '0xRouterAddress',
    from: '0xSenderAddress',
    contractAddress: null,
    logs: [],
    logsBloom: '0x',
    blockHash: '0x',
    blockNumber: 1,
    transactionHash: ccipTxHash,
    transactionIndex: 0,
    root: '0x',
  }),
}

describe('Ethers.js Integration', () => {
  beforeAll(() => {
    // Create ethers.js provider and signer
    ethersProvider = new ethers.JsonRpcProvider()
    ethersSigner = new ethers.Wallet(account.privateKey, ethersProvider)
    ethersAdapter = new EthersAdapter(ethersProvider, ethersSigner)
    ccipClient = CCIP.createClient()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('approveRouter', () => {
    it('should approve router with ethers.js client', async () => {
      const { router, bridgeToken } = await getContracts()
      const amount = ethers.parseEther('10')
      
      // Mock the contract calls
      const mockApprove = jest.fn().mockResolvedValue(mockTxResponse)
      jest.spyOn(ethers.Contract.prototype, 'approve').mockImplementation(() => ({
        wait: mockApprove,
      }))

      const result = await ccipClient.approveRouter({
        client: ethersSigner,
        routerAddress: router.address,
        tokenAddress: bridgeToken.address,
        amount,
        waitForReceipt: true,
      })

      expect(result.txHash).toBe(ccipTxHash)
      expect(mockApprove).toHaveBeenCalled()
    })
  })

  describe('getAllowance', () => {
    it('should get allowance with ethers.js client', async () => {
      const { router, bridgeToken } = await getContracts()
      const expectedAllowance = ethers.parseEther('10')
      
      // Mock the contract call
      jest.spyOn(ethers.Contract.prototype, 'allowance').mockResolvedValueOnce(expectedAllowance)

      const allowance = await ccipClient.getAllowance({
        client: ethersProvider,
        routerAddress: router.address,
        tokenAddress: bridgeToken.address,
        account: await ethersSigner.getAddress(),
      })

      expect(allowance).toEqual(expectedAllowance)
    })
  })

  describe('transferTokens', () => {
    it('should transfer tokens with ethers.js client', async () => {
      const { router, bridgeToken } = await getContracts()
      const amount = ethers.parseEther('1')
      const destinationAccount = '0x1234567890abcdef1234567890abcdef12345678'
      const destinationChainSelector = '1234'
      
      // Mock the contract calls
      const mockTransfer = jest.fn().mockResolvedValue(mockTxResponse)
      jest.spyOn(ethers.Contract.prototype, 'transfer').mockImplementation(() => ({
        wait: mockTransfer,
      }))

      const result = await ccipClient.transferTokens({
        client: ethersSigner,
        routerAddress: router.address,
        tokenAddress: bridgeToken.address,
        recipient: destinationAccount,
        amount,
        destinationChainSelector,
      })

      expect(result.txHash).toBe(ccipTxHash)
      expect(mockTransfer).toHaveBeenCalled()
    })
  })

  describe('getFee', () => {
    it('should get fee with ethers.js client', async () => {
      const { router, bridgeToken } = await getContracts()
      const expectedFee = ethers.parseEther('0.01')
      
      // Mock the contract call
      jest.spyOn(ethers.Contract.prototype, 'getFee').mockResolvedValueOnce(expectedFee)

      const fee = await ccipClient.getFee({
        client: ethersProvider,
        routerAddress: router.address,
        tokenAddress: bridgeToken.address,
        amount: ethers.parseEther('1'),
        destinationAccount: '0x1234567890abcdef1234567890abcdef12345678',
        destinationChainSelector: '1234',
      })

      expect(fee).toBeDefined()
      // Add more specific assertions based on the expected fee structure
    })
  })

  describe('getTokenAdminRegistry', () => {
    it('should get token admin registry with ethers.js client', async () => {
      const { router } = await getContracts()
      const expectedRegistry = '0x1234567890abcdef1234567890abcdef12345678'
      
      // Mock the contract call
      jest.spyOn(ethers.Contract.prototype, 'getTokenAdminRegistry').mockResolvedValueOnce(expectedRegistry)

      const registry = await ccipClient.getTokenAdminRegistry({
        client: ethersProvider,
        routerAddress: router.address,
      })

      expect(registry).toBe(expectedRegistry)
    })
  })

  describe('isTokenSupported', () => {
    it('should check if token is supported with ethers.js client', async () => {
      const { bridgeToken } = await getContracts()
      
      // Mock the contract call
      jest.spyOn(ethers.Contract.prototype, 'isTokenSupported').mockResolvedValueOnce(true)

      const isSupported = await ccipClient.isTokenSupported({
        client: ethersProvider,
        tokenAddress: bridgeToken.address,
      })

      expect(isSupported).toBe(true)
    })
  })
})
