import { MetaMaskSVG } from '@/components/svg/metamask';
import { WalletConnectSVG } from '@/components/svg/walletconnect';
import { CoinbaseSVG } from '@/components/svg/coinbase';
import { BrowserSVG } from '@/components/svg/browser';

export const WALLET_LOGOS: Record<string, JSX.Element> = {
  ['Injected']: <BrowserSVG width={32} height={32} />,
  ['MetaMask']: <MetaMaskSVG width={32} height={32} />,
  ['WalletConnect']: <WalletConnectSVG width={32} height={32} />,
  ['Coinbase Wallet']: <CoinbaseSVG width={32} height={32} />,
};
