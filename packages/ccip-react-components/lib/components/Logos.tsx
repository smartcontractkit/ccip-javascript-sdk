import {
  arbitrumSepolia,
  avalancheFuji,
  baseSepolia,
  bscTestnet,
  optimismSepolia,
  polygonAmoy,
  sepolia,
} from 'wagmi/chains';
import { MetaMaskSVG } from '@/components/svg/metamask';
import { WalletConnectSVG } from '@/components/svg/walletconnect';
import { CoinbaseSVG } from '@/components/svg/coinbase';
import { BrowserSVG } from '@/components/svg/browser';

import { ArbitrumSVG } from '@/components/svg/arbitrum';
import { AvalancheSVG } from '@/components/svg/avalanche';
import { BaseSVG } from '@/components/svg/base';
import { BnbSVG } from '@/components/svg/bnb';
import { EthereumSVG } from '@/components/svg/ethereum';
import { OptimismSVG } from '@/components/svg/optimism';
import { PolygonSVG } from '@/components/svg/polygon';

export const NETWORK_INFO: Record<string, { logo: JSX.Element; name: string }> =
  {
    [arbitrumSepolia.id]: { logo: <ArbitrumSVG />, name: arbitrumSepolia.name },
    [avalancheFuji.id]: { logo: <AvalancheSVG />, name: avalancheFuji.name },
    [baseSepolia.id]: { logo: <BaseSVG />, name: baseSepolia.name },
    [bscTestnet.id]: { logo: <BnbSVG />, name: bscTestnet.name },
    [sepolia.id]: { logo: <EthereumSVG />, name: sepolia.name },
    [optimismSepolia.id]: { logo: <OptimismSVG />, name: optimismSepolia.name },
    [polygonAmoy.id]: { logo: <PolygonSVG />, name: polygonAmoy.name },
  };

export const WALLET_LOGOS: Record<string, JSX.Element> = {
  ['Injected']: <BrowserSVG width={32} height={32} />,
  ['MetaMask']: <MetaMaskSVG width={32} height={32} />,
  ['WalletConnect']: <WalletConnectSVG width={32} height={32} />,
  ['Coinbase Wallet']: <CoinbaseSVG width={32} height={32} />,
};
