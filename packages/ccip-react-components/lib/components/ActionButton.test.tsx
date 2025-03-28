import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ActionButton } from './ActionButton';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { avalancheFuji, sepolia } from 'viem/chains';
import type { WidgetConfig } from '@/types';
import { WagmiProvider, createConfig } from 'wagmi';
import { Context } from '../AppContext';
import { createPublicClient, http } from 'viem';

// Mock the Wagmi hooks
vi.mock('wagmi', async () => {
  const actual = await vi.importActual('wagmi');
  return {
    ...actual,
    useAccount: () => ({ 
      chain: sepolia, 
      chainId: sepolia.id, 
      address: '0x748Cab9A6993A24CA6208160130b3f7b79098c6d'
    }),
    useBalance: () => ({ data: { value: 1000000000000000000n } }),
    useSwitchChain: () => ({
      switchChain: vi.fn(),
      isPending: false,
      isError: false,
      error: null
    })
  };
});

const queryClient = new QueryClient();

// Mock CCIP context values
export const mockContext = {
  chains: [sepolia, avalancheFuji],
  chainsInfo: { 
    [sepolia.id]: { name: 'Sepolia' },
    [avalancheFuji.id]: { name: 'Avalanche Fuji' } 
  },
  tokensList: [{ 
    address: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05', 
    symbol: 'LINK', 
    decimals: 18,
    logoURL: 'https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png'
  }],
  linkContracts: { 
    [sepolia.id]: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
    [avalancheFuji.id]: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05' 
  },
  routerAddresses: { 
    [sepolia.id]: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
    [avalancheFuji.id]: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59' 
  },
  chainSelectors: { 
    [sepolia.id]: '16015286601757825753',
    [avalancheFuji.id]: '14767482510784806043' 
  },
  sourceChainId: sepolia.id,
  destinationChainId: avalancheFuji.id,
  feeTokenSymbol: 'LINK',
  feeAmount: '0.1',
  transferStatus: 'idle',
  transferHash: null,
  messageId: null,
  isConnectOpen: false,
  setSourceChainId: () => null,
  setDestinationChainId: () => null,
  setFeeTokenSymbol: () => null,
  setFeeAmount: () => null,
  setIsConnectOpen: () => null,
  setTransferHash: () => null,
  setMessageId: () => null,
  config: {
    variant: 'default' as const,
    theme: {
      palette: {
        primary: '#000000',
        background: '#FFFFFF',
        border: '#B3B7C0',
        text: '#000000',
        muted: '#6D7480',
        input: '#FFFFFF',
        popover: '#F5F7FA',
        selected: '#D7DBE0',
        warning: '#e03c31',
        warningBackground: '#fbe9e7'
      },
      shape: { radius: 4 }
    }
  }
};

const wagmiConfig = createConfig({
  chains: [sepolia, avalancheFuji],
  client(options) {
    return createPublicClient({
      chain: options.chain,
      transport: http()
    });
  }
});

// Test providers with both WagmiProvider and Context
const TestProviders = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Context.Provider value={{
          ...mockContext,
          tokensList: [{
            address: { 
              [sepolia.id]: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05' as `0x${string}`,
              [avalancheFuji.id]: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05' as `0x${string}`
            },
            symbol: 'LINK',
            logoURL: 'https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png'
          }],
          chains: [sepolia, avalancheFuji],
          chainsInfo: {
            [sepolia.id]: { logoURL: 'https://example.com/sepolia.png', name: 'Sepolia' },
            [avalancheFuji.id]: { logoURL: 'https://example.com/avalanche-fuji.png', name: 'Avalanche Fuji' },
          },
          linkContracts: {
            [sepolia.id]: '0x779877A7B0D9E8603169DdbD7836e478b4624789' as `0x${string}`,
            [avalancheFuji.id]: '0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846' as `0x${string}`
          },
          routerAddresses: {
            [sepolia.id]: '0xD0daae2231E9CB96b94C8512223533293C3693Bf' as `0x${string}`,
            [avalancheFuji.id]: '0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8' as `0x${string}`
          },
          chainSelectors: {
            [sepolia.id]: '16015286601757825753',
            [avalancheFuji.id]: '14767482510784806043'
          },
          transferHash: undefined,
          messageId: undefined,
          sourceChainId: undefined,
          destinationChainId: undefined,
          feeTokenSymbol: undefined,
          feeTokenAddress: undefined,
          feeAmount: undefined,
          feeTokenBalance: undefined,
          isConnectOpen: false,
          setTransferHash: () => {},
          setMessageId: () => {},
          setSourceChainId: () => {},
          setDestinationChainId: () => {},
          setFeeTokenSymbol: () => {},
          setFeeAmount: () => {},
          setIsConnectOpen: () => {},
          config: mockContext.config
        }}>
          {children}
        </Context.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export const config: WidgetConfig = {
  /** The main shape of the app */
  variant: 'default' as const,
  /** Customize the theme of the app */
  theme: {
    /** Define the app colors in HEX format */
    palette: {
      /** Titles color and primary button background, default #000000 */
      primary: '#000000',
      /** Background color, default '#FFFFFF' */
      background: '#FFFFFF',
      /** Border color, default '#B3B7C0' */
      border: '#B3B7C0',
      /** Text color, default '#000000' */
      text: '#000000',
      /** Secondary text, inactive and placeholders color, default '#6D7480' */
      muted: '#6D7480',
      /** Input fields background color, default '#FFFFFF' */
      input: '#FFFFFF',
      /** Popovers, dropdowns and select fields background color, default '#F5F7FA' */
      popover: '#F5F7FA',
      /** Selected field from a dropdown background color, default '#D7DBE0' */
      selected: '#D7DBE0',
      /** Warning color, default '#e03c31' */
      warning: '#e03c31',
      /** Warning background color, default '#fbe9e7' */
      warningBackground: '#fbe9e7',
    },
    shape: {
      /** Border radius, default 4 */
      radius: 4,
    },
  },
};

describe('ActionButton', () => {
  const sepolia = {
    id: 11155111,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorers: {
      default: {
        name: 'Etherscan',
        url: 'https://sepolia.etherscan.io',
      },
    },
  };
  // const avalancheFuji = {
  //   id: avalancheFuji.id,
  //   name: 'Avalanche Fuji',
  //   network: 'avalanche-fuji',
  //   nativeCurrency: {
  //     name: 'Avalanche',
  //     symbol: 'AVAX',
  //     decimals: 18,
  //   },
  //   rpcUrls: ['https://api.avax-test.network'],
  //   blockExplorers: {
  //     default: {
  //       name: 'Etherscan',
  //       url: 'https://sepolia.etherscan.io',
  //     },
  //   },
  // };
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test('render SwitchNetwork button', () => {
    render(
      <TestProviders>
        <ActionButton
          address="0x748Cab9A6A93A24CA6208160130b3f7b79098c6d"
          chainId={sepolia.id}
          sourceChain={avalancheFuji.id}
          destinationChain={sepolia.id}
          amount="1"
        />
      </TestProviders>
    );
    const switchNetworkButton = screen.getByRole('button', { name: /switch/i });
    expect(switchNetworkButton).toBeInTheDocument();
  });
  test('render send button', () => {
    render(
      <TestProviders>
        <ActionButton
          address="0x748Cab9A6993A24CA6208160130b3f7b79098c6d"
          chainId={sepolia.id}
          destinationChain={sepolia.id}
          tokenAddress="0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05"
          amount="1"
        />
      </TestProviders>
    );
    const sendButton = screen.getByText('Send');
    expect(sendButton).toBeInTheDocument();
  });
  test('render disabled send button', () => {
    render(
      <TestProviders>
        <ActionButton
          address="0x748Cab9A6993A24CA6208160130b3f7b79098c6d"
          chainId={sepolia.id}
          destinationChain={sepolia.id}
          amount="1"
        />
      </TestProviders>
    );
    const sendButton = screen.getByText('Send');
    expect(sendButton).toBeDisabled();
  });
});
