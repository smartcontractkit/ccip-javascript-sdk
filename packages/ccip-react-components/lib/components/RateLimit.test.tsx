import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { RateLimit } from './RateLimit';
import * as wagmi from 'wagmi';
import * as reactQuery from '@tanstack/react-query';

vi.mock(import('wagmi'));
vi.mock(import('@tanstack/react-query'));

describe('RateLimit', () => {
  test('render when the pool will refil', () => {
    vi.mocked(wagmi.useAccount).mockReturnValue({
      isConnected: true,
      isConnecting: false,
      address: '0x748Cab9A6993A24CA6208160130b3f7b79098c6d',
      connector: { name: 'MetaMask' },
    } as unknown as wagmi.UseAccountReturnType);
    vi.mocked(wagmi.useReadContract).mockImplementation(
      () =>
        ({
          data: 18,
        }) as wagmi.UseReadContractReturnType
    );
    vi.mocked(wagmi.useBalance).mockReturnValue({
      data: { value: 2000000000000000000n, decimals: 18 },
    } as wagmi.UseBalanceReturnType);

    vi.mocked(reactQuery.useQuery).mockImplementation(
      () =>
        ({
          data: {
            tokens: 100000000000000000n,
            capacity: 3000000000000000000n,
            rate: 10000000000000000n,
          },
          isPending: false,
        }) as reactQuery.UseQueryResult
    );

    render(
      <RateLimit
        sourceChain={11155111}
        destinationChain={43113}
        tokenAddress="0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05"
        amount="1"
        chainId={11155111}
      />
    );
    const div = screen.getByText(
      'Not enough tokens in the pool. It will refill in 90 seconds'
    );
    expect(div).toBeInTheDocument();
  });
  test('render if transaction exceeds capacity', () => {
    vi.mocked(wagmi.useReadContract).mockImplementation(
      () =>
        ({
          data: 18,
        }) as wagmi.UseReadContractReturnType
    );
    vi.mocked(wagmi.useBalance).mockReturnValue({
      data: { value: 5000000000000000000n, decimals: 18 },
    } as wagmi.UseBalanceReturnType);

    vi.mocked(reactQuery.useQuery).mockImplementation(
      () =>
        ({
          data: {
            tokens: 100000000000000000n,
            capacity: 3000000000000000000n,
            rate: 10000000000000000n,
          },
          isPending: false,
        }) as reactQuery.UseQueryResult
    );

    render(
      <RateLimit
        sourceChain={11155111}
        destinationChain={43113}
        tokenAddress="0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05"
        amount="4"
        chainId={11155111}
      />
    );
    const div = screen.getByText('Amount exceeds capacity per transaction.');
    expect(div).toBeInTheDocument();
  });
  test('do not render if within rate limits', () => {
    vi.mocked(wagmi.useReadContract).mockImplementation(
      () =>
        ({
          data: 18,
        }) as wagmi.UseReadContractReturnType
    );
    vi.mocked(wagmi.useBalance).mockReturnValue({
      data: { value: 2000000000000000000n, decimals: 18 },
    } as wagmi.UseBalanceReturnType);

    vi.mocked(reactQuery.useQuery).mockImplementation(
      () =>
        ({
          data: {
            limits: 3000000000000000000n,
            capacity: 3000000000000000000n,
          },
          isPending: false,
        }) as reactQuery.UseQueryResult
    );

    render(
      <RateLimit
        sourceChain={11155111}
        destinationChain={43113}
        tokenAddress="0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05"
        amount="1"
        chainId={11155111}
      />
    );
    const div = screen.getByRole('generic');
    expect(div).toBeEmptyDOMElement();
  });
});
