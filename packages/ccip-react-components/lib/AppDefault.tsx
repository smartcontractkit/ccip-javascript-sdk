'use client';

import { useAppContext } from '@/hooks/useAppContext';
import { BridgeForm } from '@/pages/BridgeForm';
import { TxProgress } from '@/pages/TxProgress';
import { ConnectWallet, ChooseWallet } from '@/components/ConnectWallet';
import { CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { ChainlinkSVG } from '@/components/svg/chainlink';
import { cn } from '@/utils';

export const Default = () => {
  const { messageId, isConnectOpen } = useAppContext();

  if (isConnectOpen) return <ChooseWallet />;

  if (messageId) {
    return (
      <>
        <Header />
        <TxProgress />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <BridgeForm />
      <Footer />
    </>
  );
};

const Header = () => (
  <CardHeader className="flex-row justify-between items-center space-y-0 text-ccip-primary">
    <CardTitle>Transfer</CardTitle>
    <ConnectWallet />
  </CardHeader>
);

const Footer = () => {
  const { config } = useAppContext();
  return (
    <CardFooter
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {config?.showFaucet && (
        <a
          href="https://faucets.chain.link"
          target="_blank"
          className={cn(
            buttonVariants({ variant: 'default' }),
            'flex w-full bg-[#8AA6F9] hover:no-underline space-x-2 text-xs font-bold text-white group hover:bg-[#0847F7] h-8'
          )}
          onClick={() => window.open('https://faucets.chain.link', '_blank')}
        >
          <span>GET TESTNET TOKENS</span>
        </a>
      )}

      <a
        href="https://chain.link/cross-chain"
        target="_blank"
        className={cn(
          buttonVariants({ variant: 'link' }),
          'hover:no-underline space-x-2 text-xs font-bold text-ccip-muted group hover:text-[#0847F7] p-0 h-4'
        )}
      >
        <ChainlinkSVG className="fill-ccip-muted group-hover:fill-ccip-text transition-colors" />
        <span>CHAINLINK CCIP</span>
      </a>
    </CardFooter>
  );
};
