import { createClient } from '@chainlink/ccip-js';
import { http, createPublicClient, PublicClient } from 'viem';
import { arbitrumSepolia, avalancheFuji, bscTestnet, sepolia, polygonAmoy } from 'viem/chains';

// Create CCIP client without arguments as per API requirements
export const ccipClient = createClient();

// Define a type for the chain clients map
type ChainClientMap = Record<number, PublicClient>;

// Create a map of public clients for each supported chain
export const chainClients: ChainClientMap = {
  [arbitrumSepolia.id]: createPublicClient({ 
    chain: arbitrumSepolia, 
    transport: http() 
  }),
  [avalancheFuji.id]: createPublicClient({ 
    chain: avalancheFuji, 
    transport: http() 
  }),
  [bscTestnet.id]: createPublicClient({ 
    chain: bscTestnet, 
    transport: http() 
  }),
  [sepolia.id]: createPublicClient({ 
    chain: sepolia, 
    transport: http() 
  }),
  [polygonAmoy.id]: createPublicClient({ 
    chain: polygonAmoy, 
    transport: http() 
  }),
}

// Export supported chains for convenient access
export const supportedChains = [
  arbitrumSepolia, 
  avalancheFuji, 
  bscTestnet, 
  sepolia, 
  polygonAmoy
]
