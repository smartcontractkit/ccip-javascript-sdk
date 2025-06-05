import { getContract, type Address, type Hex } from 'viem'
import {
  account,
  bridgeTokenAbi,
  bridgeTokenBin,
  onRampAbi,
  onRampBin,
  feeQuoterAbi,
  feeQuoterBin,
  routerAbi,
  routerBin,
  simulatorAbi,
  simulatorBin,
} from './constants'
import { mineBlock } from './utils'
import { forkClient, testClient } from './clients'
import { readContract } from 'viem/actions'

import { getRampConfigs, getStandardConfigs, getTokenConfigs } from './config'

interface DeployContractOptions {
  isFork: boolean
  args: string[]
  abi: any
  bin: Hex
}

interface AllowanceOptions {
  isFork: boolean
  contractAddress: Address
  spenderAddress: Address
  amount?: string
}

export const deployContract = async ({ isFork, args, abi, bin }: DeployContractOptions) => {
  const client = isFork ? forkClient : testClient
  const txHash = await client.deployContract({
    abi: abi,
    account,
    args: args,
    bytecode: bin,
  })

  await mineBlock(isFork)

  const { contractAddress } = await client.getTransactionReceipt({ hash: txHash })
  // console.log('deployed address:', contractAddress)
  return contractAddress
}

export const getContractAddresses = async () => {
  const bridgeTokenAddress = (await deployContract({
    isFork: false,
    args: ['CCIP Burn & Mint Token', 'CCIP-BnM'],
    abi: bridgeTokenAbi,
    bin: `0x${bridgeTokenBin}`,
  })) as Address
  const linkTokenAddress = (await deployContract({
    isFork: false,
    args: ['Chainlink', ' LINK'],
    abi: bridgeTokenAbi,
    bin: `0x${bridgeTokenBin}`,
  })) as Address
  const localSimulatorAddress = (await deployContract({
    isFork: false,
    args: [],
    abi: simulatorAbi,
    bin: `0x${simulatorBin}`,
  })) as Address
  const routerAddress = (await deployContract({
    isFork: false,
    args: [linkTokenAddress, linkTokenAddress],
    abi: routerAbi,
    bin: `0x${routerBin}`,
  })) as Address
  const feeQuoterAddress = (await deployContract({
    isFork: false,
    args: [],
    abi: feeQuoterAbi,
    bin: `0x${feeQuoterBin}`,
  })) as Address
  return {
    localSimulatorAddress: localSimulatorAddress,
    bridgeTokenAddress: bridgeTokenAddress,
    linkTokenAddress: linkTokenAddress,
    routerAddress: routerAddress,
    feeQuoterAddress: feeQuoterAddress,
  }
}
export const getOnRampAddress = async () => {
  const { staticConfig, dynamicConfig, rateLimiterConfig } = await getStandardConfigs({
    chainSelector: 16015286601757825753n,
  })
  const { feeTokenConfigs, tokenTransferFeeConfigArgs } = await getTokenConfigs({
    chainSelector: 16015286601757825753n,
  })
  const { nopsAndWeights, rampOptions } = await getRampConfigs({ chainSelector: 16015286601757825753n })
  const onRampAddress = (await deployContract({
    isFork: false,
    args: [
      staticConfig.toString(),
      dynamicConfig.toString(),
      rateLimiterConfig.toString(),
      feeTokenConfigs.toString(),
      tokenTransferFeeConfigArgs.toString(),
      nopsAndWeights.toString(),
    ],
    abi: onRampAbi,
    bin: `0x${onRampBin}`,
  })) as Address
  mineBlock(false)
  return {
    onRampAddress: onRampAddress,
  }
}

export const getContracts = async () => {
  const { localSimulatorAddress, bridgeTokenAddress, feeQuoterAddress, routerAddress } = await getContractAddresses()
  const bridgeToken = await getContract({
    address: bridgeTokenAddress,
    abi: bridgeTokenAbi,
    client: testClient,
  })
  const router = await getContract({
    address: routerAddress,
    abi: routerAbi,
    client: testClient,
  })
  const localSimulator = await getContract({
    address: localSimulatorAddress,
    abi: simulatorAbi,
    client: testClient,
  })
  // const onRamp = await getContract({
  //   address: onRampAddress,
  //   abi: onRampAbi,
  //   client: testClient,
  // })
  const feeQuoter = await getContract({
    address: feeQuoterAddress,
    abi: feeQuoterAbi,
    client: testClient,
  })
  mineBlock(false)
  return {
    bridgeToken: bridgeToken,
    router: router,
    localSimulator: localSimulator,
    // onRamp: onRamp,
    feeQuoter: feeQuoter,
  }
}

export const getApprovalAmount = async ({ isFork, contractAddress, spenderAddress }: AllowanceOptions) => {
  const client = isFork ? forkClient : testClient

  const allowance = (await client.readContract({
    address: contractAddress,
    abi: bridgeTokenAbi,
    functionName: 'allowance',
    args: [account.address, spenderAddress], // owner, spender
  })) as bigint

  return allowance
}

interface OnRampOptions {
  destinationChainSelector: string
  localSimulatorAddress?: Address
}

export async function setOnRampAddress({ destinationChainSelector }: OnRampOptions) {
  const { router } = await getContracts()
  await router.write.applyRampUpdates([
    [
      {
        destChainSelector: destinationChainSelector,
        onRamp: '0x8F35B097022135E0F46831f798a240Cc8c4b0B01',
      },
    ],
    [],
    [],
  ])
  mineBlock(false)

  const onRampAddress = (await readContract(testClient, {
    abi: routerAbi,
    address: router.address,
    functionName: 'getOnRamp',
    args: [destinationChainSelector],
  })) as Address

  return onRampAddress
}
