import { NETWORK_INFO } from '@/components/Logos';
import { useAppContext } from '@/hooks/useAppContext';
import { chains } from '@/utils/config';
import { isItemAllowed } from '@/utils';
import { useMemo } from 'react';

export const useChains = () => {
  const { config } = useAppContext();
  const filteredChains = useMemo(
    () => chains.filter((chain) => isItemAllowed(chain.id, config?.chains)),
    [config?.chains]
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
        logo: NETWORK_INFO[chain.id]?.logo,
      })),
    [fromChains]
  );

  const toNetworks = useMemo(
    () =>
      toChains.map((chain) => ({
        chainId: `${chain.id}`,
        label: chain.name,
        logo: NETWORK_INFO[chain.id]?.logo,
      })),
    [toChains]
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
  };
};
