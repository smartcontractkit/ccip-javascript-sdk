import { Address, parseUnits } from 'viem';
import { useQuery } from '@tanstack/react-query';
import { IERC20ABI } from '@chainlink/ccip-js';
import { ccipClient } from '@/utils/ccip-client';
import { useAccount, useBalance, usePublicClient, useReadContract } from 'wagmi';
import { useAppContext } from '@/hooks/useAppContext';
import { Error } from '@/components/Error';
import { useRouters } from '@/hooks/useRouters';
import { useChainSelectors } from '@/hooks/useChainSelectors';

export const RateLimit = ({
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
  const { feeTokenAddress } = useAppContext();
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const { data: balance, isLoading: balanceIsLoading } = useBalance({
    address,
    token: tokenAddress,
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: IERC20ABI,
    functionName: 'decimals',
  });

  const { getRouterAddress } = useRouters();
  const { getChainSelector } = useChainSelectors();

  const routerAddress = getRouterAddress(sourceChain);
  const destinationChainSelector = getChainSelector(destinationChain);

  const { data: limits } = useQuery({
    queryKey: [
      'limits',
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
      ccipClient.getTokenRateLimitByLane({
        client: publicClient!,
        routerAddress,
        destinationChainSelector,
        supportedTokenAddress: tokenAddress,
      }),
    enabled: !!publicClient,
  });

  if (limits && !balanceIsLoading && balance && balance?.value >= parseUnits(amount, balance.decimals)) {
    if (parseUnits(amount, decimals as number) > limits.capacity) {
      return <Error message='Amount exceeds capacity per transaction.' />;
    }

    if (parseUnits(amount, decimals as number) > limits.tokens) {
      return (
        <Error
          message={`Not enough tokens in the pool. It will refill in ${
            (parseUnits(amount, decimals as number) - limits.tokens) / limits.rate
          } seconds`}
        />
      );
    }
  }

  return null;
};
