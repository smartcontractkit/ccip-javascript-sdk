import { useAppContext } from '@/hooks/useAppContext';

export const useChainSelectors = () => {
  const { chainSelectors } = useAppContext();

  const getChainSelector = (chainId: number) => {
    const chainSelector = chainSelectors[chainId];
    if (!chainSelector) {
      throw new Error(`Chain selector not found for chainId: ${chainId}`);
    }
    return chainSelector;
  };

  return { chainSelectors, getChainSelector };
};
