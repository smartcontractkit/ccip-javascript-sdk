import { render, screen, waitFor } from '@testing-library/react';
import { App } from './App';
import { describe, expect, test } from 'vitest';
import { optimismSepolia, sepolia } from 'viem/chains';
import { NetworkConfig } from './types';

const networkConfing: NetworkConfig = {
  chains: [{ chain: sepolia }, { chain: optimismSepolia }],
  linkContracts: {
    [sepolia.id]: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
    [optimismSepolia.id]: '0xE4aB69C077896252FAFBD49EFD26B5D171A32410',
  },
  routerAddresses: {
    [sepolia.id]: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
    [optimismSepolia.id]: '0x114a20a10b43d4115e5aeef7345a1a71d2a60c57',
  },
  chainSelectors: {
    [sepolia.id]: '16015286601757825753',
    [optimismSepolia.id]: '5224473277236331295',
  },
  tokensList: [
    {
      symbol: 'CCIP-BnM',
      address: {
        [sepolia.id]: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
        [optimismSepolia.id]: '0x8aF4204e30565DF93352fE8E1De78925F6664dA7',
      },
      logoURL:
        'https://smartcontract.imgix.net/tokens/ccip-bnm.webp?auto=compress%2Cformat',
    },
  ],
};

describe('App', () => {
  test('renders the default App component', () => {
    render(<App networkConfig={networkConfing} />);
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
      <App config={{ variant: 'compact' }} networkConfig={networkConfing} />
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
      <App
        config={{ variant: 'drawer' }}
        drawer={{ open: true }}
        networkConfig={networkConfing}
      />
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
