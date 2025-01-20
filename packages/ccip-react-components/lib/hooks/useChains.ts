import { useAppContext } from '@/hooks/useAppContext';
import { isItemAllowed } from '@/utils';
import { useMemo } from 'react';

export const useChains = () => {
  const { config, chains, chainsInfo } = useAppContext();
  const filteredChains = useMemo(
    () => chains.filter((chain) => isItemAllowed(chain.id, config?.chains)),
    [chains, config?.chains]
  );

  const fromChains = useMemo(
    () =>
      filteredChains.filter((chain) =>
        isItemAllowed(chain.id, config?.chains?.from)
      ),
    [config?.chains?.from, filteredChains]
  );

  const toChains = useMemo(
    () =>
      filteredChains.filter((chain) =>
        isItemAllowed(chain.id, config?.chains?.to)
      ),
    [config?.chains?.to, filteredChains]
  );

  const fromNetworks = useMemo(
    () =>
      fromChains.map((chain) => ({
        chainId: `${chain.id}`,
        label: chain.name,
        logo: chainsInfo[chain.id]?.logoURL,
      })),
    [chainsInfo, fromChains]
  );

  const toNetworks = useMemo(
    () =>
      toChains.map((chain) => ({
        chainId: `${chain.id}`,
        label: chain.name,
        logo: chainsInfo[chain.id]?.logoURL,
      })),
    [chainsInfo, toChains]
  );

  const fromChain = useMemo(
    () =>
      config?.fromChain
        ? fromChains.map(({ id }) => id).includes(config.fromChain)
          ? `${config.fromChain}`
          : undefined
        : undefined,
    [config?.fromChain, fromChains]
  );

  const toChain = useMemo(
    () =>
      config?.toChain
        ? toChains.map(({ id }) => id).includes(config.toChain)
          ? `${config.toChain}`
          : undefined
        : undefined,
    [config?.toChain, toChains]
  );

  return {
    filteredChains,
    fromChains,
    toChains,
    fromNetworks,
    toNetworks,
    fromChain,
    toChain,
    chainsInfo,
  };
};
