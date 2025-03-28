import { DEFAULT_CONFIG } from '@/utils/config';
import { AddressMap, WidgetConfig, ConfigProps, Token } from '@/types';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Address } from 'viem';
import { Chain } from 'wagmi/chains';
import { useAccount, useBalance } from 'wagmi';
import { sepolia, avalancheFuji, arbitrumSepolia, polygonAmoy, bscTestnet } from 'viem/chains';
import { testTokenList } from '@/tests/setup';

export const Context = createContext<{
  config?: WidgetConfig;
  tokensList: Token[];
  chains: Chain[];
  chainsInfo: { [chainId: number]: { logoURL?: string; name: string } };
  linkContracts: AddressMap;
  routerAddresses: AddressMap;
  chainSelectors: {
    [chainId: number]: string | undefined;
  };
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
  chains: [sepolia, avalancheFuji, arbitrumSepolia, bscTestnet, polygonAmoy],
  chainsInfo: {
    [sepolia.id]: { logoURL: 'https://example.com/sepolia.png', name: 'Sepolia' },
    [avalancheFuji.id]: { logoURL: 'https://example.com/avalanche-fuji.png', name: 'Avalanche Fuji' },
    [arbitrumSepolia.id]: { logoURL: 'https://example.com/arbitrum-sepolia.png', name: 'Arbitrum Sepolia' },
    [polygonAmoy.id]: { logoURL: 'https://example.com/polygon-amoy.png', name: 'Polygon Amoy' },
    [bscTestnet.id]: { logoURL: 'https://example.com/bsc-testnet.png', name: 'BSC Testnet' },
  },
  tokensList: testTokenList,
  linkContracts: {
    [sepolia.id]: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
    [avalancheFuji.id]: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
    [arbitrumSepolia.id]: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
    [polygonAmoy.id]: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
    [bscTestnet.id]: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
  },
  routerAddresses: {
    [sepolia.id]: '0x1234567890abcdef1234567890abcdef12345678',
    [avalancheFuji.id]: '0xabcdef1234567890abcdef1234567890abcdef12',
    [arbitrumSepolia.id]: '0x1234567890abcdef1234567890abcdef12345678',
    [polygonAmoy.id]: '0x1234567890abcdef1234567890abcdef12345678',
    [bscTestnet.id]: '0x1234567890abcdef1234567890abcdef12345678',
  },
  chainSelectors: {
    [sepolia.id]: '16015286601757825753',
    [avalancheFuji.id]: '14767482510784806043',
    [arbitrumSepolia.id]: '16015286601757825753',
    [polygonAmoy.id]: '16015286601757825753',
    [bscTestnet.id]: '16015286601757825753',
  },
  setTransferHash: () => null,
  setMessageId: () => null,
  setSourceChainId: () => null,
  setDestinationChainId: () => null,
  setFeeTokenSymbol: () => null,
  setFeeAmount: () => null,
  setIsConnectOpen: () => null,
  feeTokenBalance: 0n,
});

export const ContextProvider = ({
  config: configProp,
  networkConfig,
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
      ...configProp,
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
      showFaucet: configProp?.showFaucet,
    }),
    [configProp]
  );

  const {
    linkContracts,
    routerAddresses,
    chainSelectors,
    chains: chainsProp,
    tokensList,
  } = networkConfig;

  const chains = useMemo(
    () => chainsProp.map(({ chain }) => chain),
    [chainsProp]
  );

  const chainsInfo = useMemo(
    () =>
      chainsProp.reduce(
        (a, v) => ({
          ...a,
          [v.chain.id]: { logoURL: v.logoURL, name: v.chain.name },
        }),
        {}
      ),
    [chainsProp]
  );

  const { chain: currentChain, chainId, address } = useAccount();

  const { data: feeTokenBalanceResult } = useBalance({
    address,
    token: feeTokenAddress,
  });

  useEffect(() => {
    if (currentChain?.nativeCurrency.symbol) {
      setFeeTokenSymbol(currentChain?.nativeCurrency.symbol);
    }
  }, [currentChain?.nativeCurrency.symbol]);

  useEffect(() => {
    if (chainId) {
      feeTokenSymbol === 'LINK'
        ? setFeeTokenAddress(linkContracts[chainId])
        : setFeeTokenAddress(undefined);
    }
  }, [chainId, feeTokenSymbol, linkContracts]);

  useEffect(() => {
    if (feeTokenBalanceResult?.value) {
      setFeeTokenBalance(feeTokenBalanceResult?.value);
    }
  }, [feeTokenBalanceResult?.value]);

  const setFeeTokenHandler = useCallback(() => {
    if (currentChain?.nativeCurrency.symbol) {
      feeTokenSymbol === currentChain?.nativeCurrency.symbol
        ? setFeeTokenSymbol('LINK')
        : setFeeTokenSymbol(currentChain?.nativeCurrency.symbol);
    }
  }, [feeTokenSymbol, currentChain?.nativeCurrency.symbol]);

  return (
    <Context.Provider
      value={{
        config,
        chains,
        chainsInfo,
        tokensList,
        linkContracts,
        routerAddresses,
        chainSelectors,
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
