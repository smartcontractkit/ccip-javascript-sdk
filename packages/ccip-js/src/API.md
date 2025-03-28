# CCIP JavaScript SDK Integration Guide

## Overview
The `api.ts` file defines a `Client` interface for managing cross-chain transfers, along with the `createClient` function to initialize a client object with various methods. This SDK provides a comprehensive toolkit for cross-chain transfer management.

## Integration Steps

### 1. Installation
To integrate the SDK, first install the necessary packages. Ensure you have `viem` and any other dependencies required by your project:

```bash
npm install viem @chainlink/ccip-js
```

### 2. Setup
Import the necessary modules and create a client instance:

```typescript
import * as CCIP from '@chainlink/ccip-js';
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';

const ccipClient = CCIP.createClient();

const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!)
});
```

### 3. Using the Client
The `Client` interface provides several methods for managing cross-chain transfers:

| Method                        | Description |
|-------------------------------|-------------|
| **approveRouter**             | Approves token transfers through a specified router. |
| **getAllowance**              | Retrieves the allowance of a specified account for a cross-chain transfer. |
| **getOnRampAddress**          | Retrieves the onRamp contract address from a router contract. |
| **getSupportedFeeTokens**     | Gets a list of supported fee tokens for a cross-chain transfer. |
| **getLaneRateRefillLimits**   | Retrieves the rate refill limits for a specified lane. |
| **getTokenRateLimitByLane**   | Retrieves the rate refill limits for a specified token. |
| **getFee**                    | Gets the fee required for a cross-chain transfer. |
| **getTokenAdminRegistry**     | Retrieves the token admin registry contract address. |
| **isTokenSupported**          | Checks if a token is supported on the destination chain. |
| **transferTokens**            | Initiates a token transfer and returns the transaction hash and message ID. |
| **sendCCIPMessage**           | Sends an arbitrary message through CCIP. |
| **getTransferStatus**         | Retrieves the status of a cross-chain transfer based on the message ID. |
| **getTransactionReceipt**     | Retrieves the transaction receipt based on the transaction hash. |

### 4. Example Usage
Here is an example of how to use the `approveRouter` and `getFee` methods:

```typescript
const { txHash, txReceipt } = await ccipClient.approveRouter({
  client: walletClient,
  routerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
  tokenAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
  amount: 1000000000000000000n,
  waitForReceipt: true,
});

console.log(`Transfer approved. Transaction hash: ${txHash}. Transaction receipt: ${txReceipt}`);

const fee = await ccipClient.getFee({
  client: walletClient,
  routerAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
  tokenAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
  amount: 1000000000000000000n,
  destinationAccount: "0x1234567890abcdef1234567890abcdef12345678",
  destinationChainSelector: "1234"
});

console.log(`Fee: ${fee.toLocaleString()}`);
```

## Error Handling
Each method includes parameter validation and error handling to ensure robustness. Ensure that all addresses and parameters are valid to avoid runtime errors.

## Conclusion
Integrating the CCIP JavaScript SDK allows for efficient and secure management of cross-chain transfers. Follow the steps outlined above to set up and utilize the SDK in your project.