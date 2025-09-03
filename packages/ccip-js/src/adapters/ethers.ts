import type {
  Address,
  Chain,
  Client as ViemClient,
  Hex,
  PublicClient,
  Transport,
  WalletClient,
  TransactionReceipt as ViemTransactionReceipt,
  AbiEvent,
} from 'viem'
import {
  createPublicClient,
  createWalletClient,
  custom,
  parseEventLogs,
  keccak256,
  toHex,
  isAddress,
  zeroAddress,
  isAddressEqual,
} from 'viem'
import { toAccount } from 'viem/accounts'
import type { Provider, Signer, TypedDataField } from 'ethers'
import { Contract, type TransactionReceipt as EthersTxReceipt, type TransactionResponse } from 'ethers'
import {
  readContract as viemReadContract,
  writeContract as viemWriteContract,
  waitForTransactionReceipt as viemWaitForTransactionReceipt,
  getTransactionReceipt as viemGetTransactionReceipt,
  getBlockNumber as viemGetBlockNumber,
  getLogs as viemGetLogs,
} from 'viem/actions'

/**
 * Converts an ethers Provider to a viem Transport for use with viem clients.
 */
export function ethersProviderToTransport(provider: Provider): Transport {
  return custom({
    async request({ method, params }) {
      const anyProvider = provider as any
      if (typeof anyProvider.request === 'function') {
        return anyProvider.request({ method, params })
      }
      if (typeof anyProvider.send === 'function') {
        return anyProvider.send(method, params as any)
      }
      throw new Error('Unsupported ethers provider: missing request/send method')
    },
  })
}

/**
 * Adapts an ethers Signer into a viem LocalAccount supporting message, transaction,
 * and EIP-712 typed data signing.
 */
export async function ethersSignerToAccount(signer: Signer) {
  return toAccount({
    address: (await signer.getAddress()) as unknown as Address,
    async signMessage({ message }) {
      let data: any
      if (typeof message === 'string') {
        data = message
      } else if (typeof message === 'object' && message !== null && 'raw' in (message as any)) {
        const raw = (message as any).raw as Hex | Uint8Array
        data = typeof raw === 'string' ? (raw as string) : (raw as Uint8Array)
      } else {
        data = message as any
      }
      return (await signer.signMessage(data)) as unknown as Hex
    },
    async signTransaction(txn) {
      const serialized = await signer.signTransaction({
        chainId: txn.chainId,
        data: txn.data,
        gasLimit: txn.gas,
        gasPrice: txn.gasPrice,
        nonce: txn.nonce,
        to: txn.to,
        value: txn.value,
        type:
          txn.type === 'legacy'
            ? 0
            : txn.type === 'eip2930'
              ? 1
              : txn.type === 'eip1559'
                ? 2
                : txn.type === 'eip4844'
                  ? 3
                  : undefined,
        ...(txn.type && txn.accessList ? { accessList: txn.accessList } : {}),
        ...(txn.maxPriorityFeePerGas ? { maxPriorityFeePerGas: txn.maxPriorityFeePerGas } : {}),
        ...(txn.maxFeePerGas ? { maxFeePerGas: txn.maxFeePerGas } : {}),
        ...((txn as any).maxFeePerBlobGas ? { maxFeePerBlobGas: (txn as any).maxFeePerBlobGas } : {}),
        ...((txn as any).blobVersionedHashes ? { blobVersionedHashes: (txn as any).blobVersionedHashes } : {}),
        ...((txn as any).blobs ? { blobs: (txn as any).blobs } : {}),
      } as any)
      return serialized as unknown as Hex
    },
    async signTypedData({ domain, types, message }) {
      const { EIP712Domain: _ignored, ...rest } = (types || {}) as Record<string, TypedDataField[]>
      const signTypedData = (signer as any)._signTypedData ?? (signer as any).signTypedData
      return (await signTypedData(domain ?? {}, rest, message)) as unknown as Hex
    },
  })
}

/**
 * Creates a viem PublicClient from an ethers Provider and Chain.
 */
export function ethersProviderToPublicClient(provider: Provider, chain: Chain): PublicClient {
  return createPublicClient({ chain, transport: ethersProviderToTransport(provider) }) as unknown as PublicClient
}

/**
 * Creates a viem WalletClient from an ethers Signer connected to a Provider.
 */
export async function ethersSignerToWalletClient(
  signer: Signer & { provider?: Provider },
  chain: Chain,
): Promise<WalletClient> {
  if (!signer || !(signer as any).provider) {
    throw new Error('Invalid signer: missing provider. Provide a signer connected to a provider.')
  }
  return createWalletClient({
    chain,
    transport: ethersProviderToTransport((signer as any).provider as Provider),
    account: await ethersSignerToAccount(signer),
  }) as unknown as WalletClient
}

/**
 * Lightweight adapter around ethers to expose read/write and utility methods similar to viem.
 */
export class EthersAdapter {
  private provider: Provider
  private signer?: Signer

  constructor(provider: Provider, signer?: Signer) {
    this.provider = provider
    this.signer = signer
  }

  /**
   * Calls a view/pure function on a contract using the provided provider.
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
  }) {
    const contract = new Contract(address, abi, this.provider)
    return (contract as any)[functionName](...(args || []))
  }

  /**
   * Sends a transaction to a contract function using the configured signer.
   * Returns the transaction hash as Hex.
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
  }): Promise<Hex> {
    if (!this.signer) throw new Error('Signer is required for write operations')
    const contract = new Contract(address, abi, this.signer)
    const txResponse: TransactionResponse = await (contract as any)[functionName](...(args || []), {
      ...tx,
      value: value !== undefined ? value.toString() : undefined,
    })
    return txResponse.hash as Hex
  }

  /**
   * Waits for a transaction receipt and returns it normalized to viem's TransactionReceipt.
   */
  async waitForTransactionReceipt({
    hash,
    confirmations,
    timeout,
  }: {
    hash: Hex
    confirmations?: number
    timeout?: number
  }) {
    const maybe = await this.provider.waitForTransaction(hash, confirmations, timeout)
    if (!maybe) throw new Error('Transaction receipt not found')
    return this.formatReceipt(maybe)
  }

  /**
   * Fetches a transaction receipt by hash and returns it normalized to viem's TransactionReceipt.
   */
  async getTransactionReceipt(hash: Hex) {
    const maybe = await this.provider.getTransactionReceipt(hash)
    if (!maybe) throw new Error('Transaction receipt not found')
    return this.formatReceipt(maybe)
  }

  /**
   * Returns the latest block number as bigint.
   */
  async getBlockNumber(): Promise<bigint> {
    const blockNumber = await this.provider.getBlockNumber()
    return BigInt(blockNumber)
  }

  /**
   * Normalizes an ethers TransactionReceipt to viem's TransactionReceipt shape.
   */
  private formatReceipt(receipt: EthersTxReceipt) {
    return {
      ...receipt,
      blockNumber: BigInt(receipt.blockNumber),
      cumulativeGasUsed: BigInt(receipt.cumulativeGasUsed),
      effectiveGasPrice: BigInt(((receipt as any).effectiveGasPrice ?? (receipt as any).gasPrice)?.toString() || '0'),
      gasUsed: BigInt(receipt.gasUsed),
      logs: receipt.logs.map((log: any) => ({
        ...log,
        blockNumber: BigInt(log.blockNumber),
        logIndex: log.index,
        transactionIndex: log.transactionIndex,
      })),
      status: (receipt.status as number) === 1 ? 'success' : 'reverted',
      to: receipt.to as Address,
      transactionHash: (receipt as any).hash ?? (receipt as any).transactionHash,
      transactionIndex: (receipt as any).index,
    } as unknown as ViemTransactionReceipt
  }
}

/**
 * Type guard: returns true if the value is an ethers Provider.
 */
export function isEthersProvider(provider: any): provider is Provider {
  return provider && typeof provider.getBlockNumber === 'function'
}

/**
 * Type guard: returns true if the value is an ethers Signer.
 */
export function isEthersSigner(signer: any): signer is Signer {
  return signer && typeof signer.getAddress === 'function'
}

/**
 * Union of supported client types: viem Client/WalletClient, ethers Provider, or ethers Signer.
 */
export type SupportedClient = ViemClient | WalletClient | Provider | (Signer & { provider?: Provider })

/**
 * Attempts to adapt the provided client to a viem PublicClient if possible.
 * For ethers Provider/Signer, a Chain is required.
 */
function toViemPublicClient(client: SupportedClient, chain?: Chain): PublicClient | null {
  if ((client as any)?.transport) return client as any as PublicClient
  if (isEthersProvider(client)) {
    if (!chain) throw new Error('Chain is required to adapt an ethers Provider to a viem PublicClient')
    return ethersProviderToPublicClient(client, chain)
  }
  if (isEthersSigner(client)) {
    const provider = (client as any).provider as Provider | undefined
    if (provider && chain) return ethersProviderToPublicClient(provider, chain)
  }
  return null
}

/**
 * Attempts to adapt the provided client to a viem WalletClient if possible.
 * For ethers Signer, a Chain is required.
 */
async function toViemWalletClient(client: SupportedClient, chain?: Chain): Promise<WalletClient | null> {
  if ((client as any)?.account && (client as any)?.transport) return client as any as WalletClient
  if (isEthersSigner(client)) {
    if (!chain) throw new Error('Chain is required to adapt an ethers Signer to a viem WalletClient')
    return ethersSignerToWalletClient(client as any, chain)
  }
  return null
}

/**
 * Unified readContract that supports viem clients and ethers Provider/Signer.
 */
export async function readContractCompat(
  client: SupportedClient,
  args: Parameters<typeof viemReadContract>[1] & { chain?: Chain },
) {
  if (isEthersProvider(client) || isEthersSigner(client)) {
    const provider: Provider | undefined = (isEthersSigner(client) ? (client as any).provider : client) as Provider
    if (!provider) throw new Error('Unsupported client for readContract: signer has no provider')
    const contract = new Contract(args.address as Address, args.abi as any[], provider)
    return (contract as any)[(args as any).functionName](...(((args as any).args as any[]) || []))
  }
  const viemClient = toViemPublicClient(client, args.chain)
  if (!viemClient) throw new Error('Unsupported client for readContract')
  return viemReadContract(viemClient as any, args as any)
}

/**
 * Unified writeContract that supports viem WalletClient and ethers Signer.
 * Returns a transaction hash (Hex).
 */
export async function writeContractCompat(
  client: SupportedClient,
  args: Parameters<typeof viemWriteContract>[1] & { chain?: Chain },
) {
  if (isEthersSigner(client)) {
    const signer = client as Signer
    const contract = new Contract(args.address as Address, args.abi as any[], signer)
    const txResponse: TransactionResponse = await (contract as any)[(args as any).functionName](
      ...(((args as any).args as any[]) || []),
      {
        value: (args as any).value !== undefined ? (args as any).value.toString() : undefined,
        gasLimit: (args as any).gas,
        gasPrice: (args as any).gasPrice,
        nonce: (args as any).nonce,
      },
    )
    return txResponse.hash as Hex
  }
  const viemClient = await toViemWalletClient(client, args.chain)
  if (!viemClient) throw new Error('Unsupported client for writeContract')
  const { chain, ...rest } = args as any
  return viemWriteContract(viemClient as any, rest)
}

/**
 * Unified waitForTransactionReceipt that supports viem clients and ethers Provider/Signer.
 */
export async function waitForTransactionReceiptCompat(
  client: SupportedClient,
  args: Parameters<typeof viemWaitForTransactionReceipt>[1] & { chain?: Chain },
) {
  if (isEthersProvider(client) || isEthersSigner(client)) {
    const provider: Provider | undefined = (isEthersSigner(client) ? (client as any).provider : client) as Provider
    if (!provider) throw new Error('Unsupported client for waitForTransactionReceipt: signer has no provider')
    const maybe = await provider.waitForTransaction(
      (args as any).hash,
      (args as any).confirmations,
      (args as any).timeout,
    )
    if (!maybe) throw new Error('Transaction receipt not found')
    return formatEthersReceipt(maybe)
  }
  const viemClient = toViemPublicClient(client, args.chain) || (await toViemWalletClient(client, args.chain))
  if (!viemClient) throw new Error('Unsupported client for waitForTransactionReceipt')
  const { chain, ...rest } = args as any
  return viemWaitForTransactionReceipt(viemClient as any, rest)
}

/**
 * Unified getTransactionReceipt that supports viem clients and ethers Provider/Signer.
 */
export async function getTransactionReceiptCompat(
  client: SupportedClient,
  args: Parameters<typeof viemGetTransactionReceipt>[1] & { chain?: Chain },
) {
  if (isEthersProvider(client) || isEthersSigner(client)) {
    const provider: Provider | undefined = (isEthersSigner(client) ? (client as any).provider : client) as Provider
    if (!provider) throw new Error('Unsupported client for getTransactionReceipt: signer has no provider')
    const maybe = await provider.getTransactionReceipt((args as any).hash)
    if (!maybe) throw new Error('Transaction receipt not found')
    return formatEthersReceipt(maybe)
  }
  const viemClient = toViemPublicClient(client, args.chain) || (await toViemWalletClient(client, args.chain))
  if (!viemClient) throw new Error('Unsupported client for getTransactionReceipt')
  const { chain, ...rest } = args as any
  return viemGetTransactionReceipt(viemClient as any, rest)
}

/**
 * Unified getBlockNumber that supports viem clients and ethers Provider/Signer.
 */
export async function getBlockNumberCompat(client: SupportedClient, chain?: Chain) {
  if (isEthersProvider(client) || isEthersSigner(client)) {
    const provider: Provider | undefined = (isEthersSigner(client) ? (client as any).provider : client) as Provider
    if (!provider) throw new Error('Unsupported client for getBlockNumber: signer has no provider')
    const n = await provider.getBlockNumber()
    return BigInt(n)
  }
  const viemClient = toViemPublicClient(client, chain) || (await toViemWalletClient(client, chain))
  if (!viemClient) throw new Error('Unsupported client for getBlockNumber')
  return viemGetBlockNumber(viemClient as any)
}

/**
 * Unified getLogs that supports viem clients and ethers Provider/Signer. For ethers path,
 * builds topics from the provided AbiEvent and decodes using viem.parseEventLogs.
 */
export async function getLogsCompat(
  client: SupportedClient,
  args: Parameters<typeof viemGetLogs>[1] & { chain?: Chain },
) {
  if (isEthersProvider(client) || isEthersSigner(client)) {
    const provider: Provider | undefined = (isEthersSigner(client) ? (client as any).provider : client) as Provider
    if (!provider) throw new Error('Unsupported client for getLogs: signer has no provider')
    const abiEvent = (args as any).event as AbiEvent | undefined
    const address = (args as any).address as Address | undefined
    const fromBlock = (args as any).fromBlock ? ((args as any).fromBlock as bigint).toString() : undefined
    const toBlock = (args as any).toBlock ? ((args as any).toBlock as bigint).toString() : undefined
    const topics: (string | null)[] | undefined = abiEvent
      ? buildTopicsFromEventAndArgs(abiEvent, (args as any).args)
      : undefined
    const filter: any = { address, topics, fromBlock, toBlock }
    const logs = await provider.getLogs(filter)
    if (abiEvent) {
      const rpcLogs = logs.map(mapEthersLogToViemRpcLog)
      return parseEventLogs({ abi: [abiEvent] as any, logs: rpcLogs as any })
    }
    return logs.map((log: any) => ({ ...log, blockNumber: BigInt(log.blockNumber) }))
  }
  const viemClient = toViemPublicClient(client, args.chain)
  if (!viemClient) throw new Error('Unsupported client for getLogs')
  const { chain, ...rest } = args as any
  return viemGetLogs(viemClient as any, rest)
}

/**
 * Validates an address string using viem and returns it as Address.
 */
export function parseAddress(address: string | Address): Address {
  const a = address as string
  if (typeof address === 'string') {
    if (!isAddress(a) || isAddressEqual(a as Address, zeroAddress))
      throw new Error(`PARAMETER INPUT ERROR: Address ${a} is not valid`)
    return a as Address
  }
  return address as Address
}

/**
 * Coerces a chain selector into bigint.
 */
export function normalizeChainSelector(selector: string | number | bigint): bigint {
  if (typeof selector === 'bigint') return selector
  if (typeof selector === 'number') return BigInt(selector)
  return BigInt(selector)
}

/**
 * Normalizes an ethers TransactionReceipt to viem's TransactionReceipt shape.
 */
function formatEthersReceipt(receipt: EthersTxReceipt): ViemTransactionReceipt {
  return {
    ...receipt,
    blockNumber: BigInt(receipt.blockNumber),
    cumulativeGasUsed: BigInt(receipt.cumulativeGasUsed),
    effectiveGasPrice: BigInt(((receipt as any).effectiveGasPrice ?? (receipt as any).gasPrice)?.toString() || '0'),
    gasUsed: BigInt(receipt.gasUsed),
    logs: receipt.logs.map((log: any) => ({
      ...log,
      blockNumber: BigInt(log.blockNumber),
      logIndex: log.index,
      transactionIndex: log.transactionIndex,
    })),
    status: (receipt.status as number) === 1 ? 'success' : 'reverted',
    to: receipt.to as Address,
    transactionHash: (receipt as any).hash ?? (receipt as any).transactionHash,
    transactionIndex: (receipt as any).index,
  } as unknown as ViemTransactionReceipt
}

/**
 * Builds a topics array for an event filter based on the AbiEvent and provided indexed args.
 */
function buildTopicsFromEventAndArgs(
  event: AbiEvent,
  providedArgs?: Record<string, any> | undefined,
): (string | null)[] {
  const signature = `${event.name}(${event.inputs.map((i) => i.type).join(',')})`
  // keccak256 of the string signature
  const topic0 = keccak256(toHex(signature))
  if (!providedArgs) return [topic0]
  const topics: (string | null)[] = [topic0]
  for (const input of event.inputs) {
    if (!input.indexed) continue
    const name = (input as any).name as string | undefined
    const value = name ? (providedArgs as any)[name] : undefined
    let encoded: string | null = null
    if (value !== undefined && value !== null) {
      if (typeof value === 'string' && value.startsWith('0x')) {
        encoded = value
      } else if (input.type === 'address' && typeof value === 'string') {
        encoded = value
      } else if (input.type.startsWith('uint') || input.type.startsWith('int')) {
        encoded = '0x' + BigInt(value).toString(16).padStart(64, '0')
      }
    }
    topics.push(encoded)
  }
  return topics
}

/**
 * Maps an ethers log into a viem RpcLog-like shape expected by viem.parseEventLogs.
 */
function mapEthersLogToViemRpcLog(log: any) {
  return {
    address: log.address,
    blockHash: log.blockHash ?? null,
    blockNumber: log.blockNumber ? '0x' + BigInt(log.blockNumber).toString(16) : null,
    data: log.data,
    logIndex: log.index != null ? '0x' + BigInt(log.index).toString(16) : null,
    transactionHash: log.transactionHash ?? null,
    transactionIndex: log.transactionIndex != null ? '0x' + BigInt(log.transactionIndex).toString(16) : null,
    removed: false,
    topics: log.topics,
  }
}
