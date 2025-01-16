import { createClient } from 'viem';
import { http, createConfig, Config as WagmiConfig } from 'wagmi';
import { Chain } from 'wagmi/chains';
import { Config } from '@/types';

export const config = (chains: [Chain, ...Chain[]]): WagmiConfig =>
  createConfig({
    chains,
    client({ chain }) {
      return createClient({ chain, transport: http() });
    },
  });

export const DEFAULT_CONFIG: Config = {
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
