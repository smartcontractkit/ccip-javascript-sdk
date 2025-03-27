import { Chain } from 'viem';

// ClientConfig type
/**
 * @param {Chain[]} chains - An array of chains supported by the client.
 * @param {any} transport - The transport layer for the client.
 * @returns {ClientConfig} A configuration object for the client.
 */

export type ClientConfig = {
    chains: Chain[];
    transport: any;
  };