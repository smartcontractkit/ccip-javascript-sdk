import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { Token } from '@/types';
import { sepolia, avalancheFuji } from 'viem/chains';

export const testTokenList: Token[] = [
  {
    symbol: 'ETH',
    address: {
      [sepolia.id]: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
    },
    logoURL: 'https://example.com/eth.png',
  },
  {
    symbol: 'AVAX',
    address: {
      [avalancheFuji.id]: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    },
    logoURL: 'https://example.com/avax.png',
  },
];

// runs a clean after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
