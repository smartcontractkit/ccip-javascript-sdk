import { Contract, Provider, Signer, TransactionReceipt, TransactionResponse, Wallet } from 'ethers'
import { Address, Hash, TransactionReceipt as ViemTransactionReceipt } from 'viem'

/**
 * Adapter for ethers.js to match viem's interface
 */
export class EthersAdapter {
  private provider: Provider
  private signer?: Signer

  /**
   * Create a new EthersAdapter instance
   * @param provider - ethers.js Provider instance
   * @param signer - Optional ethers.js Signer instance (required for write operations)
   */
  constructor(provider: Provider, signer?: Signer) {
    this.provider = provider
    this.signer = signer
  }

  /**
   * Create a new instance from a provider URL and optional private key
   * @param url - RPC URL
   * @param privateKey - Optional private key for signing transactions
   * @returns New EthersAdapter instance
   */
  static fromUrl(url: string, privateKey?: string): EthersAdapter {
    const provider = new Provider(url)
    const signer = privateKey ? new Wallet(privateKey, provider) : undefined
    return new EthersAdapter(provider, signer)
  }

  /**
   * Read from a smart contract
   */
  async readContract({
    address,
    abi,
    functionName,
    args = [],
  }: {
    address: Address
    abi: any[]
    functionName: string
    args?: any[]
  }): Promise<any> {
    const contract = new Contract(address, abi, this.provider)
    return contract[functionName](...(args || []))
  }

  /**
   * Write to a smart contract
   */
  async writeContract({
    address,
    abi,
    functionName,
    args = [],
    value,
    ...tx
  }: {
    address: Address
    abi: any[]
    functionName: string
    args?: any[]
    value?: bigint
    [key: string]: any
  }): Promise<Hash> {
    if (!this.signer) {
      throw new Error('Signer is required for write operations')
    }

    const contract = new Contract(address, abi, this.signer)
    const txResponse: TransactionResponse = await contract[functionName](...(args || []), {
      ...tx,
      value: value?.toString(),
    })
    
    return txResponse.hash as Hash
  }

  /**
   * Wait for a transaction receipt
   */
  async waitForTransactionReceipt({
    hash,
    confirmations,
    timeout,
  }: {
    hash: Hash
    confirmations?: number
    timeout?: number
  }): Promise<ViemTransactionReceipt> {
    const receipt = await this.provider.waitForTransaction(
      hash,
      confirmations,
      timeout
    )

    return this.formatReceipt(receipt)
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(hash: Hash): Promise<ViemTransactionReceipt> {
    const receipt = await this.provider.getTransactionReceipt(hash)
    if (!receipt) {
      throw new Error('Transaction receipt not found')
    }
    return this.formatReceipt(receipt)
  }

  /**
   * Get the current block number
   */
  async getBlockNumber(): Promise<bigint> {
    const blockNumber = await this.provider.getBlockNumber()
    return BigInt(blockNumber)
  }

  /**
   * Get logs for a contract
   */
  async getLogs({
    address,
    event,
    fromBlock,
    toBlock,
    args,
  }: {
    address: Address
    event: any
    fromBlock?: bigint
    toBlock?: bigint
    args?: any
  }): Promise<any[]> {
    const filter = {
      address,
      topics: event.topic ? [event.topic] : undefined,
      fromBlock: fromBlock?.toString(),
      toBlock: toBlock?.toString(),
    }

    return this.provider.getLogs(filter as any)
  }

  /**
   * Format ethers.js receipt to match viem's receipt format
   */
  private formatReceipt(receipt: TransactionReceipt): ViemTransactionReceipt {
    return {
      ...receipt,
      blockNumber: BigInt(receipt.blockNumber),
      cumulativeGasUsed: BigInt(receipt.cumulativeGasUsed),
      effectiveGasPrice: BigInt(receipt.gasPrice?.toString() || '0'),
      gasUsed: BigInt(receipt.gasUsed),
      logs: receipt.logs.map((log) => ({
        ...log,
        blockNumber: BigInt(log.blockNumber),
        logIndex: log.index,
        transactionIndex: log.transactionIndex,
      })),
      status: receipt.status === 1 ? 'success' : 'reverted',
      to: receipt.to as Address,
      transactionIndex: receipt.index,
    } as unknown as ViemTransactionReceipt
  }
}

/**
 * Type guard to check if an object is an ethers.js provider
 */
export function isEthersProvider(provider: any): provider is Provider {
  return provider && typeof provider.getBlockNumber === 'function'
}

/**
 * Type guard to check if an object is an ethers.js signer
 */
export function isEthersSigner(signer: any): signer is Signer {
  return signer && typeof signer.getAddress === 'function' && signer.provider
}

/**
 * Type guard to check if an object is an EthersAdapter
 */
export function isEthersAdapter(adapter: any): adapter is EthersAdapter {
  return adapter && adapter instanceof EthersAdapter
}
