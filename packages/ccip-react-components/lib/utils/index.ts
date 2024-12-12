import { AllowDeny, Token } from '@/types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CHAIN_SELECTORS, ROUTER_ADDRESSES } from './config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isItemAllowed = <T>(itemId: T, items?: AllowDeny<T>) => {
  if (items?.allow?.length) {
    return items.allow.includes(itemId);
  }
  return !items?.deny?.includes(itemId);
};

export const getRouterAddress = (chainId: number) => {
  const routerAddress = ROUTER_ADDRESSES[chainId];
  if (!routerAddress) {
    throw new Error(`Router address not found for chainId: ${chainId}`);
  }
  return routerAddress;
};

export const getChainSelector = (chainId: number) => {
  const chainSelector = CHAIN_SELECTORS[chainId];
  if (!chainSelector) {
    throw new Error(`Chain selector not found for chainId: ${chainId}`);
  }
  return chainSelector;
};

export const isTokenOnChain = ({
  tokensList,
  symbol,
  chainId,
}: {
  tokensList: Token[];
  symbol: string;
  chainId: number;
}) =>
  tokensList.some((token) => token.symbol === symbol && token.address[chainId]);

export const getTokenAddress = ({
  tokensList,
  chainId,
  symbol,
}: {
  tokensList: Token[];
  symbol: string;
  chainId: string;
}) =>
  tokensList.find(
    (token) =>
      token.symbol === symbol && `${token.address[Number(chainId)]}` === chainId
  )?.address;
