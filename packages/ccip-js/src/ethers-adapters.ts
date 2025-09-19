import type { Provider, Signer, TypedDataField } from 'ethers'
import type {Address, Hash,  Transport, WalletClient, PublicClient } from 'viem'

import { custom, createPublicClient, createWalletClient } from 'viem'
import { toAccount } from 'viem/accounts'

/** Convert an ethers provider to a viem transport. */
export function ethersProviderToTransport(provider: Provider): Transport {
  return custom({
    async request({ method, params }) {
      return (provider as any).send(method, params as any)
    },
  })
}

/** Convert an ethers signer to a viem LocalAccount. */
export async function ethersSignerToAccount(signer: Signer) {
  return toAccount({
    address: (await signer.getAddress()) as unknown as Address,
    async signMessage({ message }) {
      const data = typeof message === 'string' ? message : new TextDecoder().decode(message as any)
      return signer.signMessage(data) as unknown as Hash
    },
    async signTransaction(txn) {
      return signer.signTransaction({
        chainId: txn.chainId,
        data: txn.data,
        gasLimit: txn.gas,
        gasPrice: txn.gasPrice,
        nonce: txn.nonce,
        to: txn.to,
        value: txn.value,
        type: txn.type === 'legacy' ? 0 : txn.type === 'eip2930' ? 1 : txn.type === 'eip1559' ? 2 : undefined,
        ...(txn.type && txn.accessList ? { accessList: txn.accessList } : {}),
        ...(txn.maxPriorityFeePerGas ? { maxPriorityFeePerGas: txn.maxPriorityFeePerGas } : {}),
        ...(txn.maxFeePerGas ? { maxFeePerGas: txn.maxFeePerGas } : {}),
      } as any) as unknown as Hash
    },
    async signTypedData({ domain, types, message }) {
      const { EIP712Domain: _removed, ...rest } = types as any
      const signTypedData = (signer as any)._signTypedData ?? (signer as any).signTypedData
      return signTypedData(domain ?? {}, rest as Record<string, TypedDataField[]>, message) as unknown as Hash
    },
  })
}

/** Create a viem PublicClient from an ethers provider. */
export function ethersProviderToPublicClient(provider: Provider, chain: any): PublicClient {
  return createPublicClient({ chain: chain as any, transport: ethersProviderToTransport(provider) }) as unknown as PublicClient
}

/** Create a viem WalletClient from an ethers signer. */
export async function ethersSignerToWalletClient(
  signer: Signer & { provider: Provider | null },
  chain: any,
): Promise<WalletClient> {
  if (!signer.provider) {
    throw new Error('ethers signer must be connected to a provider')
  }
  return createWalletClient({
    chain: chain as any,
    transport: ethersProviderToTransport(signer.provider),
    account: await ethersSignerToAccount(signer),
  }) as unknown as WalletClient
}
