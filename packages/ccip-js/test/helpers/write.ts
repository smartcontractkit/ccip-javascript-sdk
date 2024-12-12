import { Address, getContract } from 'viem'
import { mineBlock } from './utils'
import { forkClient, testClient } from './clients'

interface WriteOptions {
  isFork: boolean
  contractAddress: Address
  abi: any
}

// export const manifestContract = async ({ isFork, contractAddress, abi}: WriteOptions) => {
//     const client = isFork? forkClient : testClient

//     await mineBlock(isFork)
//     const contract = await getContract({
//         address: contractAddress,
//         abi: abi,
//         client: client,
//       })

//     return contract
// }

// const contractAddress = await deployContract({
//     isFork,
//     args: ['CCIP Burn & Mint Token',
//       'CCIP-BnM'],
//     abi: abi,
//     bin: `0x${bin}`,
//   })
//   await mineBlock(isFork);
//   bridgeTokenAddress = contractAddress as Address
//   console.log({ bridgeTokenAddress });
//   if (bridgeTokenAddress) {
//     const contract = getContract({
//       address: bridgeTokenAddress,
//       abi: abi,
//       client: testClient,
//     });
//     tokenSupply = await contract.read.totalSupply() as bigint
//     // console.log({ tokenSupply })

//     await contract.write.drip([account.address]);
//     // console.log({ tokenSupply })
//     await mineBlock(isFork);
