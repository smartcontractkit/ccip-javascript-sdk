import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContextProvider } from '@/AppContext';
import { ConfigProps } from '@/types';
import { createContext, useContext } from 'react';
import { createPublicClient, http, PublicClient } from 'viem';
import type { Chain } from 'viem/chains';
import { DEFAULT_CONFIG } from './utils/config';

const queryClient = new QueryClient();

// Define an interface for the context value
interface ViemClientContextType {
  client: PublicClient;
  chain: Chain;
}

const ViemClientContext = createContext<ViemClientContextType | null>(null);

export const ViemClientProvider = ({ children, chain }: { children: React.ReactNode, chain: Chain }) => {
  const client = createPublicClient({
    chain: chain,
    transport: http(),
  });

  return (
    <ViemClientContext.Provider value={{ client, chain }}>
      {children}
    </ViemClientContext.Provider>
  );
};

export const useViemClient = () => {
  const context = useContext(ViemClientContext);
  if (!context) {
    throw new Error('useViemClient must be used within a ViemClientProvider');
  }
  return context;
};

export function Providers({
  config,
  networkConfig,
  children,
}: React.PropsWithChildren<ConfigProps>) {
  return (
    <ViemClientProvider chain={DEFAULT_CONFIG.chains[0]}>
      <QueryClientProvider client={queryClient}>
        <ContextProvider chain={DEFAULT_CONFIG.chains[0]} config={config} networkConfig={networkConfig}>
          {children}
        </ContextProvider>
      </QueryClientProvider>
    </ViemClientProvider>
  );
}
