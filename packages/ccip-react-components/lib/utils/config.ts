import { Address, createClient } from 'viem';
import { http, createConfig, Config as WagmiConfig } from 'wagmi';
import {
  arbitrumSepolia,
  avalancheFuji,
  baseSepolia,
  Chain,
  bscTestnet,
  optimismSepolia,
  polygonAmoy,
  sepolia,
} from 'wagmi/chains';
import { Config } from '@/types';

export const chains: readonly [Chain, ...Chain[]] = [
  arbitrumSepolia,
  avalancheFuji,
  baseSepolia,
  bscTestnet,
  sepolia,
  optimismSepolia,
  polygonAmoy,
];

export const config: WagmiConfig = createConfig({
  chains,
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});

export const LINK_CONTRACTS: Record<string, Address> = {
  [arbitrumSepolia.id]: '0xb1D4538B4571d411F07960EF2838Ce337FE1E80E',
  [avalancheFuji.id]: '0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846',
  [baseSepolia.id]: '0xE4aB69C077896252FAFBD49EFD26B5D171A32410',
  [bscTestnet.id]: '0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06',
  [sepolia.id]: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
  [optimismSepolia.id]: '0xE4aB69C077896252FAFBD49EFD26B5D171A32410',
  [polygonAmoy.id]: '0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904',
};

export const ROUTER_ADDRESSES: Record<string, Address> = {
  [arbitrumSepolia.id]: '0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165',
  [avalancheFuji.id]: '0xF694E193200268f9a4868e4Aa017A0118C9a8177',
  [baseSepolia.id]: '0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93',
  [bscTestnet.id]: '0xE1053aE1857476f36A3C62580FF9b016E8EE8F6f',
  [sepolia.id]: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
  [optimismSepolia.id]: '0x114a20a10b43d4115e5aeef7345a1a71d2a60c57',
  [polygonAmoy.id]: '0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2',
};

export const CHAIN_SELECTORS: Record<string, string> = {
  [arbitrumSepolia.id]: '3478487238524512106',
  [avalancheFuji.id]: '14767482510784806043',
  [baseSepolia.id]: '10344971235874465080',
  [bscTestnet.id]: '13264668187771770619',
  [sepolia.id]: '16015286601757825753',
  [optimismSepolia.id]: '5224473277236331295',
  [polygonAmoy.id]: '16281711391670634445',
};

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
