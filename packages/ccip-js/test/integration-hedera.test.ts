import { expect, it, beforeAll, describe } from '@jest/globals'
import * as CCIP from '../src/api'
import * as Viem from 'viem'
import { hederaTestnet } from 'viem/chains'
import bridgeToken from '../artifacts-compile/BridgeToken.json'

const ccipClient = CCIP.createClient()
const bridgeTokenAbi = bridgeToken.contracts['src/contracts/BridgeToken.sol:BridgeToken'].bridgeTokenAbi

const HEDERA_TESTNET_RPC_URL = process.env.HEDERA_TESTNET_RPC_URL || 'https://testnet.hashio.io/api'
const SEPOLIA_CHAIN_SELECTOR = '16015286601757825753'

describe('Integration (viem): Hedera -> Sepolia', () => {
  let hederaTestnetClient: Viem.Client
  let bnmToken_hedera: any

  const HEDERA_TESTNET_CCIP_ROUTER_ADDRESS = '0x802C5F84eAD128Ff36fD6a3f8a418e339f467Ce4'
  const LINK_TOKEN_HEDERA = '0x90a386d59b9A6a4795a011e8f032Fc21ED6FEFb6'
  const WRAPPED_HBAR = '0xb1F616b8134F602c3Bb465fB5b5e6565cCAd37Ed'

  beforeAll(async () => {
    hederaTestnetClient = Viem.createPublicClient({
      chain: hederaTestnet,
      transport: Viem.http(HEDERA_TESTNET_RPC_URL, { fetchOptions: { keepalive: false } }),
    })

    bnmToken_hedera = Viem.getContract({
      address: '0x01Ac06943d2B8327a7845235Ef034741eC1Da352',
      abi: bridgeTokenAbi,
      client: hederaTestnetClient,
    })

    expect(bnmToken_hedera.address).toEqual('0x01Ac06943d2B8327a7845235Ef034741eC1Da352')
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
    expect(result).toEqual(expect.arrayContaining([LINK_TOKEN_HEDERA, WRAPPED_HBAR]))
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

  it('getFee is not supported on Hedera Router (throws)', async function () {
    await expect(async () =>
      ccipClient.getFee({
        client: hederaTestnetClient,
        routerAddress: HEDERA_TESTNET_CCIP_ROUTER_ADDRESS,
        tokenAddress: bnmToken_hedera.address,
        amount: Viem.parseEther('0.00000001'),
        destinationChainSelector: SEPOLIA_CHAIN_SELECTOR,
        destinationAccount: '0x0000000000000000000000000000000000000001',
      }),
    ).rejects.toThrow()
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
    expect(typeof result).toBe('boolean')
  })
})
