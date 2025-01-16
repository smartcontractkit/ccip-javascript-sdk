import { screen, render, act } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import * as wagmi from 'wagmi';
import * as reactQuery from '@tanstack/react-query';
import { SendButton } from './SendButton';
import { Context } from '@/AppContext';
import { sepolia } from 'viem/chains';

vi.mock(import('wagmi'));
vi.mock(import('@tanstack/react-query'));

describe('SendButton', () => {
  test('render insufficient balance button', () => {
    vi.mocked(wagmi.useWalletClient).mockReturnValue({
      data: {},
    } as wagmi.UseWalletClientReturnType);
    vi.mocked(wagmi.useAccount).mockReturnValue({
      isConnected: true,
      isConnecting: false,
      address: '0x748Cab9A6993A24CA6208160130b3f7b79098c6d',
      connector: { name: 'MetaMask' },
    } as unknown as wagmi.UseAccountReturnType);

    vi.mocked(wagmi.useBalance).mockReturnValue({
      data: { value: 200000000n, decimals: 18 },
    } as wagmi.UseBalanceReturnType);

    vi.mocked(wagmi.useReadContract).mockResolvedValue({
      data: 100000000n,
      refetch: () => {},
    } as wagmi.UseReadContractReturnType);

    vi.mocked(wagmi.useWriteContract).mockResolvedValue({
      data: '0xc94dff6318a839d806aaff3bbf32cfe5898319ad4af25ecfbc24fa09b0ef0d4d',
      isPending: false,
      writeContract: () => {},
    } as unknown as wagmi.UseWriteContractReturnType);

    vi.mocked(reactQuery.useQuery).mockImplementation(
      () =>
        ({
          data: true,
          isPending: false,
        }) as unknown as reactQuery.UseQueryResult
    );

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockResolvedValue({
      isSuccess: true,
      isLoading: false,
    } as wagmi.UseWaitForTransactionReceiptReturnType);

    vi.mocked(reactQuery.useMutation).mockResolvedValue({
      isPending: false,
      mutate: () => {},
    } as unknown as reactQuery.UseMutationResult);

    render(
      <SendButton
        sourceChain={11155111}
        destinationChain={43113}
        tokenAddress="0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05"
        destinationAccount="0x748Cab9A6993A24CA6208160130b3f7b79098c6d"
        amount="1"
      />
    );

    const sendButton = screen.getByText('Insufficient balance');
    expect(sendButton).toBeInTheDocument();
    expect(sendButton).toBeDisabled();
  });
  test('render approve button', () => {
    vi.mocked(wagmi.useAccount).mockReturnValue({
      isConnected: true,
      isConnecting: false,
      address: '0x748Cab9A6993A24CA6208160130b3f7b79098c6d',
      connector: { name: 'MetaMask' },
      chain: sepolia,
    } as unknown as wagmi.UseAccountReturnType);

    vi.mocked(wagmi.useBalance).mockReturnValue({
      data: { value: 2000000000000000000n, decimals: 18 },
    } as wagmi.UseBalanceReturnType);

    vi.mocked(wagmi.useReadContract).mockResolvedValue({
      data: 100000000n,
      refetch: () => {},
    } as wagmi.UseReadContractReturnType);

    const useMutationResult = {
      isPending: false,
      mutate: () => console.log('Approve token'),
    };

    vi.mocked(reactQuery.useMutation).mockImplementationOnce(
      () => useMutationResult as unknown as reactQuery.UseMutationResult
    );

    const mutationFn = vi.spyOn(useMutationResult, 'mutate');

    render(
      <SendButton
        sourceChain={11155111}
        destinationChain={43113}
        tokenAddress="0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05"
        destinationAccount="0x748Cab9A6993A24CA6208160130b3f7b79098c6d"
        amount="1"
      />
    );
    const sendButton = screen.getByText('Approve');
    act(() => {
      sendButton.click();
    });
    expect(sendButton).toBeInTheDocument();
    expect(mutationFn).toBeCalled();
  });
  test('render approve LINK button', () => {
    vi.mocked(wagmi.useBalance).mockReturnValue({
      data: { value: 2000000000000000000n, decimals: 18 },
    } as wagmi.UseBalanceReturnType);

    vi.mocked(wagmi.useReadContract).mockImplementationOnce(
      () =>
        ({
          data: 100000000n,
          refetch: () => {},
        }) as wagmi.UseReadContractReturnType
    );

    vi.mocked(wagmi.useReadContract).mockImplementationOnce(
      () =>
        ({
          data: 300n,
          refetch: () => {},
        }) as wagmi.UseReadContractReturnType
    );

    const useWriteContractResult = {
      data: '0xc94dff6318a839d806aaff3bbf32cfe5898319ad4af25ecfbc24fa09b0ef0d4d',
      isPending: false,
      writeContract: () => console.log('Approve LINK'),
    };

    vi.mocked(wagmi.useWriteContract).mockImplementationOnce(
      () =>
        useWriteContractResult as unknown as wagmi.UseWriteContractReturnType
    );
    const writeContractFn = vi.spyOn(useWriteContractResult, 'writeContract');

    render(
      <Context.Provider
        value={{
          chains: [],
          chainsInfo: {},
          tokensList: [],
          linkContracts: {},
          routerAddresses: {},
          chainSelectors: {},
          setTransferHash: () => null,
          setMessageId: () => null,
          setSourceChainId: () => null,
          setDestinationChainId: () => null,
          setFeeTokenSymbol: () => null,
          setFeeAmount: () => null,
          setIsConnectOpen: () => null,
          feeTokenAddress: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
          feeAmount: 1000n,
        }}
      >
        <SendButton
          sourceChain={11155111}
          destinationChain={43113}
          tokenAddress="0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05"
          destinationAccount="0x748Cab9A6993A24CA6208160130b3f7b79098c6d"
          amount="1"
        />
      </Context.Provider>
    );
    const sendButton = screen.getByText('Approve LINK');
    act(() => {
      sendButton.click();
    });
    expect(sendButton).toBeInTheDocument();
    expect(writeContractFn).toBeCalled();
  });
  test('render send button', () => {
    vi.mocked(wagmi.useBalance).mockReturnValue({
      data: { value: 2000000000000000000n, decimals: 18 },
    } as wagmi.UseBalanceReturnType);

    vi.mocked(wagmi.useReadContract).mockImplementationOnce(
      () =>
        ({
          data: 2000000000000000000n,
          refetch: () => {},
        }) as wagmi.UseReadContractReturnType
    );

    vi.mocked(reactQuery.useQuery).mockImplementation(
      () =>
        ({
          data: true,
          isPending: false,
        }) as unknown as reactQuery.UseQueryResult
    );

    const useMutationResult = {
      isPending: false,
      mutate: () => console.log('Send tokens'),
    };

    vi.mocked(reactQuery.useMutation).mockImplementation(
      () => useMutationResult as unknown as reactQuery.UseMutationResult
    );

    const mutationFn = vi.spyOn(useMutationResult, 'mutate');

    render(
      <SendButton
        sourceChain={11155111}
        destinationChain={43113}
        tokenAddress="0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05"
        destinationAccount="0x748Cab9A6993A24CA6208160130b3f7b79098c6d"
        amount="1"
      />
    );

    const sendButton = screen.getByText('Send');
    act(() => {
      sendButton.click();
    });
    expect(sendButton).toBeInTheDocument();
    expect(mutationFn).toBeCalled();
  });
});
