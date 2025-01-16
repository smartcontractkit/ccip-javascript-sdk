import { useAppContext } from '@/hooks/useAppContext';

export const useRouters = () => {
  const { routerAddresses } = useAppContext();

  const getRouterAddress = (chainId: number) => {
    const routerAddress = routerAddresses[chainId];
    if (!routerAddress) {
      throw new Error(`Router address not found for chainId: ${chainId}`);
    }
    return routerAddress;
  };

  return { routerAddresses, getRouterAddress };
};
