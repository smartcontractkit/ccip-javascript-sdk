import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ChooseWallet, ConnectWallet } from './ConnectWallet';
import * as wagmi from 'wagmi';
import * as walletsHook from '@/hooks/useWallets';

vi.mock(import('wagmi'));

describe('ConnectWallet', () => {
  test('render account', () => {
    vi.mocked(wagmi.useAccount).mockReturnValue({
      isConnected: true,
      isConnecting: false,
      address: '0x748Cab9A6993A24CA6208160130b3f7b79098c6d',
      connector: { name: 'MetaMask' },
    } as unknown as wagmi.UseAccountReturnType);

    const useDisconnectResult = { disconnect: () => console.log('Disconnect') };
    const disconnectFn = vi.spyOn(useDisconnectResult, 'disconnect');

    vi.mocked(wagmi.useDisconnect).mockImplementationOnce(
      () => useDisconnectResult as wagmi.UseDisconnectReturnType
    );
    render(<ConnectWallet />);
    const triggerButton = screen.getByRole('button');
    waitFor(() => act(() => triggerButton.click()));
    const disconnectButton = screen.getByText('Disconnect');
    expect(disconnectButton).toBeInTheDocument();
    act(() => disconnectButton.click());
    expect(disconnectFn).toBeCalled();
  });
  test('render ChooseWallet', () => {
    const useConnectResult = {
      isPending: false,
      connect: () => console.log('Connect'),
    };
    const connectFn = vi.spyOn(useConnectResult, 'connect');
    vi.mocked(wagmi.useConnect).mockImplementationOnce(
      () => useConnectResult as unknown as wagmi.UseConnectReturnType
    );
    vi.spyOn(walletsHook, 'useWallets').mockImplementationOnce(() => ({
      walletConfig: { walletConnect: { projectId: 'projectId' } },
    }));
    render(<ChooseWallet />);
    const metaMaskBtn = screen.getByText('MetaMask').closest('button');
    expect(metaMaskBtn).toBeInTheDocument();
    const walletConnectBtn = screen
      .getByText('WalletConnect')
      .closest('button');
    expect(walletConnectBtn).toBeInTheDocument();
    const coinBaseBtn = screen.getByText('Coinbase Wallet').closest('button');
    expect(coinBaseBtn).toBeInTheDocument();
    act(() => {
      metaMaskBtn?.click();
      walletConnectBtn?.click();
      coinBaseBtn?.click();
    });
    expect(connectFn).toBeCalledTimes(3);
  });
});
