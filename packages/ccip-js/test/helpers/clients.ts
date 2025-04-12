import { account } from './constants'
import { createTestClient, http, publicActions, walletActions } from 'viem'
import {  sepolia, anvil } from 'viem/chains'

export const testClient = createTestClient({
  chain: anvil,
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
