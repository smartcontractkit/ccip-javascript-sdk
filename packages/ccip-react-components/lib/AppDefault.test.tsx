import { render, screen, waitFor } from '@testing-library/react';
import { Default } from './AppDefault';
import { describe, expect, test } from 'vitest';
import { Context } from './AppContext';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, injected } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { arbitrumSepolia, avalancheFuji,bscTestnet, polygonAmoy, sepolia } from 'viem/chains';

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [sepolia, avalancheFuji, arbitrumSepolia, bscTestnet, polygonAmoy],
  connectors: [injected()],
  client({ chain }) {
    return createPublicClient({ chain, transport: http() });
  }
})

describe('AppDefault', () => {
  test('render transfer status page', () => {
    render(
      <WagmiProvider 
        config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <Context.Provider
            value={{
              chains: [sepolia, avalancheFuji],
              chainsInfo: {
                [sepolia.id]: { name: 'Sepolia' },
                [avalancheFuji.id]: { name: 'Avalanche Fuji' },
              },
              tokensList: [],
              linkContracts: {
                [sepolia.id]: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
                [avalancheFuji.id]: '0xabcdef1234567890abcdef1234567890abcdef12',
              },
              routerAddresses: {
                [sepolia.id]: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
                [avalancheFuji.id]: '0x114a20a10b43d4115e5aeef7345a1a71d2a60c57',
              },
              chainSelectors: {
                [sepolia.id]: '16015286601757825753',
                [avalancheFuji.id]: '5224473277236331295',
              },
              setTransferHash: () => null,
              setMessageId: () => null,
              setSourceChainId: () => null,
              setDestinationChainId: () => null,
              setFeeTokenSymbol: () => null,
              setFeeAmount: () => null,
              setIsConnectOpen: () => null,
              messageId:
                '0xea62953e1710d2d369fb896adb3dc009048cd1f4467c87a6295d1722555b2a74',
            }}
          >
            <Default />
          </Context.Provider>
        </QueryClientProvider>
      </WagmiProvider>
    );
    waitFor(() => {
      expect(screen.getByText('Detecting...')).toBeNull();
    });
    const statusHeading = screen.getAllByRole('heading', { level: 4 })[0];
    expect(statusHeading).toHaveTextContent('Transfer status');
  });
});
