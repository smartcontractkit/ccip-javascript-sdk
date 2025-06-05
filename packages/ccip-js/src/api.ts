import * as Viem from 'viem'

import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
  getLogs,
  getTransactionReceipt as getTxReceipt,
  getBlockNumber,
} from 'viem/actions'

import RouterABI from './abi/Router.json'
import OnRampABI from './abi/OnRamp.json'
import OnRampABI_1_6 from './abi/OnRamp_1_6.json'
import IERC20ABI from './abi/IERC20Metadata.json'
import TokenPoolABI from './abi/TokenPool.json'
import TokenAdminRegistryABI from './abi/TokenAdminRegistry.json'
import { TRANSFER_STATUS_FROM_BLOCK_SHIFT, ExecutionStateChangedABI } from './config'
import { parseAbi } from 'viem'

export { IERC20ABI }

/** An object containing methods for cross-chain transfer management.
 *  @typedef {Object} Client */
export interface Client {
  /**
   *  @param {Viem.WalletClient} options.client - A client with access to wallet actions on the source blockchain.
   *  @param {Viem.Address} options.routerAddress - The address of the router contract on the source blockchain.
   *  @param {Viem.Address} options.tokenAddress - The address of the token contract on the source blockchain.
   *  @param {bigint} options.amount - The amount of tokens to transfer, specified as a `bigint`.
   *  @param {boolean} options.waitForReceipt - Should you wait the transaction to be included in a block.
   *  @param {Object} options.writeContractParameters
   *  - Override the **optional** write contract parameters for the 'approve' method.
   *  @param {Object} options.waitForTransactionReceiptParameters
   *  - Override waitForTransactionReceipt parameters.
   *  @returns {Promise<{ txHash: Viem.Hash, txReceipt?: Viem.TransactionReceipt }>} A promise that resolves
   *                                                        to an object containing the transaction hash (`txHash`)
   *                                                        and optionally a transaction receipt (`txReceipt`)
   *                                                        if options.waitForReceipt was set to `true`.
   *                                                        These details are used to track and confirm the transfer.
   *  @example
   *  import { createWalletClient, custom } from 'viem'
   *  import { mainnet } from 'viem/chains'
   *
   *  const walletClient = createWalletClient({
   *    chain: mainnet,
   *    transport: custom(window.ethereum!)
   *  })
   *
   *  const { txHash } = await client.approveRouter({
   *    client: walletClient,
   *    routerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *    tokenAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *    amount: 1000000000000000000n,
   *  });
   *
   *  @example
   *  import { createWalletClient, custom } from 'viem'
   *  import { mainnet } from 'viem/chains'
   *
   *  const walletClient = createWalletClient({
   *    chain: mainnet,
   *    transport: custom(window.ethereum!)
   *  })
   *
   *  const { txHash, txReceipt } = await client.approveRouter({
   *    client: walletClient,
   *    routerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *    tokenAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *    amount: 1000000000000000000n,
   *    waitForReceipt: true,
   *  });
   */
  approveRouter(options: {
    client: Viem.WalletClient
    routerAddress: Viem.Address
    tokenAddress: Viem.Address
    amount: bigint
    waitForReceipt?: boolean
    writeContractParameters?: Partial<{
      gas: bigint
      gasPrice: bigint
      nonce: number
    }>
    waitForTransactionReceiptParameters?: Partial<{
      confirmations: number
      pollingInterval: number
    }>
  }): Promise<{ txHash: Viem.Hash; txReceipt?: Viem.TransactionReceipt }>

  /** Retrieve the allowance of a specified account for a cross-chain transfer.
   *  @param {Viem.Client} options.client - A client with access to public actions on the source blockchain.
   *  @param {Viem.Address} options.routerAddress - The address of the router contract on the source blockchain.
   *  @param {Viem.Address} options.tokenAddress - The address of the token contract on the source blockchain.
   *  @param {Viem.Address} options.account - The address of the account for which the allowance is being queried.
   *                             This is the account that needs to have sufficient allowance to proceed
   *                             with the transfer.
   *  @returns {Promise<bigint>} A promise that resolves to a `bigint` representing the amount of
   *                              allowance granted to the specified account. This value indicates
   *                              how much the account is allowed to transfer or spend.
   *  @example
   *  import { createPublicClient, http } from 'viem'
   *  import { mainnet } from 'viem/chains'
   *
   *  const publicClient = createPublicClient({
   *    chain: mainnet,
   *    transport: http()
   *  })
   *
   *  const allowance = await client.getAllowance({
   *    client: publicClient,
   *    routerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *    tokenAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *    account: "0x1234567890abcdef1234567890abcdef12345678",
   *  })
   */
  getAllowance(options: {
    client: Viem.Client
    routerAddress: Viem.Address
    tokenAddress: Viem.Address
    account: Viem.Address
  }): Promise<bigint>

  /**
   * Retrieve the onRamp contract address from a router contract
   * @param {Viem.Client} options.client - A client with access to public actions on the source blockchain.
   * @param {Viem.Address} options.routerAddress - The address of the router contract on the source blockchain.
   * @param {string} options.destinationChainSelector - The selector for the destination chain.
   * @returns {Promise<Viem.Address>} - A promise that resolves to a string, representing the onRamp contract address
   * @example
   *  import { createPublicClient, http } from 'viem'
   *  import { mainnet } from 'viem/chains'
   *
   *  const publicClient = createPublicClient({
   *    chain: mainnet,
   *    transport: http()
   *  })
   *
   * const onRampAddress = await client.getOnRampAddress({
   *   client: publicClient
   *   routerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *   destinationChainSelector: "1234"
   * })
   */
  getOnRampAddress(options: {
    client: Viem.Client
    routerAddress: Viem.Address
    destinationChainSelector: string
  }): Promise<Viem.Address>

  /** Get a list of supported fee tokens for provided lane for the cross-chain transfer.
   * @param {Viem.Client} options.client - A client with access to public actions on the source blockchain.
   * @param {Viem.Address} options.routerAddress - The address of the router contract on the source blockchain.
   * @param {string} options.destinationChainSelector - The selector for the destination chain.
   * @returns {Promise<Viem.Address[]>} A promise that resolves to an array of ERC-20 token addresses that
   *                                    can be used to pee the transfer fee on a given lane.
   * @example
   *  import { createPublicClient, http } from 'viem'
   *  import { mainnet } from 'viem/chains'
   *
   *  const publicClient = createPublicClient({
   *    chain: mainnet,
   *    transport: http()
   *  })
   *
   * const feeTokens = await client.getSupportedFeeTokens({
   *   client: publicClient
   *   routerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *   destinationChainSelector: "1234"
   * });
   */
  getSupportedFeeTokens(options: {
    client: Viem.Client
    routerAddress: Viem.Address
    destinationChainSelector: string
  }): Promise<Viem.Address[]>

  /** Retrieve the rate refill limits for the specified lane.
   * @param {Viem.Client} options.client - A client with access to public actions on the source blockchain.
   * @param {Viem.Address} options.routerAddress - The address of the router contract on the source blockchain.
   * @param {string} options.destinationChainSelector - The selector for the destination chain.
   * @returns {Promise<RateLimiterState>} A promise that resolves to the current state of the
   *                                          lane rate limiter, including token balance, capacity,
   *                                          and refill rate.
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const publicClient = createPublicClient({
   *   chain: mainnet,
   *   transport: http()
   * })
   *
   * const { tokens, lastUpdated, isEnabled, capacity, rate } = await client.getLaneRateRefillLimits({
   *   client: publicClient,
   *   routerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *   destinationChainSelector: "1234"
   * });
   */
  getLaneRateRefillLimits(options: {
    client: Viem.Client
    routerAddress: Viem.Address
    destinationChainSelector: string
  }): Promise<RateLimiterState>

  /** Retrieve the rate refill limits for the specified token.
   * @param {Viem.Client} options.client - A client with access to public actions on the source blockchain.
   * @param {Viem.Address} options.routerAddress - The address of the router contract on the source blockchain.
   * @param {number} options.supportedTokenAddress - The address of the token (supported by this lane) to check limits for.
   * @param {string} options.destinationChainSelector - The selector for the destination chain.
   * @returns {Promise<RateLimiterState>} A promise that resolves to the current state of the
   *                                          lane rate limiter, including token balance, capacity,
   *                                          and refill rate.
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const publicClient = createPublicClient({
   *   chain: mainnet,
   *   transport: http()
   * })
   *
   * const { tokens, lastUpdated, isEnabled, capacity, rate } = await client.getTokenRateLimitByLane({
   *   client: publicClient,
   *   routerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *   supportedTokenAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *   destinationChainSelector: "1234"
   * });
   */
  getTokenRateLimitByLane(options: {
    client: Viem.Client
    routerAddress: Viem.Address
    supportedTokenAddress: Viem.Address
    destinationChainSelector: string
  }): Promise<RateLimiterState>

  /** Get the fee required for the cross-chain transfer and/or sending cross-chain message.
   * @param {Viem.Client} options.client - A client with access to public actions on the source blockchain.
   * @param {Viem.Address} options.routerAddress - The address of the router contract on the source blockchain.
   * @param {Viem.Address} options.destinationAccount - The address of the recipient account on the destination blockchain.
   * @param {string} options.destinationChainSelector - The selector for the destination chain.
   * @param {bigint} options.amount - The amount of tokens to transfer, specified as a `bigint`.
   * @param {Viem.Address} options.tokenAddress - The address of the token contract on the source blockchain.
   * @param {Viem.Address} options.feeTokenAddress - The address of the token used for paying fees. If not specified the chain's native token will be used.
   * @param {Viem.Hex} options.data - Arbitrary message to send, ABI encoded
   * @param {EVMExtraArgsV2} options.extraArgs - Pass extraArgs. Check [CCIP Docs](https://docs.chain.link/ccip/best-practices#using-extraargs) how to use it
   * @returns {Promise<bigint>} A promise that resolves to a number representing the fee required
   *                            for the transfer. The fee is typically expressed in the smallest unit
   *                            of the token or currency used.
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const publicClient = createPublicClient({
   *   chain: mainnet,
   *   transport: http()
   * })
   *
   * const fee = await client.getFee({
   *   client: publicClient,
   *   routerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *   destinationAccount: "0x1234567890abcdef1234567890abcdef12345678",
   *   destinationChainSelector: "1234"
   *   amount: 1000000000000000000n,
   *   tokenAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   * });
   */
  getFee(options: {
    client: Viem.Client
    routerAddress: Viem.Address
    destinationAccount: Viem.Address
    destinationChainSelector: string
    amount?: bigint
    tokenAddress?: Viem.Address
    feeTokenAddress?: Viem.Address
    data?: Viem.Hex
    extraArgs?: EVMExtraArgsV2
  }): Promise<bigint>

  /** * Retrieve the token admin registry contract address from an onRamp contract
   * @param {Viem.Client} options.client - A client with access to public actions on the source blockchain.
   * @param {Viem.Address} options.routerAddress - The address of the router contract on the source blockchain.
   * @param {string} options.destinationChainSelector - The selector for the destination chain.
   * @param {Viem.Address} options.tokenAddress - The address of the token contract on the source blockchain.
   * @returns {Promise<boolean>} A promise that resolves to the Token Admin Registry Contract address on the source chain.
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const publicClient = createPublicClient({
   *   chain: mainnet,
   *   transport: http()
   * })
   *
   * const tokenAdminRegistryAddress = await client.getTokenAdminRegistry({
   *  client: publicClient,
   *  routerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *  destinationChainSelector: "1234",
   *  tokenAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   * });
   */
  getTokenAdminRegistry(options: {
    client: Viem.Client
    routerAddress: Viem.Address
    destinationChainSelector: string
    tokenAddress: Viem.Address
  }): Promise<Viem.Address>

  /** Check if the token is supported on the destination chain.
   * @param {Viem.Client} options.client - A client with access to public actions on the source blockchain.
   * @param {Viem.Address} options.routerAddress - The address of the router contract on the source blockchain.
   * @param {string} options.destinationChainSelector - The selector for the destination chain.
   * @param {Viem.Address} options.tokenAddress - The address of the token contract on the source blockchain.
   * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether the token
   *                            is supported on the destination chain.
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const publicClient = createPublicClient({
   *   chain: mainnet,
   *   transport: http()
   * })
   *
   * const isTokenSupported = await client.isTokenSupported({
   *  client: publicClient,
   *  routerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *  destinationChainSelector: "1234",
   *  tokenAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   * });
   */
  isTokenSupported(options: {
    client: Viem.Client
    routerAddress: Viem.Address
    destinationChainSelector: string
    tokenAddress: Viem.Address
  }): Promise<boolean>

  /** Initiate the token transfer and returns the transaction hash and message ID.
   * @param {Viem.WalletClient} options.client - A client with access to wallet actions on the source blockchain.
   * @param {Viem.Address} options.routerAddress - The address of the router contract on the source blockchain.
   * @param {string} options.destinationChainSelector - The selector for the destination chain.
   * @param {bigint} options.amount - Amount to transfer.
   * @param {Viem.Address} options.destinationAccount - Address of recipient.
   * @param {Viem.Address} options.tokenAddress - Address of transferred token.
   * @param {Viem.Address} options.feeTokenAddress - The address of the token used for paying fees. If not specified the chain's native token will be used.
   * @param {Viem.Hex} options.data - Arbitrary data to send along with the transaction. ABI encoded
   * @param {EVMExtraArgsV2} options.extraArgs - Pass extraArgs. Check [CCIP Docs](https://docs.chain.link/ccip/best-practices#using-extraargs) how to use it
   * @param {Object} options.writeContractParameters
   *  - Override the **optional** write contract parameters for the 'approve' method.
   * @param {Object} options.waitForTransactionReceiptParameters
   *  - Override waitForTransactionReceipt parameters.
   * @returns {Promise<{ txHash: Viem.Hash, messageId: Viem.Hash, txReceipt?: Viem.TransactionReceipt }>} A promise
   *                                                        that resolves to an object containing the transaction
   *                                                        hash (`txHash`) and message ID (`messageId`) and transaction
   *                                                        receipt (`txReceipt`).
   *                                                        These details are used to track and confirm the transfer.
   * @example
   *  import { createWalletClient, custom, encodeAbiParameters } from 'viem'
   *  import { mainnet } from 'viem/chains'
   *
   *  const walletClient = createWalletClient({
   *    chain: mainnet,
   *    transport: custom(window.ethereum!)
   *  })
   *
   * const { txHash, messageId } = await client.transferTokens({
   *   client: walletClient,
   *   routerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *   destinationChainSelector: "1234"
   *   amount: 1000000000000000000n,
   *   destinationAccount: "0x1234567890abcdef1234567890abcdef12345678",
   *   tokenAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *   data: encodeAbiParameters([{ type: 'string', name: 'data' }], ["Hello"])
   * });
   *
   */
  transferTokens(options: {
    client: Viem.WalletClient
    routerAddress: Viem.Address
    destinationChainSelector: string
    amount: bigint
    destinationAccount: Viem.Address
    tokenAddress: Viem.Address
    feeTokenAddress?: Viem.Address
    data?: Viem.Hex
    extraArgs?: EVMExtraArgsV2
    writeContractParameters?: Partial<{
      gas: bigint
      gasPrice: bigint
      nonce: number
    }>
    waitForTransactionReceiptParameters?: Partial<{
      confirmations: number
      pollingInterval: number
    }>
  }): Promise<{ txHash: Viem.Hash; messageId: Viem.Hash; txReceipt: Viem.TransactionReceipt }>

  /** Send arbitrary message through CCIP. The message should be ABI encoded data.
   * It can be encoded via `viem`'s `encodeAbiParameters` data.
   * Check [encodeAbiParameters](https://viem.sh/docs/abi/encodeAbiParameters.html) and [ABI specification](https://docs.soliditylang.org/en/latest/abi-spec.html) for more information
   * @param {Viem.WalletClient} options.client - A client with access to wallet actions on the source blockchain.
   * @param {Viem.Address} options.routerAddress - The address of the router contract on the source blockchain.
   * @param {string} options.destinationChainSelector - The selector for the destination chain.
   * @param {Viem.Address} options.destinationAccount - Address of recipient.
   * @param {Viem.Address} options.feeTokenAddress - The address of the token used for paying fees. If not specified the chain's native token will be used.
   * @param {Viem.Hex} options.data - Arbitrary message to send, ABI encoded
   * @param {EVMExtraArgsV2} options.extraArgs - Pass extraArgs. Check [CCIP Docs](https://docs.chain.link/ccip/best-practices#using-extraargs) how to use it
   * @param {Object} options.writeContractParameters
   *  - Override the **optional** write contract parameters for the 'approve' method.
   * @param {Object} options.waitForTransactionReceiptParameters
   *  - Override waitForTransactionReceipt parameters.
   * @returns {Promise<{ txHash: Viem.Hash, messageId: Viem.Hash, txReceipt?: Viem.TransactionReceipt }>} A promise
   *                                                        that resolves to an object containing the transaction
   *                                                        hash (`txHash`) and message ID (`messageId`) and transaction
   *                                                        receipt (`txReceipt`).
   *                                                        These details are used to track and confirm the transfer.
   * @example
   *  import { createWalletClient, custom, encodeAbiParameters, encodeFunctionData, erc20Abi, parseEther } from 'viem'
   *  import { mainnet } from 'viem/chains'
   *
   *  const walletClient = createWalletClient({
   *    chain: mainnet,
   *    transport: custom(window.ethereum!)
   *  })
   *
   * //Send string message
   * const { txHash, messageId } = await client.transferTokens({
   *   client: walletClient,
   *   routerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *   destinationChainSelector: "1234"
   *   destinationAccount: "0x1234567890abcdef1234567890abcdef12345678",
   *   data: encodeAbiParameters([{ type: 'string', name: 'data' }], ["Hello"])
   * });
   *
   * //Send function data
   * const { txHash, messageId } = await client.transferTokens({
   *   client: walletClient,
   *   routerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *   destinationChainSelector: "1234"
   *   destinationAccount: "0x1234567890abcdef1234567890abcdef12345678",
   *   data: encodeFunctionData({
   *     abi: erc20Abi,
   *     functionName: 'transfer',
   *     args: ["0x1234567890abcdef1234567890abcdef12345678", parseEther('0.1')],
   *   })
   * });
   *
   */
  sendCCIPMessage(options: {
    client: Viem.WalletClient
    routerAddress: Viem.Address
    destinationChainSelector: string
    destinationAccount: Viem.Address
    feeTokenAddress?: Viem.Address
    data?: Viem.Hex
    extraArgs?: EVMExtraArgsV2
    writeContractParameters?: Partial<{
      gas: bigint
      gasPrice: bigint
      nonce: number
    }>
    waitForTransactionReceiptParameters?: Partial<{
      confirmations: number
      pollingInterval: number
    }>
  }): Promise<{ txHash: Viem.Hash; messageId: Viem.Hash; txReceipt: Viem.TransactionReceipt }>

  /** Retrieve the status of a cross-chain transfer based on the message ID.
   * @param {Viem.Client} options.client - A client with access to public actions on the destination blockchain.
   * @param {Viem.Address} options.destinationRouterAddress - The address of the router contract on the destination blockchain.
   * @param {Viem.Chain} options.destinationChain - The destination blockchain.
   * @param {string} options.sourceChainSelector - The selector for the source chain.
   * @param {Viem.Hash} options.messageId - The unique identifier of the cross-chain transfer message.
   * @param {bigint} options.fromBlockNumber - The block number to start searching for logs.
   * @returns {Promise<TransferStatus | null>} A promise that resolves to the status of the cross-chain transfer.
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { polygon } from 'viem/chains'
   *
   * const publicClient = createPublicClient({
   *   chain: polygon,
   *   transport: http()
   * })
   *
   * const status = await client.getTransferStatus({
   *   client: publicClient,
   *   destinationRouterAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   *   sourceChainSelector: "1234",
   *   messageId: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
   * });
   */
  getTransferStatus(options: {
    client: Viem.Client
    destinationRouterAddress: Viem.Address
    sourceChainSelector: string
    messageId: Viem.Hash
    fromBlockNumber?: bigint
  }): Promise<TransferStatus | null>

  /** Retrieve the transaction receipt based on the transaction hash.
   * @param {Viem.Client} options.client - A client with access to public actions
   * @param {Viem.Hash} options.hash - The transaction hash of the cross-chain transfer. This unique identifier
   *                      is used to locate and retrieve the transaction receipt.
   * @returns {Promise<Viem.TransactionReceipt>} A promise that resolves to the transaction
   *                          receipt. The receipt contains detailed information about the transaction,
   *                          including its status, gas usage, logs, and other relevant data.
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const publicClient = createPublicClient({
   *   chain: mainnet,
   *   transport: http()
   * })
   *
   * const receipt = await client.getTransactionReceipt({
   *   client: publicClient,
   *   hash: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef"
   * });
   */
  getTransactionReceipt(options: { client: Viem.Client; hash: Viem.Hash }): Promise<Viem.TransactionReceipt>
}

/**
 * Creates a client for managing cross-chain transfers, configured for either testnet or mainnet environments.
 *
 * The `createClient` function initializes and returns a client object tailored for interacting with cross-chain
 * transfer functionalities. The function also allows for custom CCIP routers to be provided, with
 * sensible defaults based on the environment.
 *
 * @function createClient
 * @returns {Client} The client object with methods for cross-chain transfer management.
 *
 * @example
 * // Example usage of createClient function
 * import * as CCIP from '@chainlink/ccip-js';
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const ccipClient = CCIP.createClient();
 *
 * const publicClient = createPublicClient({
 *  chain: mainnet,
 *  transport: http()
 * })
 *
 * const walletClient = createWalletClient({
 *  chain: mainnet,
 *  transport: custom(window.ethereum!)
 * })
 *
 * const { txHash, txReceipt } = await ccipClient.approve({
 *  client: walletClient,
 *  routerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
 *  tokenAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
 *  amount: 1000000000000000000n,
 *  waitForReceipt: true,
 * });
 *
 * console.log(`Transfer approved. Transaction hash: ${txHash}. Transaction receipt: ${txReceipt}`);
 *
 * const fee = await ccipClient.getFee({
 *  client: publicClient,
 *  routerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
 *  tokenAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
 *  amount: 1000000000000000000n,
 *  destinationAccount: "0x1234567890abcdef1234567890abcdef12345678",
 *  destinationChainSelector: "1234"
 * });
 *
 * console.log(`Fee: ${fee.toLocaleString()}`);
 *
 * const { txHash, messageId } = await client.transferTokens({
 *  client: walletClient,
 *  routerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
 *  tokenAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
 *  amount: 1000000000000000000n,
 *  destinationAccount: "0x1234567890abcdef1234567890abcdef12345678",
 *  destinationChainSelector: "1234"
 * });
 *
 * console.log(`Transfer success. Transaction hash: ${txHash}. Message ID: ${messageId}`)
 */
export const createClient = (): Client => {
  return {
    approveRouter,
    getAllowance,
    getOnRampAddress,
    getSupportedFeeTokens,
    getLaneRateRefillLimits,
    getTokenRateLimitByLane,
    getFee,
    getTokenAdminRegistry,
    isTokenSupported,
    transferTokens,
    sendCCIPMessage,
    getTransferStatus,
    getTransactionReceipt,
  }

  async function approveRouter(options: Parameters<Client['approveRouter']>[0]) {
    checikIsWalletAccountValid(options)

    checkIsAddressValid(
      options.routerAddress,
      `PARAMETER INPUT ERROR: Router address ${options.routerAddress} is not valid`,
    )
    checkIsAddressValid(
      options.tokenAddress,
      `PARAMETER INPUT ERROR: Token address ${options.tokenAddress} is not valid`,
    )

    if (options.amount < BigInt(0)) {
      throw new Error('PARAMETER INPUT ERROR: Invalid approve amount. Amount can not be negative')
    }

    const approveTxHash = await writeContract(options.client, {
      chain: options.client.chain,
      account: options.client.account!,
      abi: IERC20ABI,
      address: options.tokenAddress,
      functionName: 'approve',
      args: [options.routerAddress, options.amount],
      ...options.writeContractParameters,
    })

    if (!options.waitForReceipt) {
      return { txHash: approveTxHash }
    }

    const txReceipt = await waitForTransactionReceipt(options.client, {
      hash: approveTxHash,
      confirmations: 2,
      ...options.waitForTransactionReceiptParameters,
    })

    return { txHash: approveTxHash, txReceipt: txReceipt as Viem.TransactionReceipt }
  }

  async function getAllowance(options: Parameters<Client['getAllowance']>[0]) {
    checkIsAddressValid(
      options.routerAddress,
      `PARAMETER INPUT ERROR: Router address ${options.routerAddress} is not valid`,
    )
    checkIsAddressValid(
      options.tokenAddress,
      `PARAMETER INPUT ERROR: Token address ${options.tokenAddress} is not valid`,
    )
    checkIsAddressValid(options.account, `PARAMETER INPUT ERROR: Account address ${options.account} is not valid`)

    const allowance = await readContract(options.client, {
      abi: IERC20ABI,
      address: options.tokenAddress,
      functionName: 'allowance',
      args: [options.account, options.routerAddress],
    })
    return allowance as bigint
  }

  async function getOnRampAddress(options: Parameters<Client['getOnRampAddress']>[0]) {
    checkIsAddressValid(
      options.routerAddress,
      `PARAMETER INPUT ERROR: Router address ${options.routerAddress} is not valid`,
    )

    const onRampAddress = (await readContract(options.client, {
      abi: RouterABI,
      address: options.routerAddress,
      functionName: 'getOnRamp',
      args: [options.destinationChainSelector],
    })) as Viem.Address

    checkIsAddressValid(
      onRampAddress,
      'CONTRACT CALL ERROR: OnRamp address is not valid. Execution can not be continued',
    )

    return onRampAddress
  }

  async function getSupportedFeeTokens(options: Parameters<Client['getSupportedFeeTokens']>[0]) {
    const onRampAddress = await getOnRampAddress(options)

    const dynamicConfig = await readContract(options.client, {
      abi: OnRampABI,
      address: onRampAddress,
      functionName: 'getDynamicConfig',
    })

    const typeAndVersion = await readContract(options.client, {
      abi: OnRampABI,
      address: onRampAddress,
      functionName: 'typeAndVersion',
    })

    console.info('getSupportedFeeTokens():  CCIP type and version: ', typeAndVersion)

    let priceRegistryOrFeeQuoter
    if (typeAndVersion === 'EVM2EVMOnRamp 1.5.0') {
      priceRegistryOrFeeQuoter = (dynamicConfig as DynamicConfig).priceRegistry
    } else {
      priceRegistryOrFeeQuoter = (dynamicConfig as DynamicConfig).feeQuoter
    }

    checkIsAddressValid(
      priceRegistryOrFeeQuoter as Viem.Address,
      `CONTRACT CALL ERROR: Price regisry '${priceRegistryOrFeeQuoter}' is not valid. Execution can not be continued`,
    )

    const feeTokens = await readContract(options.client, {
      abi: parseAbi(['function getFeeTokens() returns (address[] feeTokens)']), // same signature for both PriceRegistry and FeeQuoter
      address: priceRegistryOrFeeQuoter as Viem.Address,
      functionName: 'getFeeTokens',
    })
    return feeTokens as Viem.Address[]
  }

  async function getLaneRateRefillLimits(options: Parameters<Client['getLaneRateRefillLimits']>[0]) {
    const onRampAddress = await getOnRampAddress(options)

    const currentRateLimiterState = await readContract(options.client, {
      abi: OnRampABI,
      address: onRampAddress,
      functionName: 'currentRateLimiterState',
    })
    return currentRateLimiterState as RateLimiterState
  }

  async function getTokenRateLimitByLane(options: Parameters<Client['getTokenRateLimitByLane']>[0]) {
    checkIsAddressValid(
      options.supportedTokenAddress,
      `PARAMETER INPUT ERROR: Token address ${options.supportedTokenAddress} is not valid. Execution can not be continued`,
    )

    const onRampAddress = await getOnRampAddress(options)

    const laneTokenTransferPool = (await readContract(options.client, {
      abi: OnRampABI,
      address: onRampAddress,
      functionName: 'getPoolBySourceToken',
      args: [options.destinationChainSelector, options.supportedTokenAddress],
    })) as Viem.Address

    checkIsAddressValid(
      laneTokenTransferPool,
      `CONTRACT CALL ERROR: Token pool for ${options.supportedTokenAddress} is missing. Execution can not be continued`,
    )

    const transferPoolTokenOutboundLimit = await readContract(options.client, {
      abi: TokenPoolABI,
      address: laneTokenTransferPool as Viem.Address,
      functionName: 'getCurrentOutboundRateLimiterState',
      args: [options.destinationChainSelector],
    })

    return transferPoolTokenOutboundLimit as RateLimiterState
  }

  async function getFee(options: Parameters<Client['getFee']>[0]) {
    checkIsAddressValid(
      options.routerAddress,
      `PARAMETER INPUT ERROR: Router address ${options.routerAddress} is not valid`,
    )

    if (options.amount && options.amount < BigInt(0)) {
      throw new Error('PARAMETER INPUT ERROR: Invalid amount. Amount can not be negative')
    }

    if (!Viem.isAddress(options.destinationAccount)) {
      throw new Error(
        `PARAMETER INPUT ERROR: ${options.destinationAccount} is not a valid destionation account address`,
      )
    }

    if (options.tokenAddress) {
      checkIsAddressValid(
        options.tokenAddress,
        `PARAMETER INPUT ERROR: Token address ${options.tokenAddress} is not valid`,
      )
    }

    if (options.feeTokenAddress) {
      if (!Viem.isAddress(options.feeTokenAddress)) {
        throw new Error(`PARAMETER INPUT ERROR: ${options.feeTokenAddress} is not a valid fee token address`)
      }
    }

    return (await readContract(options.client, {
      abi: RouterABI,
      address: options.routerAddress,
      functionName: 'getFee',
      args: buildArgs(options),
    })) as bigint
  }

  async function getTokenAdminRegistry(options: Parameters<Client['getTokenAdminRegistry']>[0]) {
    if (!Viem.isAddress(options.tokenAddress) || Viem.isAddressEqual(options.tokenAddress, Viem.zeroAddress)) {
      throw new Error(`PARAMETER INPUT ERROR: Token address ${options.tokenAddress} is not valid`)
    }

    const onRampAddress = await getOnRampAddress(options)

    const staticConfig = await readContract(options.client, {
      abi: OnRampABI,
      address: onRampAddress,
      functionName: 'getStaticConfig',
    })

    const tokenAdminRegistryAddress = (staticConfig as StaticConfig).tokenAdminRegistry

    checkIsAddressValid(
      tokenAdminRegistryAddress,
      'CONTRACT CALL ERROR: Token admin registry address is not valid. Execution can not be continued',
    )
    return tokenAdminRegistryAddress
  }

  async function isTokenSupported(options: Parameters<Client['isTokenSupported']>[0]) {
    const tokenAdminRegistryAddress = await getTokenAdminRegistry(options)

    const tokenPoolAddress = (await readContract(options.client, {
      abi: TokenAdminRegistryABI,
      address: tokenAdminRegistryAddress,
      functionName: 'getPool',
      args: [options.tokenAddress],
    })) as Viem.Address

    if (!Viem.isAddress(tokenPoolAddress) || Viem.isAddressEqual(tokenPoolAddress, Viem.zeroAddress)) {
      return false
    }

    const isSupported = (await readContract(options.client, {
      abi: TokenPoolABI,
      address: tokenPoolAddress,
      functionName: 'isSupportedChain',
      args: [options.destinationChainSelector],
    })) as boolean

    return isSupported
  }

  async function transferTokens(options: Parameters<Client['transferTokens']>[0]) {
    checikIsWalletAccountValid(options)

    if (!options.amount || options.amount <= BigInt(0)) {
      throw new Error('PARAMETER INPUT ERROR: Invalid amount. Amount must be greater than 0')
    }

    if (!Viem.isAddress(options.destinationAccount)) {
      throw new Error(
        `PARAMETER INPUT ERROR: ${options.destinationAccount} is not a valid destionation account address`,
      )
    }

    if (options.feeTokenAddress) {
      if (!Viem.isAddress(options.feeTokenAddress)) {
        throw new Error(`PARAMETER INPUT ERROR: ${options.feeTokenAddress} is not a valid fee token address`)
      }
    }

    const writeContractParameters = {
      chain: options.client.chain,
      abi: RouterABI,
      address: options.routerAddress,
      functionName: 'ccipSend',
      args: buildArgs(options),
      account: options.client.account!,
      ...(!options.feeTokenAddress && {
        value: await getFee(options),
      }),
      ...options.writeContractParameters,
    }

    const transferTokensTxHash = await writeContract(options.client, writeContractParameters)

    const txReceipt = await waitForTransactionReceipt(options.client, {
      hash: transferTokensTxHash,
      confirmations: 2,
      ...options.waitForTransactionReceiptParameters,
    })

    const onRamp = await getOnRampAddress(options)
    const typeAndVersion = await readContract(options.client, {
      abi: parseAbi(['function typeAndVersion() returns (string)']),
      address: onRamp,
      functionName: 'typeAndVersion',
    })

    console.info('transferTokens():  CCIP type and version: ', typeAndVersion)

    const eventName = typeAndVersion === 'EVM2EVMOnRamp 1.5.0' ? 'CCIPSendRequested' : 'CCIPMessageSent'
    const abi = typeAndVersion === 'EVM2EVMOnRamp 1.5.0' ? OnRampABI : OnRampABI_1_6

    const parsedLog = Viem.parseEventLogs({
      abi: abi,
      logs: txReceipt.logs,
      eventName: eventName,
    }) as CCIPTransferReceipt[]

    let messageId

    if (typeAndVersion === 'EVM2EVMOnRamp 1.5.0') {
      messageId = parsedLog[0]?.args?.message?.messageId
    } else {
      messageId = parsedLog[0]?.args?.message?.header?.messageId
    }

    if (!messageId) {
      throw new Error('EVENTS LOG ERROR: Message ID not found in the transaction logs')
    }

    return {
      txHash: transferTokensTxHash,
      messageId: messageId,
      txReceipt: txReceipt as Viem.TransactionReceipt,
    }
  }

  async function sendCCIPMessage(options: Parameters<Client['sendCCIPMessage']>[0]) {
    checikIsWalletAccountValid(options)
    checkIsAddressValid(options.routerAddress, `Router address ${options.routerAddress} is not valid`)

    if (!Viem.isAddress(options.destinationAccount)) {
      throw new Error(`${options.destinationAccount} is not a valid destionation account address`)
    }

    if (options.feeTokenAddress) {
      if (!Viem.isAddress(options.feeTokenAddress)) {
        throw new Error(`PARAMETER INPUT ERROR: ${options.feeTokenAddress} is not a valid fee token address`)
      }
    }

    const writeContractParameters = {
      chain: options.client.chain,
      abi: RouterABI,
      address: options.routerAddress,
      functionName: 'ccipSend',
      args: buildArgs(options),
      account: options.client.account!,
      ...(!options.feeTokenAddress && {
        value: await getFee(options),
      }),
      ...options.writeContractParameters,
    }

    const transferTokensTxHash = await writeContract(options.client, writeContractParameters)

    const txReceipt = await waitForTransactionReceipt(options.client, {
      hash: transferTokensTxHash,
      confirmations: 2,
      ...options.waitForTransactionReceiptParameters,
    })

    const onRamp = await getOnRampAddress(options)
    const typeAndVersion = await readContract(options.client, {
      abi: parseAbi(['function typeAndVersion() returns (string)']),
      address: onRamp,
      functionName: 'typeAndVersion',
    })

    console.info('sendCCIPMessage():  CCIP type and version: ', typeAndVersion)

    const eventName = typeAndVersion === 'EVM2EVMOnRamp 1.5.0' ? 'CCIPSendRequested' : 'CCIPMessageSent'
    const abi = typeAndVersion === 'EVM2EVMOnRamp 1.5.0' ? OnRampABI : OnRampABI_1_6

    const parsedLog = Viem.parseEventLogs({
      abi: abi,
      logs: txReceipt.logs,
      eventName: eventName,
    }) as CCIPTransferReceipt[]

    let messageId

    if (typeAndVersion === 'EVM2EVMOnRamp 1.5.0') {
      messageId = parsedLog[0]?.args?.message?.messageId
    } else {
      messageId = parsedLog[0]?.args?.message?.header?.messageId
    }

    if (!messageId) {
      throw new Error('EVENTS LOG ERROR: Message ID not found in the transaction logs')
    }

    return {
      txHash: transferTokensTxHash,
      messageId: messageId,
      txReceipt: txReceipt as Viem.TransactionReceipt,
    }
  }

  async function getTransferStatus(options: Parameters<Client['getTransferStatus']>[0]) {
    checkIsAddressValid(
      options.destinationRouterAddress,
      `PARAMETER INPUT ERROR: Destination router address ${options.destinationRouterAddress} is not valid`,
    )

    if (!Viem.isHash(options.messageId)) {
      throw new Error(`PARAMETER INPUT ERROR: ${options.messageId} is not a valid message ID`)
    }
    if (!options.sourceChainSelector) {
      throw new Error('PARAMETER INPUT ERROR: Source chain selector is missing or invalid')
    }

    const offRamps = (await readContract(options.client, {
      abi: RouterABI,
      address: options.destinationRouterAddress,
      functionName: 'getOffRamps',
    })) as OffRamp[]

    const matchingOffRamps = offRamps.filter(
      (offRamp) => String(offRamp.sourceChainSelector) === options.sourceChainSelector,
    )
    if (matchingOffRamps.length === 0) {
      throw new Error('CONTRACT CALL ERROR: No matching off-ramp found')
    }

    let fromBlock = options.fromBlockNumber
    if (!fromBlock) {
      const blockNumber = await getBlockNumber(options.client)
      fromBlock = blockNumber - BigInt(TRANSFER_STATUS_FROM_BLOCK_SHIFT)
    }
    for (const offRamp of matchingOffRamps) {
      const logs = await getLogs(options.client, {
        event: ExecutionStateChangedABI,
        address: offRamp.offRamp,
        args: { messageId: options.messageId },
        fromBlock,
      })
      if (logs && logs.length > 0) {
        const { state } = logs[0].args
        if (state) return state as TransferStatus
      }
    }
    return null
  }

  async function getTransactionReceipt(
    options: Parameters<Client['getTransactionReceipt']>[0],
  ): Promise<Viem.TransactionReceipt> {
    if (!Viem.isHash(options.hash)) {
      throw new Error(`PARAMETER INPUT ERROR: ${options.hash} is not a valid transaction hash`)
    }

    return await getTxReceipt(options.client, { hash: options.hash })
  }

  function buildArgs(options: {
    amount?: bigint
    destinationChainSelector: string
    destinationAccount: Viem.Address
    tokenAddress?: Viem.Address
    feeTokenAddress?: Viem.Address
    data?: Viem.Hex
    extraArgs?: EVMExtraArgsV2
  }) {
    const {
      destinationAccount,
      destinationChainSelector,
      tokenAddress,
      amount,
      feeTokenAddress,
      data,
      extraArgs: evmExtraArgsV2,
    } = options
    const gasLimit = BigInt(evmExtraArgsV2?.gasLimit ?? 0)
    // Controls the execution order of your messages on the destination blockchain.
    // Setting this to true allows messages to be executed in any order. Setting it to false
    // ensures messages are executed in sequence, so a message will only be executed if the
    // preceeding one has been executed. On lanes where `Out of Order Execution` is required,
    // you must set this to true; otherwise, the transaction will revert.
    const allowOutOfOrderExecution = evmExtraArgsV2?.allowOutOfOrderExecution === false ? false : true
    const extraArgsEncoded = Viem.encodeAbiParameters(
      [
        { type: 'uint256', name: 'gasLimit' },
        { type: 'bool', name: 'allowOutOfOrderExecution' },
      ],
      [gasLimit, allowOutOfOrderExecution],
    )
    const evmExtraArgsV2Tag = '0x181dcf10'
    const extraArgs = evmExtraArgsV2Tag + extraArgsEncoded.slice(2)
    return [
      destinationChainSelector,
      {
        receiver: Viem.encodeAbiParameters([{ type: 'address', name: 'receiver' }], [destinationAccount]),
        data: data ?? Viem.zeroHash,
        tokenAmounts: amount && tokenAddress ? [{ token: tokenAddress, amount }] : [],
        feeToken: feeTokenAddress || Viem.zeroAddress,
        extraArgs,
      },
    ]
  }

  function checkIsAddressValid(address: Viem.Address, errorMessage?: string) {
    if (!Viem.isAddress(address) || Viem.isAddressEqual(address, Viem.zeroAddress)) {
      throw new Error(errorMessage)
    }
  }

  function checikIsWalletAccountValid(options: { client: Viem.Client }) {
    if (!options.client.account) {
      throw new Error('WALLET ERROR: account is not valid')
    }

    checkIsAddressValid(options.client.account.address, 'WALLET ERROR: account address is not valid')
  }
}

/**
 * Represents the state of a rate limiter using a token bucket algorithm.
 *
 * @typedef {Object} RateLimiterState
 * @prop {bigint} tokens - Current number of tokens that are in the bucket.
 *                             This represents the available capacity for requests.
 * @prop {number} lastUpdated - Timestamp in seconds of the last token refill,
 *                                  allows tracking token consumption over time.
 *                                  This is designed to be accurate for over 100 years.
 * @prop {boolean} isEnabled - Indicates whether the rate limiting feature is enabled or disabled.
 * @prop {bigint} capacity - Maximum number of tokens that can be in the bucket,
 *                               representing the total capacity of the limiter.
 * @prop {bigint} rate - The rate at which tokens are refilled in the bucket,
 *                           typically measured in tokens per second.
 */
export interface RateLimiterState {
  tokens: bigint
  lastUpdated: number
  isEnabled: boolean
  capacity: bigint
  rate: bigint
}

/**
 * Configuration settings for dynamic aspects of cross-chain transfers.
 *
 * The `DynamicConfig` type defines the structure of an object that holds various
 * dynamic configuration parameters for cross-chain transactions. These settings
 * are used to control the behavior and limits of transfers, such as gas calculations,
 * data availability, and message size constraints.
 *
 * @typedef {Object} DynamicConfig
 * @property {Viem.Address} router - The address of the router responsible for handling
 *                                   the cross-chain transfers. This address is used to
 *                                   route the transaction through the correct path.
 * @property {number} maxNumberOfTokensPerMsg - The maximum number of tokens that can be
 *                                              included in a single message. This parameter
 *                                              limits the token batch size in cross-chain
 *                                              transfers to prevent overly large transactions.
 * @property {number} destGasOverhead - The overhead in gas that is added to the destination
 *                                      chain to account for base transaction costs. This value
 *                                      helps ensure that the transaction has enough gas to
 *                                      cover additional overhead on the destination chain.
 * @property {number} destGasPerPayloadByte - The amount of gas required per byte of payload
 *                                            on the destination chain. This parameter is used
 *                                            to calculate the total gas needed based on the
 *                                            size of the payload being transferred.
 * @property {number} destDataAvailabilityOverheadGas - The additional gas required on the
 *                                                      destination chain to account for data
 *                                                      availability overhead. This value is used
 *                                                      to ensure that enough gas is allocated
 *                                                      for the availability of the data being
 *                                                      transferred.
 * @property {number} destGasPerDataAvailabilityByte - The gas cost per byte of data availability
 *                                                     on the destination chain. This parameter
 *                                                     contributes to the overall gas calculation
 *                                                     for data availability during the transfer.
 * @property {number} destDataAvailabilityMultiplierBps - The multiplier in basis points (bps)
 *                                                        applied to the data availability gas
 *                                                        cost. This value is used to adjust the
 *                                                        cost of data availability by applying
 *                                                        a scaling factor.
 * @property {Viem.Address} priceRegistry - The address of the price registry used to obtain
 *                                          pricing information for gas and other costs during
 *                                          the transfer. This registry helps ensure that the
 *                                          correct prices are applied to the transaction.
 * @property {number} maxDataBytes - The maximum number of data bytes that can be included in
 *                                   a single message. This parameter limits the size of the
 *                                   data payload to prevent excessive data in one transfer.
 * @property {number} maxPerMsgGasLimit - The maximum gas limit that can be applied to a single
 *                                        message. This parameter ensures that the transaction
 *                                        does not exceed a certain gas threshold, preventing
 *                                        overly costly operations.
 */
export type DynamicConfig = {
  router: Viem.Address
  maxNumberOfTokensPerMsg: number
  destGasOverhead: number
  destGasPerPayloadByte: number
  destDataAvailabilityOverheadGas: number
  destGasPerDataAvailabilityByte: number
  destDataAvailabilityMultiplierBps: number
  priceRegistry?: Viem.Address
  feeQuoter?: Viem.Address
  maxDataBytes: number
  maxPerMsgGasLimit: number
  defaultTokenFeeUSDCents: number
  defaultTokenDestGasOverhead: number
  enforceOutOfOrder: boolean
}

/**
 * Configuration settings for static aspects of cross-chain transfers.
 *
 * The `StaticConfig` type defines the structure of an object that holds various
 * static configuration parameters for cross-chain transactions.
 *
 * @typedef {Object} StaticConfig
 *
 * @property {bigint} chainSelector - The selector for the source chain.
 * @property {bigint} defaultTxGasLimit - Default gas limit per transaction.
 * @property {bigint} destChainSelector - The selector for the destination chain.
 * @property {Viem.Address} linkToken - The address of the LINK token on the source chain.
 * @property {bigint} maxNopFeesJuels - Maxium nop fee in juels.
 * @property {bigint} maxNopFeesJuels - Maxium nop fee in juels.
 * @property {Viem.Address} prevOnRamp - Previous onRamp contract address.
 * @property {Viem.Address} rmnProxy - RMN proxy contract address.
 * @property {Viem.Address} tokenAdminRegistryAddress - The address of the token admin registry contract.
 */
export type StaticConfig = {
  chainSelector: bigint
  defaultTxGasLimit: bigint
  destChainSelector: bigint
  linkToken: Viem.Address
  maxNopFeesJuels: bigint
  prevOnRamp: Viem.Address
  rmnProxy: Viem.Address
  tokenAdminRegistry: Viem.Address
}

/**
 * Represents the off-ramp configuration for a cross-chain transfer.
 *
 * @typedef {Object} OffRamp
 * @property {Viem.Address} offRamp - The address of the off-ramp contract on the destination blockchain.
 * @property {bigint} sourceChainSelector - The selector for the source chain.
 */
export type OffRamp = {
  offRamp: Viem.Address
  sourceChainSelector: bigint
}

/**
 * Represents the transaction status of a cross-chain transfer.
 */
export enum TransferStatus {
  Untouched = 0,
  InProgress = 1,
  Success = 2,
  Failure = 3,
}

/**
 * Extends the Viem.Log type to fetch cross-chain trasnfer messageId.
 */
export type CCIPTransferReceipt = Viem.Log & {
  args: {
    message?: {
      messageId?: Viem.Hash // 1.5
      header?: {
        messageId?: Viem.Hash // 1.6
      }
    }
  }
}

export type EVMExtraArgsV2 = {
  gasLimit?: number
  allowOutOfOrderExecution?: boolean
}
