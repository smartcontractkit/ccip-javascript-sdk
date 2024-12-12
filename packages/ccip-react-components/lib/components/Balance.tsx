'use client';

import { formatUnits, Address, parseUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';

import { cn } from '@/utils';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

type Props = {
  className?: string;
  tokenAddress: Address;
  amount?: string;
  setAmount: (v: string) => void;
};

export function Balance({ className, tokenAddress, amount, setAmount }: Props) {
  const { address: accountAddress } = useAccount();
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address: accountAddress,
    token: tokenAddress,
  });
  if (!accountAddress) {
    return null;
  }
  if (isBalanceLoading) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Slider defaultValue={[0]} max={100} step={1} disabled />
        <div className="animate-pulse text-sm leading-4 text-ccip-muted shrink-0 whitespace-nowrap">
          Balance: ...
        </div>
      </div>
    );
  }
  if (balance) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Slider
          value={[Number(parseUnits(amount ?? '0', balance.decimals))]}
          onValueChange={([v]) =>
            setAmount(formatUnits(BigInt(v), balance.decimals))
          }
          max={Number(balance.value)}
          step={10 ** (balance.decimals - 3)}
        />
        <div className="text-sm leading-4 text-ccip-muted shrink-0 whitespace-nowrap">{`Balance: ${formatUnits(balance.value, balance.decimals)}`}</div>
      </div>
    );
  }
}

export function MaxButon({ className, tokenAddress, setAmount }: Props) {
  const { address: accountAddress } = useAccount();
  const { data: balance } = useBalance({
    address: accountAddress,
    token: tokenAddress,
  });

  const setMaxAmount = () => {
    if (accountAddress && balance) {
      setAmount(formatUnits(BigInt(balance.value), balance.decimals));
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'bg-ccip-input hover:cursor-pointer font-medium',
        className
      )}
      onClick={setMaxAmount}
    >
      MAX
    </Badge>
  );
}
