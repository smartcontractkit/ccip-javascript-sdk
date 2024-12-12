import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { TxProgress } from './TxProgress';
import * as wagmi from 'wagmi';
import * as reactQuery from '@tanstack/react-query';
import { TransferStatus } from '@chainlink/ccip-js';

vi.mock(import('wagmi'));
vi.mock(import('@tanstack/react-query'));

describe('TxProgress', () => {
  test('render transaction confirmed', () => {
    vi.mocked(wagmi.useAccount).mockReturnValue({
      isConnected: true,
      isConnecting: false,
      address: '0x748Cab9A6993A24CA6208160130b3f7b79098c6d',
      connector: { name: 'MetaMask' },
    } as unknown as wagmi.UseAccountReturnType);
    vi.mocked(wagmi.useWaitForTransactionReceipt).mockImplementationOnce(
      () =>
        ({
          isSuccess: true,
          isLoading: false,
        }) as wagmi.UseWaitForTransactionReceiptReturnType
    );

    vi.mocked(reactQuery.useQuery).mockImplementationOnce(
      () =>
        ({
          data: TransferStatus.Success,
        }) as unknown as reactQuery.UseQueryResult<TransferStatus, unknown>
    );
    render(<TxProgress />);
    const txConfirmed = screen.getByText('Transaction confirmed');
    expect(txConfirmed).toBeInTheDocument();
  });

  test('render waiting for finality', () => {
    vi.mocked(wagmi.useWaitForTransactionReceipt).mockImplementationOnce(
      () =>
        ({
          isSuccess: true,
          isLoading: false,
        }) as wagmi.UseWaitForTransactionReceiptReturnType
    );

    vi.mocked(reactQuery.useQuery).mockImplementationOnce(
      () =>
        ({
          data: TransferStatus.InProgress,
        }) as unknown as reactQuery.UseQueryResult<TransferStatus, unknown>
    );
    render(<TxProgress />);
    const txConfirmed = screen.getByText('In progress...');
    expect(txConfirmed).toBeInTheDocument();
  });
});
