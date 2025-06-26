import { expect, it, afterAll, beforeAll, describe } from '@jest/globals'
import * as CCIP from '../src/api'
import * as Viem from 'viem'
import { parseEther } from 'viem'
import { sepolia, avalancheFuji, hederaTestnet } from 'viem/chains'

import { privateKeyToAccount } from 'viem/accounts'
import bridgeToken from '../artifacts-compile/BridgeToken.json'
import { DEFAULT_ANVIL_PRIVATE_KEY } from './helpers/constants'

const ccipClient = CCIP.createClient()
const bridgeTokenAbi = bridgeToken.contracts['src/contracts/BridgeToken.sol:BridgeToken'].bridgeTokenAbi

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const AVALANCHE_FUJI_RPC_URL = process.env.AVALANCHE_FUJI_RPC_URL
const HEDERA_TESTNET_RPC_URL = process.env.HEDERA_TESTNET_RPC_URL || 'https://testnet.hashio.io/api'
const SEPOLIA_CHAIN_SELECTOR = '16015286601757825753'
const WRAPPED_NATIVE_AVAX = '0xd00ae08403B9bbb9124bB305C09058E32C39A48c'
const WRAPPED_HBAR = '0xb1F616b8134F602c3Bb465fB5b5e6565cCAd37Ed'
const LINK_TOKEN_FUJI = '0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846'
const LINK_TOKEN_HEDERA = '0x90a386d59b9A6a4795a011e8f032Fc21ED6FEFb6'

// 6m to match https://viem.sh/docs/actions/public/waitForTransactionReceipt.html#timeout-optional,
// which is called  in approveRouter()
// TODO @zeuslawyer: https://prajjwaldimri.medium.com/why-is-my-jest-runner-not-closing-bc4f6632c959 - tests are passing but jest is not closing. Viem transport issue? why?
// currently timeout set to 180000ms in jest.config.js

if (!SEPOLIA_RPC_URL) {
  throw new Error('SEPOLIA_RPC_URL  must be set')
}
if (!AVALANCHE_FUJI_RPC_URL) {
  throw new Error('AVALANCHE_FUJI_RPC_URL must be set')
}

const privateKey = process.env.PRIVATE_KEY as Viem.Hex

if (privateKey === DEFAULT_ANVIL_PRIVATE_KEY) {
  throw new Error(
    "Developer's PRIVATE_KEY for Ethereum Sepolia and Avalanche Fuji must be set for integration testing on",
  )
}

describe('Integration: Fuji -> Sepolia', () => {
  let avalancheFujiClient: Viem.WalletClient
  let sepoliaClient: Viem.WalletClient
  let bnmToken_fuji: any
  let _messageId: `0x${string}`
  let tokenTransfer_txHash: `0x${string}`

  const AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS = '0xF694E193200268f9a4868e4Aa017A0118C9a8177'
  const approvedAmount = parseEther('0.000000001')

  beforeAll(async () => {
    avalancheFujiClient = Viem.createWalletClient({
      chain: avalancheFuji,
      transport: Viem.http(AVALANCHE_FUJI_RPC_URL),
      account: privateKeyToAccount(privateKey),
    })

    sepoliaClient = Viem.createWalletClient({
      chain: sepolia,
      transport: Viem.http(SEPOLIA_RPC_URL),
      account: privateKeyToAccount(privateKey),
    })

    bnmToken_fuji = Viem.getContract({
      address: '0xD21341536c5cF5EB1bcb58f6723cE26e8D8E90e4', // CCIP BnM on Avalanche Fuji
      abi: bridgeTokenAbi,
      client: avalancheFujiClient,
    })

    expect(bnmToken_fuji.address).toEqual('0xD21341536c5cF5EB1bcb58f6723cE26e8D8E90e4')

    const bnmBalance = await bnmToken_fuji.read.balanceOf([privateKeyToAccount(privateKey!).address])
    if (parseInt(bnmBalance) <= approvedAmount) {
      await bnmToken_fuji.write.drip([privateKeyToAccount(privateKey!).address])
      console.log(' ℹ️ | Dripped 1 CCIP BnM token to account: ', privateKeyToAccount(privateKey!).address)
    }
  })

  describe('√ (Fuji -> Sepolia) all critical functionality in CCIP Client', () => {
    it('should approve BnM spend, given valid input', async () => {
      const ccipApprove = await ccipClient.approveRouter({
        client: avalancheFujiClient,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        amount: approvedAmount,
        tokenAddress: bnmToken_fuji.address,
        waitForReceipt: true,
      })

      // ccipApprove.txReceipt!.status == 'success' && console.log(' | Approved CCIP BnM token on Avalanche Fuji'
      await expect(ccipApprove.txReceipt!.status).toEqual('success')
    })

    it('fetches token allowance', async function () {
      const allowance = await ccipClient.getAllowance({
        client: avalancheFujiClient,
        account: avalancheFujiClient.account!.address,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        tokenAddress: bnmToken_fuji.address,
      })
      expect(allowance).toEqual(approvedAmount)
    })

    it('returns on-ramp address', async function () {
      const avalancheFujiOnRampAddress = await ccipClient.getOnRampAddress({
        client: avalancheFujiClient,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
      })
      expect(avalancheFujiOnRampAddress).toEqual('0x75b9a75Ee1fFef6BE7c4F842a041De7c6153CF4E')
    })

    it('lists supported fee tokens', async function () {
      const result = await ccipClient.getSupportedFeeTokens({
        client: avalancheFujiClient,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
      })
      expect(result.length).toEqual(2)
      expect(result.includes(LINK_TOKEN_FUJI)).toBe(true)
      expect(result.includes(WRAPPED_NATIVE_AVAX)).toBe(true)
    })

    it('fetched lane rate refill limits are defined', async function () {
      const { tokens, lastUpdated, isEnabled, capacity, rate } = await ccipClient.getLaneRateRefillLimits({
        client: avalancheFujiClient,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
      })

      // this implicitly asserts that the values are defined as well.
      expect(typeof tokens).toBe('bigint')
      expect(typeof lastUpdated).toBe('number')
      expect(typeof isEnabled).toBe('boolean')
      expect(typeof capacity).toBe('bigint')
      expect(typeof rate).toBe('bigint')
    })

    it('returns token rate limit by lane', async function () {
      const { tokens, lastUpdated, isEnabled, capacity, rate } = await ccipClient.getTokenRateLimitByLane({
        client: avalancheFujiClient,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        supportedTokenAddress: bnmToken_fuji.address,
        destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
      })

      // this implicitly asserts that the values are defined as well.
      expect(typeof tokens).toBe('bigint')
      expect(typeof lastUpdated).toBe('number')
      expect(typeof isEnabled).toBe('boolean')
      expect(typeof capacity).toBe('bigint')
      expect(typeof rate).toBe('bigint')
    })

    it('returns fee estimate', async function () {
      const fee_link = await ccipClient.getFee({
        client: avalancheFujiClient,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        tokenAddress: bnmToken_fuji.address,
        amount: approvedAmount,
        destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
        destinationAccount: sepoliaClient.account!.address,
        feeTokenAddress: LINK_TOKEN_FUJI,
      })
      const fee_native = await ccipClient.getFee({
        client: avalancheFujiClient,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        tokenAddress: bnmToken_fuji.address,
        amount: approvedAmount,
        destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
        destinationAccount: sepoliaClient.account!.address,
        feeTokenAddress: WRAPPED_NATIVE_AVAX,
      })

      expect(fee_link).toBeGreaterThan(1000n)
      expect(fee_native).toBeGreaterThan(1000n)
    })
    it('returns token admin registry', async function () {
      const result = await ccipClient.getTokenAdminRegistry({
        client: avalancheFujiClient,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        tokenAddress: bnmToken_fuji.address,
        destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
      })

      const CCIP_ADMIN_REGISTRY_ADDRESS = '0xA92053a4a3922084d992fD2835bdBa4caC6877e6'
      expect(result).toEqual(CCIP_ADMIN_REGISTRY_ADDRESS)
    })

    it('checks if BnM token is supported for transfer', async function () {
      const result = await ccipClient.isTokenSupported({
        client: avalancheFujiClient,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        tokenAddress: bnmToken_fuji.address,
        destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
      })
      expect(result).toBe(true)
    })

    it('transfers tokens | pay in LINK', async function () {
      await ccipClient.approveRouter({
        client: avalancheFujiClient,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        amount: approvedAmount,
        tokenAddress: bnmToken_fuji.address,
        waitForReceipt: true,
      })

      // approve LINK spend
      const fee_link = await ccipClient.getFee({
        client: avalancheFujiClient,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        tokenAddress: bnmToken_fuji.address,
        amount: approvedAmount,
        destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
        destinationAccount: sepoliaClient.account!.address,
        feeTokenAddress: LINK_TOKEN_FUJI,
      })
      await ccipClient.approveRouter({
        client: avalancheFujiClient,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        amount: fee_link,
        tokenAddress: LINK_TOKEN_FUJI,
        waitForReceipt: true,
      })
      const allowance = await ccipClient.getAllowance({
        client: avalancheFujiClient,
        account: avalancheFujiClient.account!.address,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        tokenAddress: bnmToken_fuji.address,
      })

      expect(allowance).toBeGreaterThanOrEqual(approvedAmount)

      const result = await ccipClient.transferTokens({
        client: avalancheFujiClient,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        tokenAddress: bnmToken_fuji.address,
        destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
        destinationAccount: sepoliaClient.account!.address,
        amount: approvedAmount,
        feeTokenAddress: LINK_TOKEN_FUJI,
      })

      _messageId = result.messageId
      tokenTransfer_txHash = result.txHash

      expect(result.txReceipt!.status).toEqual('success')
    })

    it('transfers tokens > pays in native token', async function () {
      await ccipClient.approveRouter({
        client: avalancheFujiClient,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        amount: approvedAmount,
        tokenAddress: bnmToken_fuji.address,
        waitForReceipt: true,
      })

      const result = await ccipClient.transferTokens({
        client: avalancheFujiClient,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        tokenAddress: bnmToken_fuji.address,
        destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
        destinationAccount: sepoliaClient.account!.address,
        amount: approvedAmount,
      })

      expect(result.txReceipt!.status).toEqual('success')
    })

    it('CCIP message (sending) tx OK > paid in LINK', async function () {
      const testReceiverContract = '0xDDe1c31f052eeAceF8204Ff1C7993eb4adeb1EBD' // on Sepolia
      const testMessage = Viem.encodeAbiParameters(
        [{ type: 'string', name: 'message' }],
        ['Hello from Avalanche Fuji!'],
      )

      // Get fee in LINK and approve it
      const fee_link = await ccipClient.getFee({
        client: avalancheFujiClient,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
        destinationAccount: testReceiverContract,
        data: testMessage,
        feeTokenAddress: LINK_TOKEN_FUJI,
      })

      await ccipClient.approveRouter({
        client: avalancheFujiClient,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        amount: fee_link,
        tokenAddress: LINK_TOKEN_FUJI,
        waitForReceipt: true,
      })

      const result = await ccipClient.sendCCIPMessage({
        client: avalancheFujiClient,
        routerAddress: AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS,
        destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
        destinationAccount: testReceiverContract,
        data: testMessage,
        feeTokenAddress: LINK_TOKEN_FUJI,
      })

      console.info(
        `Avalanche Fuji --> Sepolia sendCCIPMessage MessageId: ${result.messageId} <> Sent to: ${testReceiverContract} on Sepolia`,
      )

      expect(result.txReceipt!.status).toEqual('success')
      expect(result.messageId).toBeDefined()
      expect(result.txHash).toBeDefined()
    })

    it('gets transfer status & gets transaction receipt', async function () {
      const ccipSend_txReceipt = await ccipClient.getTransactionReceipt({
        client: avalancheFujiClient,
        hash: tokenTransfer_txHash,
      })

      const FUJI_CHAIN_SELECTOR = '14767482510784806043'
      const SEPOLIA_ROUTER_ADDRESS = '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59'

      const transferStatus = await ccipClient.getTransferStatus({
        client: sepoliaClient, // from the destination chain
        sourceChainSelector: FUJI_CHAIN_SELECTOR,
        destinationRouterAddress: SEPOLIA_ROUTER_ADDRESS,
        fromBlockNumber: ccipSend_txReceipt.blockNumber ? ccipSend_txReceipt.blockNumber : undefined,
        messageId: _messageId,
      })

      expect(transferStatus).toBeDefined()

      expect(ccipSend_txReceipt).toBeDefined()
      expect(ccipSend_txReceipt.status).toEqual('success')
      expect(ccipSend_txReceipt.from.toLowerCase()).toEqual(avalancheFujiClient.account!.address.toLowerCase())
      expect(ccipSend_txReceipt.to!.toLowerCase()).toEqual(AVALANCHE_FUJI_CCIP_ROUTER_ADDRESS.toLowerCase())
    })
  })

  afterAll(async () => {
    console.info('✅ | Testnet Integration tests completed. Waiting for timeout...')
  })
})

describe('√ (Hedera(custom decimals) -> Sepolia) all critical functionality in CCIP Client', () => {
  let hederaTestnetClient: Viem.WalletClient
  let sepoliaClient: Viem.WalletClient
  let bnmToken_hedera: any
  let _messageId: `0x${string}`
  let tokenTransfer_txHash: `0x${string}`
  const HEDERA_TESTNET_CCIP_ROUTER_ADDRESS = '0x802C5F84eAD128Ff36fD6a3f8a418e339f467Ce4'
  const approvedAmount = parseEther('0.00000001') // denoted with 18 decimals

  const HEDERA_CHAIN_SELECTOR = '222782988166878823'
  const SEPOLIA_ROUTER_ADDRESS = '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59'

  beforeAll(async () => {
    hederaTestnetClient = Viem.createWalletClient({
      chain: hederaTestnet,
      transport: Viem.http(HEDERA_TESTNET_RPC_URL),
      account: privateKeyToAccount(privateKey),
    })

    sepoliaClient = Viem.createWalletClient({
      chain: sepolia,
      transport: Viem.http(SEPOLIA_RPC_URL),
      account: privateKeyToAccount(privateKey),
    })

    bnmToken_hedera = Viem.getContract({
      address: '0x01Ac06943d2B8327a7845235Ef034741eC1Da352', // CCIP BnM on Hedera Testnet
      abi: bridgeTokenAbi,
      client: hederaTestnetClient,
    })

    expect(bnmToken_hedera.address).toEqual('0x01Ac06943d2B8327a7845235Ef034741eC1Da352')

    const bnmBalance = await bnmToken_hedera.read.balanceOf([privateKeyToAccount(privateKey!).address])

    if (parseInt(bnmBalance) <= approvedAmount) {
      await bnmToken_hedera.write.drip([privateKeyToAccount(privateKey!).address])
      console.log(' ℹ️ | Dripped 1 CCIP BnM token to account: ', privateKeyToAccount(privateKey!).address)
    }
  })

  it('should approve BnM spend, given valid input', async () => {
    const ccipApprove = await ccipClient.approveRouter({
      client: hederaTestnetClient,
      routerAddress: HEDERA_TESTNET_CCIP_ROUTER_ADDRESS,
      amount: approvedAmount,
      tokenAddress: bnmToken_hedera.address,
      waitForReceipt: true,
    })

    await expect(ccipApprove.txReceipt!.status).toEqual('success')
  })

  it('fetches token allowance', async function () {
    const allowance = await ccipClient.getAllowance({
      client: hederaTestnetClient,
      account: hederaTestnetClient.account!.address,
      routerAddress: HEDERA_TESTNET_CCIP_ROUTER_ADDRESS,
      tokenAddress: bnmToken_hedera.address,
    })
    expect(allowance).toEqual(approvedAmount)
  })

  it('returns on-ramp address', async function () {
    const hederaOnRampAddress = await ccipClient.getOnRampAddress({
      client: hederaTestnetClient,
      routerAddress: HEDERA_TESTNET_CCIP_ROUTER_ADDRESS,
      destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
    })
    expect(hederaOnRampAddress).toBeDefined()
  })

  it('lists supported fee tokens', async function () {
    const result = await ccipClient.getSupportedFeeTokens({
      client: hederaTestnetClient,
      routerAddress: HEDERA_TESTNET_CCIP_ROUTER_ADDRESS,
      destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
    })
    expect(result.length).toBeGreaterThan(0)
    expect(result.includes(LINK_TOKEN_HEDERA)).toBe(true)
    expect(result.includes(WRAPPED_HBAR)).toBe(true)
  })

  it('fetched lane rate refill limits are defined', async function () {
    const { tokens, lastUpdated, isEnabled, capacity, rate } = await ccipClient.getLaneRateRefillLimits({
      client: hederaTestnetClient,
      routerAddress: HEDERA_TESTNET_CCIP_ROUTER_ADDRESS,
      destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
    })

    expect(typeof tokens).toBe('bigint')
    expect(typeof lastUpdated).toBe('number')
    expect(typeof isEnabled).toBe('boolean')
    expect(typeof capacity).toBe('bigint')
    expect(typeof rate).toBe('bigint')
  })

  it('returns token rate limit by lane', async function () {
    const { tokens, lastUpdated, isEnabled, capacity, rate } = await ccipClient.getTokenRateLimitByLane({
      client: hederaTestnetClient,
      routerAddress: HEDERA_TESTNET_CCIP_ROUTER_ADDRESS,
      supportedTokenAddress: bnmToken_hedera.address,
      destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
    })

    expect(typeof tokens).toBe('bigint')
    expect(typeof lastUpdated).toBe('number')
    expect(typeof isEnabled).toBe('boolean')
    expect(typeof capacity).toBe('bigint')
    expect(typeof rate).toBe('bigint')
  })

  it('returns fee estimate', async function () {
    const fee_native = await ccipClient.getFee({
      client: hederaTestnetClient,
      routerAddress: HEDERA_TESTNET_CCIP_ROUTER_ADDRESS,
      tokenAddress: bnmToken_hedera.address,
      amount: approvedAmount,
      destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
      destinationAccount: sepoliaClient.account!.address,
    })

    expect(fee_native).toBeGreaterThan(1000n)
  })

  it('returns token admin registry', async function () {
    const result = await ccipClient.getTokenAdminRegistry({
      client: hederaTestnetClient,
      routerAddress: HEDERA_TESTNET_CCIP_ROUTER_ADDRESS,
      tokenAddress: bnmToken_hedera.address,
      destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
    })

    expect(result).toBeDefined()
  })

  it('checks if BnM token is supported for transfer', async function () {
    const result = await ccipClient.isTokenSupported({
      client: hederaTestnetClient,
      routerAddress: HEDERA_TESTNET_CCIP_ROUTER_ADDRESS,
      tokenAddress: bnmToken_hedera.address,
      destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
    })
    expect(result).toBe(true)
  })

  it('transfers tokens | pays in native token', async function () {
    await ccipClient.approveRouter({
      client: hederaTestnetClient,
      routerAddress: HEDERA_TESTNET_CCIP_ROUTER_ADDRESS,
      amount: approvedAmount,
      tokenAddress: bnmToken_hedera.address,
      waitForReceipt: true,
    })

    const result = await ccipClient.transferTokens({
      client: hederaTestnetClient,
      routerAddress: HEDERA_TESTNET_CCIP_ROUTER_ADDRESS,
      tokenAddress: bnmToken_hedera.address,
      destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
      destinationAccount: sepoliaClient.account!.address,
      amount: approvedAmount,
    })

    _messageId = result.messageId
    tokenTransfer_txHash = result.txHash

    expect(result.txReceipt!.status).toEqual('success')
  })

  it('CCIP message (sending) tx OK > paid in native token', async function () {
    const testMessage = Viem.encodeAbiParameters([{ type: 'string', name: 'message' }], ['Hello from Hedera Testnet!'])
    const testReceiverContract = '0xd1C330A20712F5BfF3244eDD90ED010f39c68A56' // on Sepolia

    const result = await ccipClient.sendCCIPMessage({
      client: hederaTestnetClient,
      routerAddress: HEDERA_TESTNET_CCIP_ROUTER_ADDRESS,
      destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
      destinationAccount: testReceiverContract,
      data: testMessage,
    })

    console.info(
      `Hedera Testnet --> Sepolia sendCCIPMessage MessageId: ${result.messageId} <> Sent to: ${testReceiverContract} on Hedera`,
    )

    expect(result.txReceipt!.status).toEqual('success')
    expect(result.messageId).toBeDefined()
    expect(result.txHash).toBeDefined()

    // Also test ccip client.getTransactionReceipt()
    const messageTxReceipt = await ccipClient.getTransactionReceipt({
      client: hederaTestnetClient,
      hash: result.txHash,
    })
    expect(messageTxReceipt).toBeDefined()
    expect(messageTxReceipt.status).toEqual('success')
  })

  it('gets transfer status & gets transaction receipt', async function () {
    const ccipSend_txReceipt = await ccipClient.getTransactionReceipt({
      client: hederaTestnetClient,
      hash: tokenTransfer_txHash,
    })

    const transferStatus = await ccipClient.getTransferStatus({
      client: sepoliaClient, // from the destination chain
      sourceChainSelector: HEDERA_CHAIN_SELECTOR,
      destinationRouterAddress: SEPOLIA_ROUTER_ADDRESS,
      fromBlockNumber: ccipSend_txReceipt.blockNumber ? ccipSend_txReceipt.blockNumber : undefined,
      messageId: _messageId,
    })

    expect(transferStatus).toBeDefined()
    expect(ccipSend_txReceipt).toBeDefined()
    expect(ccipSend_txReceipt.status).toEqual('success')
    expect(ccipSend_txReceipt.from.toLowerCase()).toEqual(hederaTestnetClient.account!.address.toLowerCase())
    expect(ccipSend_txReceipt.to!.toLowerCase()).toEqual(HEDERA_TESTNET_CCIP_ROUTER_ADDRESS.toLowerCase())
  })
})
