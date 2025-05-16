import { Address, zeroAddress } from 'viem'
import {
  DynamicConfig,
  FeeTokenConfigArgs,
  NopAndWeight,
  RateLimiterConfig,
  StaticConfig,
  TokenTransferFeeConfigArgs,
} from './types'
import { getContractAddresses, getContracts } from './contracts'
import { mineBlock } from './utils'

interface ConfigOptions {
  chainSelector: bigint
}

interface DynamicConfigOptions {
  feeQuoterAddress: Address
}

interface FeeTokenConfigOptions {
  chainSelector: bigint
  tokenAddress: Address
}

interface RampOptions {
  routerAddress: Address
  chainSelector: bigint
}

export const getTokenAdminRegistry = async ({ chainSelector }: ConfigOptions) => {
  const staticConfig = await setStaticConfig({ chainSelector })
  mineBlock(false)
  console.log({ staticConfig })
  const tokenAdminRegistryAddress: Address =
    (await (staticConfig as StaticConfig).tokenAdminRegistryAddress) ?? zeroAddress

  return {
    tokenAdminRegistryAddress: tokenAdminRegistryAddress,
  }
}

export const setStaticConfig = async ({ chainSelector }: ConfigOptions) => {
  const { linkTokenAddress } = await getContractAddresses()
  console.log({ linkTokenAddress })
  const { tokenAdminRegistryAddress } = await getTokenAdminRegistry({
    chainSelector: chainSelector,
  })
  console.log({ tokenAdminRegistryAddress })
  return {
    linkToken: linkTokenAddress,
    chainSelector: chainSelector,
    destChainSelector: chainSelector,
    defaultTxGasLimit: 200000n,
    maxNopFeesJuels: 100000000000000000000000000n,
    prevOnRamp: zeroAddress,
    armProxy: zeroAddress,
    rmnProxy: zeroAddress,
    tokenAdminRegistryAddress: tokenAdminRegistryAddress,
  } as StaticConfig
}

const setDynamicConfig = async ({ feeQuoterAddress }: DynamicConfigOptions) => {
  const { routerAddress } = await getContractAddresses()
  return {
    router: routerAddress,
    maxNumberOfTokensPerMsg: 1n,
    destGasPerPayloadByte: 1n,
    destDataAvailabilityOverheadGas: 1n,
    destGasOverhead: 1n,
    destGasPerDataAvailabilityByte: 1n,
    destDataAvailabilityMultiplierBps: 1n,
    feeQuoter: feeQuoterAddress,
    maxDataBytes: 1n,
    maxPerMsgGasLimit: 1n,
  } as DynamicConfig
}

const setNopsAndWeights = async ({ chainSelector }: ConfigOptions) => {
  const nopsAndWeights = [
    {
      nop: zeroAddress,
      weight: 1n,
    },
  ] as NopAndWeight[]

  return nopsAndWeights
}

// todo: verify
const setTokenAdminRegistry = async ({ chainSelector }: ConfigOptions) => {
  const tokenAdminRegistryAddress = await getTokenAdminRegistry({ chainSelector })
  return tokenAdminRegistryAddress
}

// const setRateLimiterConfig = async ({ chainSelector }: ConfigOptions) => {
//     return {
//         isEnabled: false,
//         capacity: 1n,
//         rate: 1n
//     } as RateLimiterConfig
// }

const setFeeTokenConfigs = async ({ chainSelector, tokenAddress }: FeeTokenConfigOptions) => {
  return [
    {
      token: tokenAddress, // ───────╮ Token address
      networkFeeUSDCents: 1n, //        │ Flat network fee to charge for messages,  multiples of 0.01 USD
      gasMultiplierWeiPerEth: 1n, //   ─────╯ Multiplier for gas costs, 1e18 based so 11e17 = 10% extra cost
      premiumMultiplierWeiPerEth: 1n, // ───────╮ Multiplier for fee-token-specific premiums, 1e18 based
      enabled: true, // ───────╯ Whether this fee token is enabled
    },
  ] as FeeTokenConfigArgs[]
}

const setTokenTransferFeeConfigArgs = async ({ chainSelector, tokenAddress }: FeeTokenConfigOptions) => {
  const tokenTransferFeeConfigArgs = [
    {
      token: tokenAddress, //   ────────────╮ Token address
      minFeeUSDCents: 1n, //               │ Minimum fee to charge per token transfer, multiples of 0.01 USD
      maxFeeUSDCents: 1n, //               │ Maximum fee to charge per token transfer, multiples of 0.01 USD
      deciBps: 1n, //    ───────────╯ Basis points charged on token transfers, multiples of 0.1bps, or 1e-5
      destGasOverhead: 1n, // ──╮ Gas charged to execute the token transfer on the destination chain
      destBytesOverhead: 1n, //  ─╯ Extra data availability bytes on top of fixed transfer data, including sourceTokenData and offchainData
    },
  ] as TokenTransferFeeConfigArgs[]

  return tokenTransferFeeConfigArgs
}

export const getStandardConfigs = async ({ chainSelector }: ConfigOptions) => {
  const { feeQuoterAddress, routerAddress } = await getContractAddresses()
  const staticConfig = await setStaticConfig({ chainSelector })
  const rateLimiterConfig = {
    isEnabled: false,
    capacity: 1n,
    rate: 1n,
  } as RateLimiterConfig
  // await setRateLimiterConfig({ chainSelector })
  const dynamicConfig = await setDynamicConfig({ feeQuoterAddress })

  return {
    staticConfig,
    rateLimiterConfig,
    dynamicConfig,
  }
}

export const getSupportedFeeTokens = async () => {
  const { feeQuoter } = await getContracts()
  const feeTokens = (await feeQuoter.read.getFeeTokens()) as Address[]
  return feeTokens
}

export const getTokenConfigs = async ({ chainSelector }: ConfigOptions) => {
  const { linkTokenAddress } = await getContractAddresses()
  const tokenAdminRegistryAddress = await setTokenAdminRegistry({ chainSelector })
  const feeTokenConfigs = await setFeeTokenConfigs({ chainSelector, tokenAddress: linkTokenAddress })
  const tokenTransferFeeConfigArgs = await setTokenTransferFeeConfigArgs({
    chainSelector,
    tokenAddress: linkTokenAddress,
  })

  return {
    tokenAdminRegistryAddress,
    feeTokenConfigs,
    tokenTransferFeeConfigArgs,
  }
}

export const getRampConfigs = async ({ chainSelector }: ConfigOptions) => {
  const { routerAddress } = await getContractAddresses()
  const nopsAndWeights = await setNopsAndWeights({ chainSelector })
  const rampOptions: RampOptions = {
    routerAddress,
    chainSelector: chainSelector,
  }

  return {
    nopsAndWeights,
    rampOptions,
  }
}
