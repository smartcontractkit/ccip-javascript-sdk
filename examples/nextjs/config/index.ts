import { Config } from '@chainlink/ccip-react-components';

/** Uncomment any of the properties to see it's effect. Refer to the documentation for more information */
export const config: Config = {
  // variant: 'drawer',
  // fromChain: avalancheFuji.id,
  // toChain: sepolia.id,
  token: 'CCIP-BnM',
  // chains: {
  //   deny: [arbitrumSepolia.id],
  //   from: {
  //     deny: [sepolia.id],
  //   },
  //   to: { deny: [bscTestnet.id] },
  // },
  theme: {
    palette: {
      // background: '#ffaaaa',
      // border: '#ff00ee',
      // text: '#00ffc3fd',
      // muted: '#004cfffc',
      // input: '#ddff00',
      // popover: '#97a82b',
      // selected: '#aa2492',
    },
    shape: { radius: 4 },
  },
  showFaucet: true,
};
