'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { wagmiConfig } from '@/config/wagmiConfig';
import { Chain } from 'viem';

const queryClient = new QueryClient();

export function Providers({ children, chains }: { children: ReactNode, chains: Chain[] }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
