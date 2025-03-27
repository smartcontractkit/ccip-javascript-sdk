import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Fees } from './Fees';
import * as wagmi from 'wagmi';
import * as reactQuery from '@tanstack/react-query';
import { avalancheFuji, sepolia } from 'viem/chains';

vi.mock(import('wagmi'));
vi.mock(import('@tanstack/react-query'));

describe('Fees', () => {
  test('render fees', () => {
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
    vi.mocked(reactQuery.useQuery).mockImplementation(
      () =>
        ({
          data: 300000000000n,
          isPending: false,
        }) as reactQuery.UseQueryResult
    );
    render(
      <Fees
        sourceChain={sepolia.id}
        destinationChain={avalancheFuji.id}
        tokenAddress="0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05"
        amount="1"
        chainId={sepolia.id}
      />
    );
    const feeDisplay = screen.getByText('0.0000003');
    expect(feeDisplay).toBeInTheDocument();
  });
  test('render pending', () => {
    vi.mocked(wagmi.useReadContract).mockImplementation(
      () =>
        ({
          data: 18,
        }) as wagmi.UseReadContractReturnType
    );
    vi.mocked(reactQuery.useQuery).mockImplementation(
      () =>
        ({
          data: undefined,
          isPending: true,
        }) as reactQuery.UseQueryResult
    );
    render(
      <Fees
        sourceChain={sepolia.id}
        destinationChain={avalancheFuji.id}
        tokenAddress="0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05"
        amount="1"
        chainId={sepolia.id}
      />
    );
    const feeDisplay = screen.getByText('Fees + Destination gas');
    expect(feeDisplay).toBeInTheDocument();
    const loadingDiv = screen.getAllByRole('generic')[1];
    expect(loadingDiv).toHaveClass('animate-pulse');
  });
  test('do not render if not connected to the correct network', () => {
    // Mock account with required chain properties
    vi.mocked(wagmi.useAccount).mockReturnValue({
      isConnected: true,
      isConnecting: false,
      chain: { id: 1 },
      address: '0x748Cab9A6993A24CA6208160130b3f7b79098c6d',
      connector: { name: 'MetaMask' },
    } as unknown as wagmi.UseAccountReturnType);
    
    vi.mocked(wagmi.useReadContract).mockImplementation(
      () =>
        ({
          data: 18,
        }) as wagmi.UseReadContractReturnType
    );
    vi.mocked(reactQuery.useQuery).mockImplementation(
      () =>
        ({
          data: 300000000000n,
          isPending: false,
        }) as reactQuery.UseQueryResult
    );
    
    // Render with different sourceChain and chainId to trigger the "return null" condition
    const { container } = render(
      <Fees
        sourceChain={sepolia.id}
        destinationChain={avalancheFuji.id}
        tokenAddress="0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05"
        amount="1"
        chainId={avalancheFuji.id} // Different from sourceChain (sepolia.id)
      />
    );
    
    // Check that the container is empty (component returned null)
    expect(container.firstChild).toBeNull();
  });
});
