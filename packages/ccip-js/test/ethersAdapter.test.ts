import { jest, expect, it, describe, afterEach, beforeAll } from '@jest/globals'
import { ethers } from 'ethers'
import * as CCIP from '../src/api'
import { EthersAdapter, isEthersAdapter, isEthersProvider, isEthersSigner } from '../src/ethersAdapter'
import { forkClient, testClient } from './helpers/clients'
import { account, DEFAULT_ANVIL_PRIVATE_KEY } from './helpers/constants'

// Mock ethers.js provider and signer
const mockProvider = new ethers.JsonRpcProvider()
const mockSigner = new ethers.Wallet(DEFAULT_ANVIL_PRIVATE_KEY, mockProvider)
const mockEthersAdapter = new EthersAdapter(mockProvider, mockSigner)

describe('EthersAdapter', () => {
  describe('Type Guards', () => {
    it('should correctly identify ethers.js providers', () => {
      expect(isEthersProvider(mockProvider)).toBe(true)
      expect(isEthersProvider({})).toBe(false)
    })

    it('should correctly identify ethers.js signers', () => {
      expect(isEthersSigner(mockSigner)).toBe(true)
      expect(isEthersSigner({})).toBe(false)
    })

    it('should correctly identify EthersAdapter instances', () => {
      expect(isEthersAdapter(mockEthersAdapter)).toBe(true)
      expect(isEthersAdapter({})).toBe(false)
    })
  })

  describe('Static Constructor', () => {
    it('should create an instance from URL without private key', () => {
      const adapter = EthersAdapter.fromUrl('http://localhost:8545')
      expect(adapter).toBeInstanceOf(EthersAdapter)
      expect(adector['signer']).toBeUndefined()
    })

    it('should create an instance from URL with private key', () => {
      const adapter = EthersAdapter.fromUrl('http://localhost:8545', DEFAULT_ANVIL_PRIVATE_KEY)
      expect(adapter).toBeInstanceOf(EthersAdapter)
      expect(adapter['signer']).toBeDefined()
    })
  })

  describe('Integration with CCIP Client', () => {
    let ethersAdapter: EthersAdapter
    let ccipClient: ReturnType<typeof CCIP.createClient>

    beforeAll(() => {
      // Create a real ethers provider connected to the test client
      const provider = new ethers.JsonRpcProvider()
      const signer = new ethers.Wallet(DEFAULT_ANVIL_PRIVATE_KEY, provider)
      ethersAdapter = new EthersAdapter(provider, signer)
      
      // Create CCIP client with ethers adapter
      ccipClient = CCIP.createClient()
    })

    it('should get chain ID', async () => {
      // Mock the provider.getNetwork call
      const mockGetNetwork = jest.spyOn(mockProvider, 'getNetwork')
      mockGetNetwork.mockResolvedValueOnce({ chainId: 1, name: 'mainnet', ensAddress: undefined })

      const chainId = await ethersAdapter.getChainId()
      expect(chainId).toBe(1)
      mockGetNetwork.mockRestore()
    })

    it('should validate addresses', () => {
      const validAddress = '0x0000000000000000000000000000000000000001'
      const invalidAddress = '0xinvalid'
      
      expect(() => ethersAdapter.validateAddress(validAddress, 'test')).not.toThrow()
      expect(() => ethersAdapter.validateAddress(invalidAddress, 'test')).toThrow()
    })

    it('should get token admin registry', async () => {
      // Mock the readContract call
      const mockReadContract = jest.spyOn(ethersAdapter, 'readContract')
      const expectedAddress = '0x1234567890123456789012345678901234567890'
      mockReadContract.mockResolvedValueOnce(expectedAddress)

      const result = await ethersAdapter.getTokenAdminRegistry()
      expect(result).toBe(expectedAddress)
      mockReadContract.mockRestore()
    })

    it('should check if token is supported', async () => {
      const mockReadContract = jest.spyOn(ethersAdapter, 'readContract')
      mockReadContract.mockResolvedValueOnce(true)

      const isSupported = await ethersAdapter.isTokenSupported('0x1234...')
      expect(isSupported).toBe(true)
      mockReadContract.mockRestore()
    })

    it('should get token decimals', async () => {
      const mockReadContract = jest.spyOn(ethersAdapter, 'readContract')
      mockReadContract.mockResolvedValueOnce(18)

      const decimals = await ethersAdapter.getTokenDecimals('0x1234...')
      expect(decimals).toBe(18)
      mockReadContract.mockRestore()
    })

    it('should get token balance', async () => {
      const mockReadContract = jest.spyOn(ethersAdapter, 'readContract')
      mockReadContract.mockResolvedValueOnce(ethers.toBigInt('1000000000000000000')) // 1 token with 18 decimals

      const balance = await ethersAdapter.getTokenBalance('0xowner', '0xtoken')
      expect(balance).toBe(ethers.toBigInt('1000000000000000000'))
      mockReadContract.mockRestore()
    })

    it('should get token allowance', async () => {
      const mockReadContract = jest.spyOn(ethersAdapter, 'readContract')
      mockReadContract.mockResolvedValueOnce(ethers.toBigInt('500000000000000000')) // 0.5 token with 18 decimals

      const allowance = await ethersAdapter.getTokenAllowance(
        '0xowner',
        '0xspender',
        '0xtoken'
      )
      expect(allowance).toBe(ethers.toBigInt('500000000000000000'))
      mockReadContract.mockRestore()
    })
  })
})
