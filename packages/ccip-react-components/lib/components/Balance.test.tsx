import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Balance, MaxButon } from './Balance';
import * as wagmi from 'wagmi';

vi.mock(import('wagmi'));

// Mock the ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Stub the global ResizeObserver
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

describe('Balance', () => {
  test('do not render if not connected', () => {
    vi.mocked(wagmi.useAccount).mockReturnValue({
      isConnected: false,
      isConnecting: false,
      address: undefined,
      addresses: undefined,
      chain: undefined,
      chainId: undefined,
      connector: undefined,
      isDisconnected: false,
      isReconnecting: true,
      status: 'reconnecting',
    });

    vi.mocked(wagmi.useBalance).mockReturnValue({
      isLoading: true,
      data: undefined,
    } as wagmi.UseBalanceReturnType);

    render(
      <Balance
        tokenAddress="0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05"
        setAmount={() => {}}
      />
    );
    const div = screen.getByRole('generic');
    expect(div).toBeEmptyDOMElement();
  });
  test('render loading', () => {
    vi.mocked(wagmi.useAccount).mockReturnValue({
      isConnected: true,
      isConnecting: false,
      address: '0x748Cab9A6993A24CA6208160130b3f7b79098c6d',
      addresses: undefined,
      chain: undefined,
      chainId: undefined,
      connector: undefined,
      isDisconnected: false,
      isReconnecting: true,
      status: 'reconnecting',
    });

    vi.mocked(wagmi.useBalance).mockReturnValue({
      isLoading: true,
    } as wagmi.UseBalanceReturnType);

    render(
      <Balance
        tokenAddress="0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05"
        setAmount={() => {}}
      />
    );
    expect(screen.getByText('Balance: ...')).toBeInTheDocument();
  });
  test('render balance', () => {
    vi.mocked(wagmi.useAccount).mockReturnValue({
      isConnected: true,
      isConnecting: false,
      address: '0x748Cab9A6993A24CA6208160130b3f7b79098c6d',
      addresses: undefined,
      chain: undefined,
      chainId: undefined,
      connector: undefined,
      isDisconnected: false,
      isReconnecting: true,
      status: 'reconnecting',
    });

    vi.mocked(wagmi.useBalance).mockReturnValue({
      data: { value: 100000000n, decimals: 18 },
    } as wagmi.UseBalanceReturnType);

    render(
      <Balance
        tokenAddress="0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05"
        amount="40000000"
        setAmount={() => {}}
      />
    );
    expect(screen.getByText('Balance: 0.0000000001')).toBeInTheDocument();
  });
});

describe('MaxButton', () => {
  test('render max button', () => {
    render(
      <MaxButon
        tokenAddress="0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05"
        setAmount={() => {}}
      />
    );
  });
});
