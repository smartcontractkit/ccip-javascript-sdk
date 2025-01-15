import { useAppContext } from '@/hooks/useAppContext';
import { ccipClient } from '@/utils/ccip-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { IERC20ABI } from '@chainlink/ccip-js';
import { useEffect } from 'react';
import { Address, Chain, parseUnits, WalletClient } from 'viem';
import {
  useAccount,
  useBalance,
  useReadContract,
  useWaitForTransactionReceipt,
  useWalletClient,
  useWriteContract,
} from 'wagmi';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils';
import { Error } from '@/components/Error';
import { useRouters } from '@/hooks/useRouters';
import { useChainSelectors } from '@/hooks/useChainSelectors';

export function SendButton({
  sourceChain,
  destinationChain,
  destinationAccount,
  disabled,
  amount,
  tokenAddress,
}: {
  sourceChain: number;
  destinationChain: number;
  destinationAccount: Address;
  disabled?: boolean;
  amount: string;
  tokenAddress: Address;
}) {
  const {
    setMessageId,
    setTransferHash,
    setSourceChainId,
    setDestinationChainId,
    feeTokenSymbol,
    feeTokenAddress,
    feeAmount,
    feeTokenBalance,
  } = useAppContext();

  const { data: walletClient } = useWalletClient();
  const { address, chain } = useAccount();

  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: destinationAccount,
    token: tokenAddress,
  });

  const { getRouterAddress } = useRouters();
  const { getChainSelector } = useChainSelectors();

  const routerAddress = getRouterAddress(sourceChain);
  const destinationChainSelector = getChainSelector(destinationChain);

  const { data: tokenAllowance, refetch: refetchTokenAllowance } =
    useReadContract({
      abi: IERC20ABI,
      address: tokenAddress,
      functionName: 'allowance',
      args: [destinationAccount, routerAddress],
    });

  const { data: feeAllowance, refetch: refetchFeeAllowance } = useReadContract({
    abi: IERC20ABI,
    address: feeTokenAddress,
    functionName: 'allowance',
    args: [destinationAccount, routerAddress],
    query: { enabled: feeTokenSymbol === 'LINK' },
  });

  const { data: isTokenSupported, isPending: isTokenSupportedPending } =
    useQuery({
      queryKey: [
        'isTokenSupported',
        tokenAddress,
        sourceChain,
        destinationChain,
      ],
      queryFn: async () =>
        await ccipClient.isTokenSupported({
          client: walletClient!,
          routerAddress,
          tokenAddress,
          destinationChainSelector,
        }),
      enabled: !!walletClient,
    });

  const {
    mutate: approve,
    isPending: approveTokenIsPending,
    error: approveTokenError,
    isError: isApproveTokenError,
  } = useMutation({
    mutationFn: async (options: {
      client: WalletClient;
      chain: Chain;
      account: Address;
      routerAddress: Address;
      amount: bigint;
      tokenAddress: Address;
      waitForReceipt: boolean;
    }) => await ccipClient.approveRouter(options),
    onSuccess: () => refetchTokenAllowance(),
    onError: console.error,
  });

  const {
    mutate: transfer,
    isPending: transferIsPending,
    error: transferError,
    isError: isTransferError,
  } = useMutation({
    mutationFn: async (options: {
      client: WalletClient;
      chain: Chain;
      routerAddress: Address;
      destinationChainSelector: string;
      amount: bigint;
      destinationAccount: Address;
      tokenAddress: Address;
      feeTokenAddress?: Address;
    }) => await ccipClient.transferTokens(options),
    onSuccess: ({ messageId, txHash }) => {
      setMessageId(messageId);
      setTransferHash(txHash);
      setSourceChainId(sourceChain);
      setDestinationChainId(destinationChain);
    },
    onError: console.error,
  });

  const {
    writeContract: approveFee,
    isPending: approveFeeIsPending,
    data: approveFeeTxHash,
    isError: isApproveFeeError,
    error: approveFeeError,
  } = useWriteContract({ mutation: { onError: console.error } });
  const {
    isSuccess: waitForFeeAllowanceIsSuccess,
    isLoading: waitForFeeAllowanceIsLoading,
  } = useWaitForTransactionReceipt({
    hash: approveFeeTxHash,
    confirmations: 2,
    query: { enabled: !!approveFeeTxHash },
  });

  useEffect(() => {
    if (waitForFeeAllowanceIsSuccess) refetchFeeAllowance();
  }, [waitForFeeAllowanceIsSuccess, refetchFeeAllowance]);

  const insufficientBalance =
    balance && balance.value < parseUnits(amount, balance.decimals);
  const insufficientFeeBalance =
    feeAmount && feeTokenBalance && feeTokenBalance < feeAmount;
  const needsFeeApproval =
    feeTokenAddress && feeAmount && (feeAllowance as bigint) < feeAmount;
  const needsTokenApproval =
    balance &&
    amount &&
    parseUnits(amount, balance.decimals) >
      ((tokenAllowance as bigint) || BigInt(0));

  if (!isTokenSupportedPending && !isTokenSupported) {
    return <Error message="Token is not supported on destination chain" />;
  }

  if (insufficientBalance || insufficientFeeBalance) {
    return (
      <Button className="w-full text-xl leading-6 h-[52px]" disabled>
        Insufficient balance
      </Button>
    );
  }

  if (needsFeeApproval) {
    return (
      <>
        {isApproveFeeError && (
          <Error message={approveFeeError.message.split('.')[0]} />
        )}
        <Button
          className="w-full text-xl leading-6 h-[52px]"
          disabled={approveFeeIsPending || waitForFeeAllowanceIsLoading}
          onClick={() =>
            approveFee({
              abi: IERC20ABI,
              address: feeTokenAddress,
              functionName: 'approve',
              args: [routerAddress, feeAmount],
            })
          }
        >
          Approve LINK
        </Button>
      </>
    );
  }

  if (needsTokenApproval) {
    return (
      <>
        {isApproveTokenError && (
          <Error message={approveTokenError.message.split('.')[0]} />
        )}
        <Button
          className={cn(
            'w-full text-xl leading-6 h-[52px]',
            approveTokenIsPending && 'animate-pulse'
          )}
          disabled={
            approveTokenIsPending || !walletClient || !chain || !address
          }
          onClick={() =>
            walletClient &&
            chain &&
            address &&
            approve({
              client: walletClient,
              chain,
              account: address,
              routerAddress,
              amount: parseUnits(amount, balance.decimals),
              tokenAddress,
              waitForReceipt: true,
            })
          }
        >
          Approve
        </Button>
      </>
    );
  }

  return (
    <>
      {isTransferError && (
        <Error message={transferError.message.split('.')[0]} />
      )}
      <Button
        className="w-full text-xl leading-6 h-[52px]"
        disabled={
          disabled ||
          balanceLoading ||
          !amount ||
          !balance?.decimals ||
          parseUnits(amount, balance.decimals) <= BigInt(0) ||
          isTokenSupportedPending ||
          transferIsPending ||
          !walletClient ||
          !chain
        }
        onClick={() =>
          balance?.decimals &&
          walletClient &&
          chain &&
          transfer({
            client: walletClient,
            chain,
            routerAddress,
            destinationChainSelector,
            amount: parseUnits(amount, balance.decimals),
            tokenAddress,
            destinationAccount,
            feeTokenAddress,
          })
        }
      >
        Send
      </Button>
    </>
  );
}
