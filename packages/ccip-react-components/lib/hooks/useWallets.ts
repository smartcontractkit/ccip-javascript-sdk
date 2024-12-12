import { useAppContext } from '@/hooks/useAppContext';

export const useWallets = () => {
  const { config } = useAppContext();
  const walletConfig = config?.walletConfig;
  return { walletConfig };
};
