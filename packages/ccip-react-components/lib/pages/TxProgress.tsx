'use client';

import { useQuery } from '@tanstack/react-query';
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { TransferStatus } from '@chainlink/ccip-js';
import { ccipClient } from '@/utils/ccip-client';
import { cn } from '@/utils';
import { useAppContext } from '@/hooks/useAppContext';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';
import { useRouters } from '@/hooks/useRouters';
import { useChainSelectors } from '@/hooks/useChainSelectors';

const STATUS_POLL_INTERVAL = 10000; // 10 seconds

export const TxProgress = () => {
  const {
    messageId,
    transferHash,
    sourceChainId,
    destinationChainId,
    setMessageId,
    setTransferHash,
    setSourceChainId,
    setDestinationChainId,
  } = useAppContext();

  const destinationChainPublicClient = usePublicClient({
    chainId: destinationChainId,
  });
  const { address } = useAccount();

  const { isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: transferHash,
  });

  const { getRouterAddress } = useRouters();
  const { getChainSelector } = useChainSelectors();

  const { data: transferStatus } = useQuery({
    queryKey: ['transferStatus', messageId, destinationChainId, sourceChainId],
    queryFn: () =>
      ccipClient.getTransferStatus({
        client: destinationChainPublicClient!,
        messageId: messageId!,
        destinationRouterAddress: getRouterAddress(destinationChainId!),
        sourceChainSelector: getChainSelector(sourceChainId!),
      }),
    enabled:
      !!messageId &&
      !!destinationChainPublicClient &&
      !!sourceChainId &&
      !!address,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: (query) =>
      query.state.data === TransferStatus.Success
        ? false
        : STATUS_POLL_INTERVAL,
  });
  const isTransferCompleted = transferStatus === TransferStatus.Success;

  return (
    <CardContent className="flex flex-col space-y-6 mt-2">
      <h4 className="text-xl leading-[24px] font-semibold text-ccip-primary">
        Transfer status
      </h4>
      <div className="flex flex-col space-y-8">
        <div className="flex items-center space-x-4 relative after:h-6 after:border-l-2 after:border-l-ccip-text after:absolute after:top-[28px] after:left-[11px]">
          {isTxSuccess ? (
            <>
              <div className="w-3 h-3 m-[6px] rounded-full bg-[#14CC6C]" />
              <p>Transaction confirmed</p>
            </>
          ) : (
            <>
              <div className="w-3 h-3 m-[6px] rounded-full font-bold animate-pulse bg-[#0043C3]" />
              <p>Confirming transaction</p>
              <Badge>In progress...</Badge>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4 relative after:h-6 after:border-l-2 after:border-l-ccip-text after:absolute after:top-[28px] after:left-[11px]">
          {isTransferCompleted ? (
            <>
              <div className="w-3 h-3 m-[6px] rounded-full bg-[#14CC6C]" />
              <p>Ethereum finality reached</p>
            </>
          ) : isTxSuccess ? (
            <>
              <div className="w-3 h-3 m-[6px] rounded-full font-bold animate-pulse bg-[#0043C3]" />
              <p>Waiting for finality</p>
              <Badge>In progress...</Badge>
            </>
          ) : (
            <>
              <div className="w-3 h-3 m-[6px] rounded-full bg-ccip-border" />
              <p className="text-ccip-muted">Waiting for finality</p>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4 relative after:h-6 after:border-l-2 after:border-l-ccip-text after:absolute after:top-[28px] after:left-[11px]">
          {isTransferCompleted ? (
            <>
              <div className="w-3 h-3 m-[6px] rounded-full bg-[#14CC6C]" />
              <p>Published CCIP commitment</p>
            </>
          ) : (
            <>
              <div className="w-3 h-3 m-[6px] rounded-full bg-ccip-border" />
              <p className="text-ccip-muted">Publishing CCIP commitment</p>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {isTransferCompleted ? (
            <>
              <div className="w-3 h-3 m-[6px] rounded-full bg-[#14CC6C]" />
              <p>Transfer complete</p>
            </>
          ) : (
            <>
              <div className="w-3 h-3 m-[6px] rounded-full bg-ccip-border" />
              <p className="text-ccip-muted">Completing transfer</p>
            </>
          )}
        </div>
      </div>
      <h4 className="text-xl leading-[24px] font-semibold text-ccip-primary">
        Summary
      </h4>
      {isTxSuccess ? (
        <div className="flex flex-col space-y-2">
          <a
            className={cn(
              buttonVariants({ variant: 'default' }),
              'w-full text-xl leading-6 h-[52px]'
            )}
            href={`https://ccip.chain.link/msg/${messageId}`}
            target="_blank"
          >
            View transaction
          </a>
          <Button
            className="w-full text-xl leading-6 h-[52px]"
            variant="outline"
            onClick={() => {
              setMessageId(undefined);
              setTransferHash(undefined);
              setSourceChainId(undefined);
              setDestinationChainId(undefined);
            }}
          >
            Start a new transfer
          </Button>
        </div>
      ) : null}
    </CardContent>
  );
};
