# CCIP-JS

CCIP-JS is a TypeScript library that provides a client for managing cross-chain token transfers that use Chainlink's [Cross-Chain Interoperability Protocol (CCIP)](https://docs.chain.link/ccip) routers. The library supports both [Viem](https://viem.sh/) and [ethers.js](https://docs.ethers.org/v6/) clients, giving developers flexibility in their preferred Ethereum library.

To learn more about CCIP, refer to the [CCIP documentation](https://docs.chain.link/ccip).

## Ethers.js Support

CCIP-JS now includes first-class support for ethers.js, allowing you to use either ethers.js or viem clients interchangeably. The library provides adapter patterns to ensure compatibility between the two libraries.

### Key Features for ethers.js Users

- **Seamless Integration**: Use existing ethers.js providers and signers with CCIP-JS
- **Type Safety**: Full TypeScript support for all ethers.js operations
- **Unified API**: Same method signatures as viem, making it easy to switch between libraries
- **Automatic Type Conversion**: Handles type differences between ethers.js and viem automatically

### When to Use ethers.js vs Viem

- **Use ethers.js if**:
  - You have an existing codebase using ethers.js
  - You prefer ethers.js's API and developer experience
  - You need features specific to ethers.js

- **Use viem if**:
  - You're starting a new project without legacy dependencies
  - You want to use the latest Ethereum tooling
  - You need better TypeScript integration

### Migration Guide

If you're migrating from viem to ethers.js, most method signatures remain the same. The main changes involve how you initialize and pass the client.

// ... existing code ...

## Table of Contents

- [CCIP-JS](#ccip-js)
  - [Table of Contents](#table-of-contents)
  - [What is CCIP-JS?](#what-is-ccip-js)
  - [Why CCIP-JS?](#why-ccip-js)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API Reference](#api-reference)
    - [Client](#client)
    - [createClient](#createclient)
    - [RateLimiterState](#ratelimiterstate)
    - [DynamicConfig](#dynamicconfig)
    - [OffRamp](#offramp)
    - [TransferStatus](#transferstatus)
    - [Client Methods](#client-methods)
      - [approveRouter](#approverouter)
      - [getAllowance](#getallowance)
      - [getOnRampAddress](#getonrampaddress)
      - [getSupportedFeeTokens](#getsupportedfeetokens)
      - [getLaneRateRefillLimits](#getlaneraterefilllimits)
      - [getTokenRateLimitByLane](#gettokenratelimitbylane)
      - [getFee](#getfee)
      - [getTokenAdminRegistry](#gettokenadminregistry)
      - [isTokenSupported](#istokensupported)
      - [transferTokens](#transfertokens)
      - [sendCCIPMessage](#sendccipmessage)
      - [getTransferStatus](#gettransferstatus)
      - [getTransactionReceipt](#gettransactionreceipt)
  - [Development](#development)
    - [Build](#build)
    - [Running tests](#running-tests)
  - [Contributing](#contributing)
- [License](#license)

## Why CCIP-JS?

CCIP-JS provides ready-to-use typesafe methods for every step of the token transfer process.
Although you can do a CCIP token transfer simply by calling the [`ccipSend` function](https://docs.chain.link/ccip/api-reference/i-router-client#ccipsend), there are multiple steps that need to be done beforehand, such as:

- checking allowances
- approving transfers
- retrieving supported lanes
- retrieving lane limits
- retrieving fee amounts and fee tokens

Additionally, after the transfer, you may need to check the transfer status.

CCIP JS is a stand-alone NPM package that can be imported into your NodeJS/Typescript projects.

It can also be imported as a scripting dependency inside [Remix IDE scripts](https://remix-ide.readthedocs.io/en/latest/running_js_scripts.html).

> ⚠️ Warning The use of secrets (including your private keys) in scripts inside Remix IDE is an experimental feature that may not operate as expected and is subject to change. Please be aware that Chainlink does not control how your secrets or environment variables are used or accessed within Remix or when executing scripts within Remix, and the safekeeping of secrets and environment variables is your responsibility.

## Features

- _Token Approvals_: Approve tokens for cross-chain transfers.
- _Allowance Checks_: Retrieve the allowance for token transfers.
- _Rate Limits_: Get rate refill limits for lanes.
- _Fee Calculation_: Calculate the fee required for transfers.
- _Token Transfers_: Transfer tokens across chains.
- _Transfer Status_: Retrieve the status of a transfer by transaction hash.

## Installation

### With Viem
```bash
npm install @chainlink/ccip-js viem
```

### With ethers.js
```bash
npm install @chainlink/ccip-js ethers@6
```

Or with Yarn:

```sh
yarn add @chainlink/ccip-js viem
```

Or with PNPM:

```sh
pnpm add @chainlink/ccip-js viem
```

## Usage

### Initializing with Viem

```typescript
import { createClient } from '@chainlink/ccip-js'
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})

const account = privateKeyToAccount('0x...')

const walletClient = createWalletClient({
  account,
  chain: mainnet,
  transport: http()
})

const client = createClient()
```

### Initializing with ethers.js

```typescript
import { createClient } from '@chainlink/ccip-js'
import { ethers } from 'ethers'

// Using JsonRpcProvider
const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL')
const signer = new ethers.Wallet('YOUR_PRIVATE_KEY', provider)

// Or using BrowserProvider (for browser wallets like MetaMask)
// const provider = new ethers.BrowserProvider(window.ethereum)
// const signer = await provider.getSigner()

const client = createClient()
```

### Using ethers.js with the Client

All client methods work the same way whether you're using ethers.js or viem. The library handles the underlying differences automatically.

```typescript
// Example: Getting token balance
const balance = await client.getTokenBalance({
  client: signer, // or provider for read-only operations
  owner: '0x1234...',
  tokenAddress: '0xTokenAddress'
})

// Example: Transferring tokens
const { txHash } = await client.transferTokens({
  client: signer,
  routerAddress: '0xRouterAddress',
  tokenAddress: '0xTokenAddress',
  recipient: '0xRecipient',
  amount: ethers.parseEther('1.0'),
  destinationChainSelector: '1234',
  feeToken: '0xFeeToken'
})
```

## API Reference

### Client

An object containing methods for cross-chain transfer management. Refer to [Client methods](#client-methods) for more information about each method.

```typescript
export interface Client {
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

  getAllowance(options: {
    client: Viem.Client
    routerAddress: Viem.Address
    tokenAddress: Viem.Address
    account: Viem.Address
  }): Promise<bigint>

  getOnRampAddress(options: {
    client: Viem.Client
    routerAddress: Viem.Address
    destinationChainSelector: string
  }): Promise<Viem.Address>

  getSupportedFeeTokens(options: {
    client: Viem.Client
    routerAddress: Viem.Address
    destinationChainSelector: string
  }): Promise<Viem.Address[]>

  getLaneRateRefillLimits(options: {
    client: Viem.Client
    routerAddress: Viem.Address
    destinationChainSelector: string
  }): Promise<RateLimiterState>

  getTokenRateLimitByLane(options: {
    client: Viem.Client
    routerAddress: Viem.Address
    supportedTokenAddress: Viem.Address
    destinationChainSelector: string
  }): Promise<RateLimiterState>

  getFee(options: {
    client: Viem.Client
    routerAddress: Viem.Address
    destinationAccount: Viem.Address
    destinationChainSelector: string
    amount: bigint
    tokenAddress: Viem.Address
    feeTokenAddress?: Viem.Address
    message?: string
  }): Promise<bigint>

  getTokenAdminRegistry(options: {
    client: Viem.Client
    routerAddress: Viem.Address
    destinationChainSelector: string
    tokenAddress: Viem.Address
  }): Promise<Viem.Address>

  isTokenSupported(options: {
    client: Viem.Client
    routerAddress: Viem.Address
    destinationChainSelector: string
    tokenAddress: Viem.Address
  }): Promise<boolean>

  transferTokens(options: {
    client: Viem.WalletClient
    routerAddress: Viem.Address
    destinationChainSelector: string
    amount: bigint
    destinationAccount: Viem.Address
    tokenAddress: Viem.Address
    feeTokenAddress?: Viem.Address
    message?: string
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

  sendCCIPMessage(options: {
    client: Viem.WalletClient
    routerAddress: Viem.Address
    destinationChainSelector: string
    destinationAccount: Viem.Address
    feeTokenAddress?: Viem.Address
    message: string
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

  getTransferStatus(options: {
    client: Viem.Client
    destinationRouterAddress: Viem.Address
    sourceChainSelector: string
    messageId: Viem.Hash
    fromBlockNumber?: bigint
  }): Promise<TransferStatus | null>

  getTransactionReceipt(options: { client: Viem.Client; hash: Viem.Hash }): Promise<Viem.TransactionReceipt>
}
```

### createClient

```typescript
createClient(): Client
```

Creates a [Client](#client) object.

### RateLimiterState

Represents the state of a rate limiter using a token bucket algorithm.

```typescript
interface RateLimiterState {
  // Current number of tokens that are in the bucket. This represents the available capacity for requests.
  tokens: bigint
  // Timestamp in seconds of the last token refill, allows tracking token consumption over time. This is designed to be accurate for over 100 years.
  lastUpdated: number
  // Indicates whether the rate limiting feature is enabled or disabled.
  isEnabled: boolean
  // Maximum number of tokens that can be in the bucket, representing the total capacity of the limiter.
  capacity: bigint
  // The rate at which tokens are refilled in the bucket, measuer in tokes per second.
  rate: bigint
}
```

### DynamicConfig

Configuration settings for dynamic aspects of cross-chain transfers.

The `DynamicConfig` type defines the structure of an object that holds various dynamic configuration parameters for cross-chain transactions. These settings are used to control the behavior and limits of transfers, such as gas calculations, data availability, and message size constraints.

```typescript
type DynamicConfig = {
  // The address of the router responsible for handling the cross-chain transfers. This address is used to route the transaction through the correct path.
  router: Viem.Address
  // The maximum number of tokens that can be included in a single message. This parameter limits the token batch size in cross-chain transfers to prevent overly large transactions.
  maxNumberOfTokensPerMsg: number
  // The amount of gas required per byte of payload on the destination chain. This parameter is used to calculate the total gas needed based on the size of the payload being transferred.
  destGasPerPayloadByte: number
  // The additional gas required on the destination chain to account for data availability overhead. This value is used to ensure that enough gas is allocated for the availability of the data being transferred.
  destDataAvailabilityOverheadGas: number
  // The overhead in gas that is added to the destination chain to account for base transaction costs. This value helps ensure that the transaction has enough gas to cover additional overhead on the destination chain.
  destGasOverhead: number
  // The gas cost per byte of data availability on the destination chain. This parameter contributes to the overall gas calculation for data availability during the transfer.
  destGasPerDataAvailabilityByte: number
  // The multiplier in basis points (bps) applied to the data availability gas cost. This value is used to adjust the cost of data availability by applying a scaling factor.
  destDataAvailabilityMultiplierBps: number
  // The address of the feeQuoter used to obtain pricing information for gas and other costs during the transfer. This registry helps ensure that the correct prices are applied to the transaction.
  feeQuoter: Viem.Address
  // The maximum number of data bytes that can be included in a single message. This parameter limits the size of the data payload to prevent excessive data in one transfer.
  maxDataBytes: number
  // The maximum gas limit that can be applied to a single message. This parameter ensures that the transaction does not exceed a certain gas threshold, preventing overly costly operations.
  maxPerMsgGasLimit: number
}
```

### OffRamp

Represents the off-ramp configuration for a cross-chain transfer.

```typescript
type OffRamp = {
  // The address of the off-ramp contract on the destination blockchain.
  offRamp: Viem.Address
  // The selector for the source chain.
  sourceChainSelector: bigint
}
```

### TransferStatus

Represents the transaction status of a cross-chain transfer.

```typescript
enum TransferStatus {
  Untouched = 0,
  InProgress = 1,
  Success = 2,
  Failure = 3,
}
```

### Client Methods

All client methods work with both ethers.js and viem clients. The examples below show both approaches.

#### approveRouter

Approve the CCIP router to spend tokens for transfers and fees on behalf of the user. Returns the transaction hash and optionally the transaction receipt.

Q: Why an approval is needed?
A: For a cross-chain transfer the CCIP router contract needs to withdraw the tokens amount and fee from the sender's wallet. The user should review and approve the parameters of the transfer before executing it.

```typescript
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
```

#### getAllowance

Retrieves the allowance for a specific token and spender. Returns a promise that resolves to the allowance amount as a bigint.

```typescript
// With viem
getAllowance(options: {
  client: Viem.Client
  routerAddress: Viem.Address
  tokenAddress: Viem.Address
  account: Viem.Address
}): Promise<bigint>

// With ethers.js
getAllowance(options: {
  client: ethers.Provider | ethers.Signer
  routerAddress: string
  tokenAddress: string
  account: string
}): Promise<bigint>
```

#### getOnRampAddress

Retrieves the onRamp contract address from a router contract.

```typescript
getOnRampAddress(options: {
  client: Viem.Client
  routerAddress: Viem.Address
  destinationChainSelector: string
}): Promise<Viem.Address>
```

#### getSupportedFeeTokens

Gets a list of supported tokens which can be used to pay the fees for the cross-chain transfer.

```typescript
getSupportedFeeTokens(options: {
  client: Viem.Client
  routerAddress: Viem.Address
  destinationChainSelector: string
}): Promise<Viem.Address[]>
```

#### getLaneRateRefillLimits

Retrieves the aggregated rate refill limits for the specified chain. Returns a promise that resolves to [RateLimiterState](#ratelimiterstate) object.

```typescript
getLaneRateRefillLimits(options: {
  client: Viem.Client
  routerAddress: Viem.Address
  destinationChainSelector: string
}): Promise<RateLimiterState>
```

#### getTokenRateLimitByLane

Retrieves the rate refill limits forokenratelimitbyLane

Retrieves the rate refill limits for the specified token. Returns a promise that resolves to [RateLimiterState](#ratelimiterstate) object.

```typescript
getTokenRateLimitByLane(options: {
  client: Viem.Client
  routerAddress: Viem.Address
  supportedTokenAddress: Viem.Address
  destinationChainSelector: string
}): Promise<RateLimiterState>
```

#### getFee

Gets the fee required for the cross-chain transfer.

```typescript
getFee(options: {
  client: Viem.Client
  routerAddress: Viem.Address
  destinationAccount: Viem.Address
  destinationChainSelector: string
  amount: bigint
  tokenAddress: Viem.Address
  feeTokenAddress?: Viem.Address
  message?: string
}): Promise<bigint>
```

Get the fee required for the cross-chain transfer and/or sending cross-chain message.

#### getTokenAdminRegistry

Retrieve the token admin registry contract address from an onRamp contract

```typescript
getTokenAdminRegistry(options: {
  client: Viem.Client
  routerAddress: Viem.Address
  destinationChainSelector: string
  tokenAddress: Viem.Address
}): Promise<Viem.Address>
```

#### isTokenSupported

Check if the token is supported on the destination chain. The call, and all configs are made on the source chain.

```typescript
isTokenSupported(options: {
  client: Viem.Client
  routerAddress: Viem.Address // router address on source chain.
  destinationChainSelector: string
  tokenAddress: Viem.Address // token address on source chain.
}): Promise<boolean>
```

#### transferTokens

Initiates the token transfer and returns the transaction hash, cross-chain transfer message ID and transaction receipt.

```typescript
transferTokens(options: {
  client: Viem.WalletClient
  routerAddress: Viem.Address
  destinationChainSelector: string
  amount: bigint
  destinationAccount: Viem.Address
  tokenAddress: Viem.Address
  feeTokenAddress?: Viem.Address
  message?: string
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
```

Initiates the token transfer and returns the transaction hash, cross-chain transfer message ID and transaction receipt.

#### sendCCIPMessage

Send arbitrary message through CCIP

```typescript
sendCCIPMessage(options: {
  client: Viem.WalletClient
  routerAddress: Viem.Address
  destinationChainSelector: string
  destinationAccount: Viem.Address
  feeTokenAddress?: Viem.Address
  message: string
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
```

#### getTransferStatus

Retrieves the status of a cross-chain transfer based on the message ID. Returns a promise that resolves to [TransferStatus](#transferstatus) object or `null`

```typescript
getTransferStatus(options: {
  client: Viem.Client
  destinationRouterAddress: Viem.Address
  sourceChainSelector: string
  messageId: Viem.Hash
  fromBlockNumber?: bigint
}): Promise<TransferStatus | null>
```

#### getTransactionReceipt

Retrieves the transaction receipt based on the transaction hash. Returns a promise that resolves to [`TransactionReceipt`](https://viem.sh/docs/glossary/types.html#transactionreceipt) object.

```typescript
getTransactionReceipt(options: { client: Viem.Client; hash: Viem.Hash }): Promise<Viem.TransactionReceipt>
```

### Development (For developing this CCIP-JS package locally)

#### Build

```sh
pnpm i -w
pnpm build-ccip-js
```

Note that when the above `build-ccip-js` step is run, the contracts located in `./src/contracts` are compiled and ABIs and artifacts are emitted into the `../ccip-js/artifacts`
folder. From there, the relevant ABI arrays must be manually moved to `./src/abi` , and just the ABI array is pasted into the corresponding file in `./src/abi`. However the files in `./artifacts-compile` contain objects with both the abi and the bytecode and are used in the unit test files with Viem's test clients.

#### Running tests

1. Integration tests against testnets are favored in the ccip-js package.

2. Start by cd into `packages/ccip-js` and then run `pnpm install` OR from the project root you can run `pnpm i -w`

3. Back in the first terminal, inside, `packages/ccip-js` run `export PRIVATE_KEY=0x.....` to set your private key and then run `pnpm t:int`. If you're in the entire repo's root you can run the workspace filtering command `pnpm test-ccip-js`

Note further that we have set a 180000ms (3 mins) timeout on the jest config. This can cause the testnet integration test to appear to "hang"until timeout completes.

### Contributing

Please see the main README.

## License

CCIP-JS is available under the MIT license.
