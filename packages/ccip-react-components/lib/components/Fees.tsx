import { useEffect } from 'react';
import { useAccount, usePublicClient, useReadContract } from 'wagmi';
import { Address, formatEther, parseUnits } from 'viem';
import { useQuery } from '@tanstack/react-query';
import { IERC20ABI } from '@chainlink/ccip-js';
import { cn } from '@/utils';
import { ccipClient } from '@/utils/ccip-client';
import { useAppContext } from '@/hooks/useAppContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button, buttonVariants } from '@/components/ui/button';
import { Error } from '@/components/Error';
import { InfoSVG } from '@/components/svg/info';
import { InfoTooltipSVG } from '@/components/svg/info-tooltip';
import { ChevronSVG } from '@/components/svg/chevron';
import { useRouters } from '@/hooks/useRouters';
import { useChainSelectors } from '@/hooks/useChainSelectors';

export const Fees = ({
  sourceChain,
  destinationChain,
  amount,
  tokenAddress,
  chainId,
}: {
  sourceChain: number;
  destinationChain: number;
  amount: string;
  tokenAddress: Address;
  chainId?: number;
}) => {
  const {
    feeTokenSymbol,
    setFeeTokenSymbol,
    feeTokenAddress,
    setFeeAmount,
    feeTokenBalance,
  } = useAppContext();

  const publicClient = usePublicClient();
  const { address } = useAccount();

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: IERC20ABI,
    functionName: 'decimals',
  });

  const { getRouterAddress } = useRouters();
  const { getChainSelector } = useChainSelectors();

  const routerAddress = getRouterAddress(sourceChain);
  const destinationChainSelector = getChainSelector(destinationChain);

  const { isPending, data: fee } = useQuery({
    queryKey: [
      'fee',
      sourceChain,
      destinationChain,
      tokenAddress,
      amount,
      address,
      chainId,
      decimals,
      feeTokenAddress,
    ],
    queryFn: () =>
      ccipClient.getFee({
        client: publicClient!,
        routerAddress,
        destinationChainSelector,
        destinationAccount: address!,
        amount: parseUnits(amount, decimals as number),
        tokenAddress,
        feeTokenAddress,
      }),
    enabled: !!publicClient && !!address,
  });

  useEffect(() => {
    if (fee) {
      setFeeAmount(fee as bigint);
    }
  }, [fee, setFeeAmount]);

  if (sourceChain !== chainId) {
    return null;
  }

  if (isPending) {
    return (
      <div className="text-sm leading-4 space-y-4 mb-6 animate-pulse">
        <div className="flex">
          <div className="text-ccip-muted flex items-center space-x-2">
            <p>Fees + Destination gas</p>
            <InfoTooltip />
          </div>
        </div>
      </div>
    );
  }

  if (fee) {
    return (
      <>
        <div className="text-sm leading-4 space-y-4 mb-6">
          <div className="flex justify-between">
            <div className="text-ccip-muted flex items-center space-x-2">
              <p>Fees + Destination gas</p>
              <InfoTooltip />
              <Button
                variant="secondary"
                size="sm"
                className="px-2 py-[2px] leading-4 space-x-1 font-normal"
                onClick={setFeeTokenSymbol}
              >
                <span>{feeTokenSymbol}</span>
                <ChevronSVG />
              </Button>
            </div>
            <div className="text-ccip-text">
              {formatEther(fee as bigint).substring(0, 9)}
            </div>
          </div>
        </div>
        {feeTokenBalance && feeTokenBalance < (fee as bigint) ? (
          <Error message="Fees exceed wallet balance" />
        ) : null}
      </>
    );
  }

  return null;
};

const InfoTooltip = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <InfoSVG />
      </TooltipTrigger>
      <TooltipContent className="w-[280px] bg-ccip-primary text-ccip-background border-none flex items-center space-x-4">
        <InfoTooltipSVG className="shrink-0" />
        <div>
          <p>
            Fees cover the gas costs of completing transactions on the
            destination chain and the fees paid to CCIP service providers. Learn
            more at
          </p>
          <a
            href="https://docs.chain.link/ccip/billing"
            target="_blank"
            className={cn(buttonVariants({ variant: 'link' }), 'h-auto p-0')}
          >
            docs.chain.link/ccip/billing
          </a>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
