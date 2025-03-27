import { createClient, http } from 'viem';
import { arbitrumSepolia, avalancheFuji, bscTestnet, sepolia, polygonAmoy } from 'viem/chains';
import { Chain } from 'viem/chains';

type ViemConfig = {
  chains: Chain[];
  client: ({ chain }: { chain: Chain }) => any;
  theme?: {
    palette: {
      background: string;
      primary: string;
      border: string;
      text: string;
      muted: string;
      input: string;
      popover: string;
      selected: string;
      warning: string;
      warningBackground: string;
    };
    shape: { radius: number };
  };
};

export const config = (chains: [Chain, ...Chain[]]): ViemConfig =>
  ({
    chains,
    client({ chain }: { chain: Chain }) {
      return createClient({ chain, transport: http() });
    },
  });

export const DEFAULT_CONFIG: ViemConfig = {
  chains: [arbitrumSepolia, avalancheFuji, bscTestnet, sepolia, polygonAmoy],
  client({ chain }: { chain: Chain }) {
    return createClient({ chain, transport: http() });
  },
  theme: {
    palette: {
      background: '#FFFFFF',
      primary: '#000000',
      border: '#B3B7C0',
      text: '#000000',
      muted: '#6D7480',
      input: '#FFFFFF',
      popover: '#F5F7FA',
      selected: '#D7DBE0',
      warning: '#F7B955',
      warningBackground: '#FFF5E0',
    },
    shape: { radius: 6 },
  },
};
