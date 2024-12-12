import { account } from './constants'
import { createTestClient, http, publicActions, walletActions } from 'viem'
import { hardhat, sepolia } from 'viem/chains'

export const testClient = createTestClient({
  chain: hardhat,
  transport: http(),
  mode: 'anvil',
  account,
})
  .extend(publicActions)
  .extend(walletActions)

export const forkClient = createTestClient({
  chain: sepolia,
  transport: http(),
  mode: 'anvil',
  account,
})
  .extend(publicActions)
  .extend(walletActions)
