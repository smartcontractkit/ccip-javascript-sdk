import { DEFAULT_CONFIG, LINK_CONTRACTS } from '@/utils/config';
import { Config, ConfigProps, Token } from '@/types';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Address } from 'viem';
import { useAccount, useBalance } from 'wagmi';

export const Context = createContext<{
  config?: Config;
  tokensList: Token[];
  transferHash?: Address;
  messageId?: Address;
  sourceChainId?: number;
  destinationChainId?: number;
  feeTokenSymbol?: string;
  feeTokenAddress?: Address;
  feeAmount?: bigint;
  setTransferHash: (txHash: Address | undefined) => void;
  setMessageId: (message: Address | undefined) => void;
  setSourceChainId: (chainId: number | undefined) => void;
  setDestinationChainId: (chainId: number | undefined) => void;
  setFeeTokenSymbol: () => void;
  setFeeAmount: (f: bigint) => void;
  feeTokenBalance?: bigint;
  isConnectOpen?: boolean;
  setIsConnectOpen: (open: boolean) => void;
}>({
  tokensList: [],
  setTransferHash: () => null,
  setMessageId: () => null,
  setSourceChainId: () => null,
  setDestinationChainId: () => null,
  setFeeTokenSymbol: () => null,
  setFeeAmount: () => null,
  setIsConnectOpen: () => null,
});

export const ContextProvider = ({
  config: configProp,
  tokensList,
  children,
}: PropsWithChildren<ConfigProps>) => {
  const [transferHash, setTransferHash] = useState<Address | undefined>();
  const [messageId, setMessageId] = useState<Address | undefined>();
  const [sourceChainId, setSourceChainId] = useState<number>();
  const [destinationChainId, setDestinationChainId] = useState<number>();
  const [feeTokenSymbol, setFeeTokenSymbol] = useState<string>();
  const [feeTokenAddress, setFeeTokenAddress] = useState<Address>();
  const [feeAmount, setFeeAmount] = useState<bigint>();
  const [feeTokenBalance, setFeeTokenBalance] = useState<bigint>();
  const [isConnectOpen, setIsConnectOpen] = useState(false);

  const config = useMemo(
    () => ({
      theme: {
        palette: {
          ...DEFAULT_CONFIG.theme?.palette,
          ...configProp?.theme?.palette,
        },
        shape: { ...DEFAULT_CONFIG.theme?.shape, ...configProp?.theme?.shape },
      },
      fromChain: configProp?.fromChain,
      toChain: configProp?.toChain,
      token: configProp?.token,
      chains: configProp?.chains,
      variant: configProp?.variant,
      walletConfig: configProp?.walletConfig,
    }),
    [configProp]
  );

  const { chain, chainId, address } = useAccount();
  const { data: feeTokenBalanceResult } = useBalance({
    address,
    token: feeTokenAddress,
  });

  useEffect(() => {
    if (chain?.nativeCurrency.symbol) {
      setFeeTokenSymbol(chain?.nativeCurrency.symbol);
    }
  }, [chain?.nativeCurrency.symbol]);

  useEffect(() => {
    if (chainId) {
      feeTokenSymbol === 'LINK'
        ? setFeeTokenAddress(LINK_CONTRACTS[chainId])
        : setFeeTokenAddress(undefined);
    }
  }, [chainId, feeTokenSymbol]);

  useEffect(() => {
    if (feeTokenBalanceResult?.value) {
      setFeeTokenBalance(feeTokenBalanceResult?.value);
    }
  }, [feeTokenBalanceResult?.value]);

  const setFeeTokenHandler = useCallback(() => {
    if (chain?.nativeCurrency.symbol) {
      feeTokenSymbol === chain?.nativeCurrency.symbol
        ? setFeeTokenSymbol('LINK')
        : setFeeTokenSymbol(chain?.nativeCurrency.symbol);
    }
  }, [feeTokenSymbol, chain?.nativeCurrency.symbol]);

  return (
    <Context.Provider
      value={{
        config,
        tokensList,
        transferHash,
        setTransferHash: (tx: Address | undefined) => setTransferHash(tx),
        messageId,
        setMessageId: (msg: Address | undefined) => setMessageId(msg),
        sourceChainId,
        setSourceChainId: (chainId: number | undefined) =>
          setSourceChainId(chainId),
        destinationChainId,
        setDestinationChainId: (chainId: number | undefined) =>
          setDestinationChainId(chainId),
        feeTokenSymbol: feeTokenSymbol,
        setFeeTokenSymbol: setFeeTokenHandler,
        feeTokenAddress,
        feeAmount: feeAmount,
        setFeeAmount: (f: bigint | undefined) => setFeeAmount(f),
        feeTokenBalance,
        isConnectOpen,
        setIsConnectOpen: (o: boolean) => setIsConnectOpen(o),
      }}
    >
      {children}
    </Context.Provider>
  );
};
