import { Address } from 'viem'

const MAX_NUMBER_OF_NOPS = 64
/**
 * Configuration settings for static aspects of cross-chain transfers.
 *
 * The `StaticConfig` type defines the structure of an object that holds various
 * static configuration parameters for cross-chain transactions.
 *
 * @typedef {Object} StaticConfig
 *
 * @property {Address} linkToken - The address of the LINK token on the source chain.
 * @property {bigint} chainSelector - The selector for the source chain.
 * @property {bigint} destChainSelector - The selector for the destination chain.
 * @property {bigint} defaultTxGasLimit - Default gas limit per transaction.
 * @property {bigint} maxNopFeesJuels - Maxium nop fee in juels.
 * @property {Address} prevOnRamp - Previous onRamp contract address.
 * @property {Address} rmnProxy - RMN proxy contract address.
 * @property {Address} tokenAdminRegistryAddress - The address of the token admin registry contract.
 */
export type StaticConfig = {
  linkToken: Address // ────────╮ Link token address
  chainSelector: bigint // ─────╯ Source chainSelector
  destChainSelector: bigint // ─╮ Destination chainSelector
  defaultTxGasLimit: bigint //  │ Default gas limit for a tx
  maxNopFeesJuels: bigint // ───╯ Max nop fee balance onramp can have
  prevOnRamp: Address //            ────────╮ Address of previous-version OnRamp
  armProxy: Address //                      | Address of ARM proxy
  rmnProxy: Address //                      | Address of RMN proxy
  tokenAdminRegistryAddress: Address // ────╯ Token admin registry address
}

/**
 *  @typedef {Object} DynamicConfig
 *
 * @property {Address} router - The address of the router responsible for handling the cross-chain transfers. This address is used to route the transaction through the correct path.
 * @property {bigint} maxNumberOfTokensPerMsg - The maximum number of tokens that can be included in a single message. This parameter limits the token batch size in cross-chain transfers to prevent overly large transactions.
 * @property {bigint} destGasPerPayloadByte - The amount of gas required per byte of payload on the destination chain. This parameter is used to calculate the total gas needed based on the size of the payload being transferred.
 * @property {bigint} destDataAvailabilityOverheadGas - The additional gas required on the destination chain to account for data availability overhead. This value is used to ensure that enough gas is allocated for the availability of the data being transferred.
 * @property {bigint} destGasOverhead - The overhead in gas that is added to the destination chain to account for base transaction costs. This value helps ensure that the transaction has enough gas to cover additional overhead on the destination chain.
 * @property {bigint} destGasPerDataAvailabilityByte - The gas cost per byte of data availability on the destination chain. This parameter contributes to the overall gas calculation for data availability during the transfer.
 * @property {bigint} destDataAvailabilityMultiplierBps - The multiplier in basis points (bps) applied to the data availability gas cost. This value is used to adjust the cost of data availability by applying a scaling factor.
 * @property {Address} feeQuoter - The address of the feeQuoter contract used to obtain pricing information for gas and other costs during the transfer. This registry helps ensure that the correct prices are applied to the transaction.
 * @property {bigint} maxDataBytes - The maximum number of data bytes that can be included in a single message. This parameter limits the size of the data payload to prevent excessive data in one transfer.
 * @property {bigint} maxPerMsgGasLimit - The maximum gas limit that can be applied to a single message. This parameter ensures that the transaction does not exceed a certain gas threshold, preventing overly costly operations.
 */
export type DynamicConfig = {
  router: Address //           ──────────────────────────╮ Router address
  maxNumberOfTokensPerMsg: bigint //                     │ Maximum number of distinct ERC20 token transferred per message
  destGasOverhead: bigint //                             │ Gas charged on top of the gasLimit to cover destination chain costs
  destGasPerPayloadByte: bigint //             │ Destination chain gas charged for passing each byte of `data` payload to receiver
  destDataAvailabilityOverheadGas: bigint //           ──╯ Extra data availability gas charged on top of the message, e.g. for OCR
  destGasPerDataAvailabilityByte: bigint //      ───╮ Amount of gas to charge per byte of message data that needs availability
  destDataAvailabilityMultiplierBps: bigint //      │ Multiplier for data availability gas, multiples of bps, or 0.0001
  feeQuoter: Address //                        │ FeeQuoter address
  maxDataBytes: bigint //                      │ Maximum payload data size in bytes
  maxPerMsgGasLimit: bigint // ────────────────╯ Maximum gas limit for messages targeting EVMs
}

export type RateLimiterConfig = {
  isEnabled: boolean // Indication whether the rate limiting should be enabled
  capacity: bigint // ────╮ Specifies the capacity of the rate limiter
  rate: bigint //  ───────╯ Specifies the rate of the rate limiter
}

export type FeeTokenConfigArgs = {
  token: Address // ─────────────────────╮ Token address
  networkFeeUSDCents: bigint //          │ Flat network fee to charge for messages,  multiples of 0.01 USD
  gasMultiplierWeiPerEth: bigint // ─────╯ Multiplier for gas costs, 1e18 based so 11e17 = 10% extra cost
  premiumMultiplierWeiPerEth: bigint // ─╮ Multiplier for fee-token-specific premiums, 1e18 based
  enabled: boolean // ──────────────────────╯ Whether this fee token is enabled
}

export type TokenTransferFeeConfigArgs = {
  token: Address // ────────────╮ Token address
  minFeeUSDCents: bigint //     │ Minimum fee to charge per token transfer, multiples of 0.01 USD
  maxFeeUSDCents: bigint //     │ Maximum fee to charge per token transfer, multiples of 0.01 USD
  deciBps: bigint // ───────────╯ Basis points charged on token transfers, multiples of 0.1bps, or 1e-5
  destGasOverhead: bigint // ───╮ Gas charged to execute the token transfer on the destination chain
  destBytesOverhead: bigint // ─╯ Extra data availability bytes on top of fixed transfer data, including sourceTokenData and offchainData
}

export type NopAndWeight = {
  nop: Address // ────╮ Address of the node operator
  weight: bigint // ──╯ Weight for nop rewards
}

//   /// @dev Struct to hold the execution fee configuration for a fee token
//   struct FeeTokenConfig {
//     uint32 networkFeeUSDCents; // ─────────╮ Flat network fee to charge for messages,  multiples of 0.01 USD
//     uint64 gasMultiplierWeiPerEth; //      │ Multiplier for gas costs, 1e18 based so 11e17 = 10% extra cost.
//     uint64 premiumMultiplierWeiPerEth; //  │ Multiplier for fee-token-specific premiums
//     bool enabled; // ──────────────────────╯ Whether this fee token is enabled
//   }

//   /// @dev Struct to hold the transfer fee configuration for token transfers
//   struct TokenTransferFeeConfig {
//     uint32 minFeeUSDCents; // ────╮ Minimum fee to charge per token transfer, multiples of 0.01 USD
//     uint32 maxFeeUSDCents; //     │ Maximum fee to charge per token transfer, multiples of 0.01 USD
//     uint16 deciBps; //            │ Basis points charged on token transfers, multiples of 0.1bps, or 1e-5
//     uint32 destGasOverhead; //    │ Gas charged to execute the token transfer on the destination chain
//     uint32 destBytesOverhead; // ─╯ Extra data availability bytes on top of fixed transfer data, including sourceTokenData and offchainData
//   }
