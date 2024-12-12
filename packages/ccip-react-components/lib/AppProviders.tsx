import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContextProvider } from '@/AppContext';
import { config as wagmiConfig } from '@/utils/config';
import { ConfigProps } from '@/types';

const queryClient = new QueryClient();

export function Providers({
  config,
  tokensList,
  children,
}: React.PropsWithChildren<ConfigProps>) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ContextProvider config={config} tokensList={tokensList}>
          {children}
        </ContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
