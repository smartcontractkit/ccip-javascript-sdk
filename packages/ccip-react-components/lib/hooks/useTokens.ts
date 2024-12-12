import { useAppContext } from '@/hooks/useAppContext';
import { Token } from '@/types';
import { useMemo } from 'react';

export const useTokens = () => {
  const { config, tokensList } = useAppContext();
  
  const tokenBySymbol = useMemo(
    () =>
      tokensList.reduce((acc, token) => {
        acc[token.symbol] = token;
        return acc;
      }, {} as { [symbol: string]: Token }),
    [tokensList]
  );

  const preselectedToken = useMemo(
    () =>
      config?.token
        ? tokensList.some(({ symbol }) => symbol === config.token)
          ? config.token
          : undefined
        : undefined,
    [config?.token, tokensList]
  );

  return { tokensList, tokenBySymbol, preselectedToken };
};
