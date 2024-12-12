import { render, screen, waitFor } from '@testing-library/react';
import { App } from './App';
import { describe, expect, test } from 'vitest';
import { optimismSepolia, sepolia } from 'viem/chains';
import { Token } from './types';

const tokensList: Token[] = [
  {
    symbol: 'CCIP-BnM',
    address: { 
        [sepolia.id]: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
        [optimismSepolia.id]: '0x8aF4204e30565DF93352fE8E1De78925F6664dA7',
    },
    logoURL:
      'https://smartcontract.imgix.net/tokens/ccip-bnm.webp?auto=compress%2Cformat',
  }
];

describe('App', () => {
  test('renders the default App component', () => {
    render(<App tokensList={tokensList} />);
    waitFor(() => {
      expect(screen.getByText('Detecting...')).toBeNull();
    });
    const appContainer = screen.getAllByRole('generic')[1];
    expect(appContainer).toHaveClass('md:w-[473px]');
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Transfer');
  });
  test('renders the App in compact variant', () => {
    render(<App tokensList={tokensList} config={{ variant: 'compact' }} />);
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
        tokensList={tokensList}
        config={{ variant: 'drawer' }}
        drawer={{ open: true }}
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
