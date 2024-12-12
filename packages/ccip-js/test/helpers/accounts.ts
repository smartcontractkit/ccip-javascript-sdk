import { Address, formatEther, parseEther } from 'viem'
import { account, bridgeTokenAbi } from './constants'
import { forkClient, testClient } from './clients'
// import { getContractAddresses } from './contracts'
// import { mineBlock } from './utils'

interface BalanceOptions {
  isFork: boolean
  amount: string
}
// interface AllowanceOptions {
//   isFork: boolean
//   amount: string
//   contractAddress: string
// }

export const increaseBalance = async ({ isFork, amount }: BalanceOptions) => {
  const client = isFork ? forkClient : testClient

  const startBalance = await client.getBalance({
    address: account.address,
  })

  await client.setBalance({
    address: account.address,
    value: startBalance + parseEther(amount),
  })

  const balance = await client.getBalance({
    address: account.address,
  })

  console.log('balance:', formatEther(balance))
}

export const setBalance = async ({ isFork, amount }: BalanceOptions) => {
  const client = isFork ? forkClient : testClient

  await client.setBalance({
    address: account.address,
    value: parseEther(amount),
  })

  const balance = await client.getBalance({
    address: account.address,
  })

  console.log('balance:', formatEther(balance))

  return balance
}

export const getBalance = async ({ isFork }: BalanceOptions) => {
  const client = isFork ? forkClient : testClient

  const balance = await client.getBalance({
    address: account.address,
  })

  console.log('balance:', formatEther(balance))

  return balance
}


// export const setAllowance = async ({ isFork, amount, contract }: AllowanceOptions) => {
//   const client = isFork ? forkClient : testClient

//   await client.setAllowance({
//     address: account.address,
//     value: parseEther(amount),
//   })

//   const allowance = await client.getAllowance({
//     address: account.address,
//   })

//   console.log('allowance:', formatEther(allowance))

//   return allowance
// }
