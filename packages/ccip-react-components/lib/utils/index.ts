import { AllowDeny, Token } from '@/types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isItemAllowed = <T>(itemId: T, items?: AllowDeny<T>) => {
  if (items?.allow?.length) {
    return items.allow.includes(itemId);
  }
  return !items?.deny?.includes(itemId);
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
