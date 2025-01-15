import { Chain } from 'wagmi/chains';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContextProvider } from '@/AppContext';
import { config as wagmiConfig } from '@/utils/config';
import { ConfigProps } from '@/types';

const queryClient = new QueryClient();

export function Providers({
  config,
  networkConfig,
  children,
}: React.PropsWithChildren<ConfigProps>) {
  return (
    <WagmiProvider
      config={wagmiConfig(
        networkConfig.chains.map(({ chain }) => chain) as [Chain, ...Chain[]]
      )}
    >
      <QueryClientProvider client={queryClient}>
        <ContextProvider config={config} networkConfig={networkConfig}>
          {children}
        </ContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
