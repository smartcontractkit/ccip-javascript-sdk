import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ActionButton } from './ActionButton';
import { WagmiProvider } from 'wagmi';
import { config as wagmiConfig } from '@/utils/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { optimismSepolia, sepolia } from 'viem/chains';

const queryClient = new QueryClient();

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig([sepolia, optimismSepolia])}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};

describe('ActionButton', () => {
  beforeEach(function () {
    vi.clearAllMocks();
  });
  test('render SwitchNetwork button', () => {
    render(
      <Providers>
        <ActionButton
          address="0x748Cab9A6993A24CA6208160130b3f7b79098c6d"
          chainId={11155111}
          sourceChain={43113}
          amount="1"
        />
      </Providers>
    );
    const switchNetworkButton = screen.getByText('Switch to Avalanche Fuji');
    expect(switchNetworkButton).toBeInTheDocument();
  });
  test('render send button', () => {
    render(
      <Providers>
        <ActionButton
          address="0x748Cab9A6993A24CA6208160130b3f7b79098c6d"
          chainId={11155111}
          sourceChain={11155111}
          destinationChain={43113}
          tokenAddress="0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05"
          amount="1"
        />
      </Providers>
    );
    const sendButton = screen.getByText('Send');
    expect(sendButton).toBeInTheDocument();
  });
  test('render disabled send button', () => {
    render(
      <Providers>
        <ActionButton
          address="0x748Cab9A6993A24CA6208160130b3f7b79098c6d"
          chainId={11155111}
          sourceChain={11155111}
          amount="1"
        />
      </Providers>
    );
    const sendButton = screen.getByText('Send');
    expect(sendButton).toBeDisabled();
  });
});
