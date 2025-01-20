import { render, screen, waitFor } from '@testing-library/react';
import { Default } from './AppDefault';
import { describe, expect, test } from 'vitest';
import { Context } from './AppContext';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config as wagmiConfig } from '@/utils/config';
import { optimismSepolia, sepolia } from 'viem/chains';

const queryClient = new QueryClient();

describe('AppDefault', () => {
  test('render transfer status page', () => {
    render(
      <WagmiProvider config={wagmiConfig([sepolia, optimismSepolia])}>
        <QueryClientProvider client={queryClient}>
          <Context.Provider
            value={{
              chains: [],
              chainsInfo: {},
              tokensList: [],
              linkContracts: {},
              routerAddresses: {},
              chainSelectors: {},
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
