'use client';

import { useSwitchChain } from 'wagmi';
import { Address } from 'viem';

import { useAppContext } from '@/hooks/useAppContext';
import { Button } from '@/components/ui/button';
import { SendButton } from '@/components/SendButton';
import { Error } from '@/components/Error';
import { useChains } from '@/hooks/useChains';

export function ActionButton({
  sourceChain,
  destinationChain,
  amount,
  disabled,
  tokenAddress,
  address,
  chainId,
}: {
  sourceChain?: number;
  destinationChain?: number;
  amount: string;
  disabled?: boolean;
  tokenAddress?: Address;
  address?: Address;
  chainId?: number;
}) {
  if (!address || !chainId) {
    return <ConnectButton />;
  }

  if (sourceChain && sourceChain !== chainId) {
    return <SwitchNetworkButton chainId={sourceChain} />;
  }

  const canShowSendButton = sourceChain && destinationChain && tokenAddress;

  return canShowSendButton ? (
    <SendButton
      destinationAccount={address}
      disabled={disabled}
      amount={amount}
      sourceChain={sourceChain}
      destinationChain={destinationChain}
      tokenAddress={tokenAddress}
    />
  ) : (
    <Button className="w-full text-xl leading-6 h-[52px]" disabled>
      Send
    </Button>
  );
}

function SwitchNetworkButton({ chainId }: { chainId: number }) {
  const { switchChain, isPending, error, isError } = useSwitchChain();
  const { chainsInfo } = useChains();
  return (
    <>
      {isError && <Error message={error.message.split('.')[0]} />}
      <Button
        disabled={isPending}
        className="w-full text-xl leading-6 h-[52px]"
        onClick={() => switchChain({ chainId })}
      >
        Switch to {`${chainsInfo[chainId].name ?? 'Unknown'}`}
      </Button>
    </>
  );
}

function ConnectButton() {
  const { setIsConnectOpen } = useAppContext();
  return (
    <Button
      className="w-full text-xl leading-6 h-[52px]"
      onClick={() => setIsConnectOpen(true)}
    >
      Connect Wallet
    </Button>
  );
}
