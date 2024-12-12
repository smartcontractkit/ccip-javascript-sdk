import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { coinbaseWallet, injected, metaMask, walletConnect } from 'wagmi/connectors';
import { ChevronDown, Plus, X } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAppContext } from '@/hooks/useAppContext';
import { useWallets } from '@/hooks/useWallets';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { WALLET_LOGOS } from '@/components/Logos';
import { MetaMaskSVG } from '@/components/svg/metamask';
import { WalletConnectSVG } from '@/components/svg/walletconnect';
import { CoinbaseSVG } from '@/components/svg/coinbase';
import { BrowserSVG } from './svg/browser';

function ConnectButton() {
  const { setIsConnectOpen } = useAppContext();

  return (
    <Button
      variant="outline"
      className="rounded-[4px] h-8"
      onClick={() => setIsConnectOpen(true)}
    >
      Connect Wallet
      <Plus width={20.58} height={20.58} className="-my-1 -mr-1 ml-[4px]" />
    </Button>
  );
}

function Account() {
  const { style } = useTheme();
  const { address, connector } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <Popover>
      <PopoverTrigger className="rounded-[4px] border border-ccip-border text-sm font-medium flex items-center h-8 px-4 py-2 space-x-2 group data-[state=open]:bg-ccip-popover">
        <div className="w-2 h-2 rounded-full bg-[#14CC6C]" />
        <div>{address && truncateAddress(address)}</div>
        <ChevronDown className="h-4 w-4 opacity-50 group-data-[state=open]:rotate-180 transition-all" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex items-center p-3 w-auto space-x-3 border-ccip-border"
        style={style}
      >
        {connector && WALLET_LOGOS[connector.name]}
        <div>
          <p className="text-ccip-muted font-medium text-[10px] leading-3">
            {`${connector?.name == `Injected` ? `Browser` : connector?.name} Connected`}
          </p>
          <div className="text-sm font-medium flex items-center space-x-2 text-ccip-text">
            <div className="w-2 h-2 rounded-full bg-[#14CC6C]" />
            <div>{address && truncateAddress(address)}</div>
          </div>
        </div>
        <Button
          variant="outline"
          className="rounded-[4px] h-8 bg-ccip-popover hover:bg-ccip-text hover:text-ccip-popover"
          onClick={() => disconnect()}
        >
          Disconnect
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export function ConnectWallet() {
  const { isConnected, isConnecting } = useAccount();
  if (isConnecting)
    return (
      <div className="rounded-[4px] border border-ccip-border text-sm font-medium flex items-center h-8 px-4 py-2 space-x-2">
        <div className="w-2 h-2 rounded-full bg-[#E59808] animate-pulse" />
        <div>Detecting...</div>
      </div>
    );
  if (isConnected) return <Account />;
  return <ConnectButton />;
}

export function ChooseWallet() {
  const { setIsConnectOpen } = useAppContext();
  const { walletConfig } = useWallets();
  const { isPending, connect } = useConnect();

  return (
    <div className="p-6 space-y-6 flex flex-col h-screen md:h-auto md:min-h-[640px]">
      <div className="flex items-center justify-end -mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsConnectOpen(false)}
        >
          <X />
        </Button>
      </div>
      <div className="flex items-center justify-center">
        <h3 className="text-[32px] font-bold leading-[40px]">Connect Wallet</h3>
      </div>
      <Button
        variant="ghost"
        size="unspecified"
        className="border border-ccip-border rounded-lg bg-ccip-popover grow flex-col space-y-4 group"
        disabled={isPending}
        onClick={() =>
          connect(
            { connector: injected(walletConfig?.injected) },
            { onSuccess: () => setIsConnectOpen(false) }
          )
        }
      >
        <BrowserSVG className="group-hover:scale-110 transition-transform" />
        <p className="text-base font-medium">Browser</p>
      </Button>
      <Button
        variant="ghost"
        size="unspecified"
        className="border border-ccip-border rounded-lg bg-ccip-popover grow flex-col space-y-4 group"
        disabled={isPending}
        onClick={() =>
          connect(
            { connector: metaMask(walletConfig?.metamask) },
            { onSuccess: () => setIsConnectOpen(false) }
          )
        }
      >
        <MetaMaskSVG className="group-hover:scale-110 transition-transform" />
        <p className="text-base font-medium">MetaMask</p>
      </Button>
      {walletConfig?.walletConnect && walletConfig.walletConnect.projectId && (
        <Button
          variant="ghost"
          size="unspecified"
          className="border border-ccip-border rounded-lg bg-ccip-popover grow flex-col space-y-4 group"
          disabled={isPending}
          onClick={() =>
            connect(
              { connector: walletConnect(walletConfig.walletConnect!) },
              { onSuccess: () => setIsConnectOpen(false) }
            )
          }
        >
          <WalletConnectSVG className="group-hover:scale-110 transition-transform" />
          <p className="text-base font-medium">WalletConnect</p>
        </Button>
      )}
      <Button
        variant="ghost"
        size="unspecified"
        className="border border-ccip-border rounded-lg bg-ccip-popover grow flex-col space-y-4 group"
        disabled={isPending}
        onClick={() =>
          connect(
            { connector: coinbaseWallet(walletConfig?.coinbaseWallet) },
            { onSuccess: () => setIsConnectOpen(false) }
          )
        }
      >
        <CoinbaseSVG className="group-hover:scale-110 transition-transform" />
        <p className="text-base font-medium">Coinbase Wallet</p>
      </Button>
    </div>
  );
}

const truncateAddress = (address: string) =>
  `${address.substring(0, 5)}...${address.substring(address.length - 3)}`;
