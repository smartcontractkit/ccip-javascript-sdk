import { render, screen, waitFor } from '@testing-library/react';
import { App } from './App';
import { describe, expect, test, vi } from 'vitest';
import { 
  optimismSepolia, 
  sepolia, 
  arbitrumSepolia, 
  avalancheFuji, 
  baseSepolia, 
  bscTestnet, 
  polygonAmoy 
} from 'viem/chains';
import { NetworkConfig } from './types';
import { WagmiProvider, createConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { createPublicClient, http } from 'viem';

// Mock the wagmi hooks
vi.mock('wagmi', async () => {
  const actual = await vi.importActual('wagmi');
  return {
    ...actual,
    useAccount: () => ({
      address: '0x123',
      chainId: sepolia.id,
      chain: sepolia,
    }),
    useBalance: () => ({
      data: {
        value: 1000000000000000000n,
      },
    }),
  };
});

const queryClient = new QueryClient();

// Create a wagmi config for testing
const testWagmiConfig = createConfig({
  chains: [sepolia, optimismSepolia, arbitrumSepolia, avalancheFuji, baseSepolia, bscTestnet, polygonAmoy],
  client(options) {
    return createPublicClient({
      chain: options.chain,
      transport: http()
    });
  }
});

// Testing provider component
function TestProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={testWagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

const networkConfing: NetworkConfig = {
  chains: [
    { chain: sepolia },
    { chain: optimismSepolia },
    { chain: arbitrumSepolia },
    { chain: avalancheFuji },
    { chain: baseSepolia },
    { chain: bscTestnet },
    { chain: polygonAmoy }
  ],
  linkContracts: {
    [sepolia.id]: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
    [optimismSepolia.id]: '0xE4aB69C077896252FAFBD49EFD26B5D171A32410',
    [arbitrumSepolia.id]: '0xb1D4538B4571d411F07960EF2838Ce337FE1E80E',
    [avalancheFuji.id]: '0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846',
    [baseSepolia.id]: '0xE4aB69C077896252FAFBD49EFD26B5D171A32410',
    [bscTestnet.id]: '0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06',
    [polygonAmoy.id]: '0xE4aB69C077896252FAFBD49EFD26B5D171A32410'
  },
  routerAddresses: {
    [sepolia.id]: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
    [optimismSepolia.id]: '0x114a20a10b43d4115e5aeef7345a1a71d2a60c57',
    [arbitrumSepolia.id]: '0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165',
    [avalancheFuji.id]: '0xF694E193200268f9a4868e4Aa017A0118C9a8177',
    [baseSepolia.id]: '0x9527e2d01a3064ef6b50c1da1c0cc523803bcff2',
    [bscTestnet.id]: '0x9527e2d01a3064ef6b50c1da1c0cc523803bcff2',
    [polygonAmoy.id]: '0x70499c328e1e2a3c41108bd3730f6670a44595d1'
  },
  chainSelectors: {
    [sepolia.id]: '16015286601757825753',
    [optimismSepolia.id]: '5224473277236331295',
    [arbitrumSepolia.id]: '3478487238524512106',
    [avalancheFuji.id]: '14767482510784806043',
    [baseSepolia.id]: '10344971235874465080',
    [bscTestnet.id]: '13264668187771770619',
    [polygonAmoy.id]: '5009297550715157269'
  },
  tokensList: [
    {
      symbol: 'CCIP-BnM',
      address: {
        [sepolia.id]: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
        [optimismSepolia.id]: '0x8aF4204e30565DF93352fE8E1De78925F6664dA7',
        [arbitrumSepolia.id]: '0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D',
        [avalancheFuji.id]: '0xD21341536c5cF5EB1bcb58f6723cE26e8D8E90e4',
        [baseSepolia.id]: '0xbf9036529123DE264bFA0FC7362fE25B650D4B16',
        [bscTestnet.id]: '0xbF9036529123DE264bFA0FC7362fE25B650D4B16',
        [polygonAmoy.id]: '0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D'
      },
      logoURL:
        'https://smartcontract.imgix.net/tokens/ccip-bnm.webp?auto=compress%2Cformat',
    },
    {
      symbol: 'LINK',
      address: {
        [sepolia.id]: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
        [optimismSepolia.id]: '0xE4aB69C077896252FAFBD49EFD26B5D171A32410',
        [arbitrumSepolia.id]: '0xb1D4538B4571d411F07960EF2838Ce337FE1E80E',
        [avalancheFuji.id]: '0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846',
        [baseSepolia.id]: '0xE4aB69C077896252FAFBD49EFD26B5D171A32410',
        [bscTestnet.id]: '0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06',
        [polygonAmoy.id]: '0xE4aB69C077896252FAFBD49EFD26B5D171A32410'
      },
      logoURL: 'https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png',
    }
  ],
};

describe('App', () => {
  test('renders the default App component', () => {
    render(
      <TestProviders>
        <App networkConfig={networkConfing} chain={sepolia} />
      </TestProviders>
    );
    waitFor(() => {
      expect(screen.getByText('Detecting...')).toBeNull();
    });
    const appContainer = screen.getAllByRole('generic')[1];
    expect(appContainer).toHaveClass('md:w-[473px]');
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Transfer');
  });
  test('renders the App in compact variant', () => {
    render(
      <TestProviders>
        <App config={{ variant: 'compact' }} networkConfig={networkConfing} chain={sepolia} />
      </TestProviders>
    );
    waitFor(() => {
      expect(screen.getByText('Detecting...')).toBeNull();
    });
    const appContainer = screen.getAllByRole('generic')[1];
    expect(appContainer).toHaveClass('md:w-[375px]');
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Transfer');
  });
  test('renders the App in drawer variant', () => {
    render(
      <TestProviders>
        <App
          config={{ variant: 'drawer' }}
          drawer={{ open: true }}
          networkConfig={networkConfing}
          chain={sepolia}
        />
      </TestProviders>
    );
    waitFor(() => {
      expect(screen.getByText('Detecting...')).toBeNull();
    });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Transfer');
  });
});
