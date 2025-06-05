# CCIP-JS

CCIP-JS is a TypeScript library that provides a client for managing cross-chain token transfers that use Chainlink's [Cross-Chain Interoperability Protocol (CCIP)](https://docs.chain.link/ccip) routers. The library utilizes types and helper functions from [Viem](https://viem.sh/).

To learn more about CCIP, refer to the [CCIP documentation](https://docs.chain.link/ccip).

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

To install the package, use the following command:

```sh
npm install @chainlink/ccip-js
```

Or with Yarn:

```sh
yarn add @chainlink/ccip-js
```

Or with PNPM:

```sh
pnpm add @chainlink/ccip-js
```

## Usage

This example code covers the following steps:

- Initialize CCIP-JS Client for mainnet
- Approve tokens for transfer
- Get fee for the transfer
- Send the transfer through CCIP using one of the following options for fee payment:
  - Using the native token fee
  - Using the provided supported token for fee payment

```typescript
import * as CCIP from '@chainlink/ccip-js'
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

// Initialize CCIP-JS Client for mainnet
const ccipClient = CCIP.createClient()
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})
const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
})

// Approve Router to transfer tokens on user's behalf
const { txHash, txReceipt } = await ccipClient.approveRouter({
  client: walletClient,
  routerAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
  tokenAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
  amount: 1000000000000000000n,
  waitForReceipt: true,
})

console.log(`Transfer approved. Transaction hash: ${txHash}. Transaction receipt: ${txReceipt}`)

// Get fee for the transfer
const fee = await ccipClient.getFee({
  client: publicClient,
  routerAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
  tokenAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
  amount: 1000000000000000000n,
  destinationAccount: '0x1234567890abcdef1234567890abcdef12345678',
  destinationChainSelector: '1234',
})

console.log(`Fee: ${fee.toLocaleString()}`)

// Variant 1: Transfer via CCIP using native token fee
const { txHash, messageId } = await client.transferTokens({
  client: walletClient,
  routerAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
  tokenAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
  amount: 1000000000000000000n,
  destinationAccount: '0x1234567890abcdef1234567890abcdef12345678',
  destinationChainSelector: '1234',
})

console.log(`Transfer success. Transaction hash: ${txHash}. Message ID: ${messageId}`)

// Variant 2: Transfer via CCIP using the provided supported token for fee payment
const { txHash, messageId } = await client.transferTokens({
  client: walletClient,
  routerAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
  tokenAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
  amount: 1000000000000000000n,
  destinationAccount: '0x1234567890abcdef1234567890abcdef12345678',
  destinationChainSelector: '1234',
  feeTokenAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
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

Retrieves the allowance of a specified account for a cross-chain transfer.

```typescript
getAllowance(options: {
  client: Viem.Client
  routerAddress: Viem.Address
  tokenAddress: Viem.Address
  account: Viem.Address
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

1. cd into `packages/ccip-js` and then run `pnpm install` OR from the project root you can run `pnpm i -w`

2. open a new terminal window and run `foundryup` followed by `anvil` - requires that you've [installed Foundry Anvil](https://book.getfoundry.sh/anvil/).
   <b?>Note:</b> that Anvil is only needed for the integrations tests inside `./test` which uses the [Chainlink Local](https://github.com/smartcontractkit/chainlink-local) simulator. Actual testnet and mainnet behavior may differ from time to time and passing these tests does not guarantee testnet or mainnet behavior.

3. Back in the first terminal, inside, `packages/ccip-js` run `export PRIVATE_KEY=xxxxxx` to set your private key and then run `pnpm t:int` or `pnpm t:uint`.

Note some tests are flaky - this is under investigation. You can choose to run just the mocked test or the testnet integration tests using `pnpm jest <<name of test file>>`.

Note further that we have set a 180000ms (3 mins) timeout on the jest config. This can cause the testnet integration test to "hang" for the entire duration.

### Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

1. Fork the repository.
1. Create your feature branch (git checkout -b feature/my-feature).
1. Commit your changes (git commit -m 'Add some feature').
1. Push to the branch (git push origin feature/my-feature).
1. Open a pull request.

## License

CCIP-JS is available under the MIT license.
