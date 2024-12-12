import { Token } from '@chainlink/ccip-react-components';
import {
  arbitrumSepolia,
  avalancheFuji,
  baseSepolia,
  bscTestnet,
  optimismSepolia,
  polygonAmoy,
  sepolia,
} from 'viem/chains';

export const tokensList: Token[] = [
  {
    symbol: 'CCIP-BnM',
    address: { 
        [arbitrumSepolia.id]:'0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D',
        [avalancheFuji.id]: '0xD21341536c5cF5EB1bcb58f6723cE26e8D8E90e4',
        [baseSepolia.id]: '0x88A2d74F47a237a62e7A51cdDa67270CE381555e',
        [bscTestnet.id]: '0xbFA2ACd33ED6EEc0ed3Cc06bF1ac38d22b36B9e9',
        [optimismSepolia.id]: '0x8aF4204e30565DF93352fE8E1De78925F6664dA7',
        [polygonAmoy.id]: '0xcab0EF91Bee323d1A617c0a027eE753aFd6997E4',
        [sepolia.id]: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05'
    },
    logoURL:
      'https://smartcontract.imgix.net/tokens/ccip-bnm.webp?auto=compress%2Cformat',
    tags: ['chainlink', 'default']
  },
  {
    symbol: 'CCIP-LnM',
    address: {
      [arbitrumSepolia.id]:'0x139E99f0ab4084E14e6bb7DacA289a91a2d92927',
      [avalancheFuji.id]: '0x70F5c5C40b873EA597776DA2C21929A8282A3b35',
      [baseSepolia.id]: '0xA98FA8A008371b9408195e52734b1768c0d1Cb5c',
      [bscTestnet.id]: '0x79a4Fc27f69323660f5Bfc12dEe21c3cC14f5901',
      [optimismSepolia.id]: '0x044a6B4b561af69D2319A2f4be5Ec327a6975D0a',
      [polygonAmoy.id]: '0x3d357fb52253e86c8Ee0f80F5FfE438fD9503FF2',
      [sepolia.id]: '0x466D489b6d36E7E3b824ef491C225F5830E81cC1'
    },
    logoURL:
    'https://smartcontract.imgix.net/tokens/ccip-lnm.webp?auto=compress%2Cformat',
    tags: ['chainlink', 'default']
  },
  {
    symbol: 'GHO',
    address: {
      [arbitrumSepolia.id]: '0xb13Cfa6f8B2Eed2C37fB00fF0c1A59807C585810',
      [avalancheFuji.id]: '0x9c04928Cc678776eC1C1C0E46ecC03a5F47A7723',
      [baseSepolia.id]: '0x7CFa3f3d1cded0Da930881c609D4Dbf0012c14Bb',
      [bscTestnet.id]: undefined,
      [optimismSepolia.id]: undefined,
      [polygonAmoy.id]: undefined,
      [sepolia.id]: '0xc4bF5CbDaBE595361438F8c6a187bDc330539c60'
    },
    logoURL:
      'https://smartcontract.imgix.net/tokens/gho.webp?auto=compress%2Cformat',
    tags: ['stablecoin', 'default']
  },
  {
    symbol: 'USDC',
    address: {
      [arbitrumSepolia.id]: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
      [avalancheFuji.id]: '0x5425890298aed601595a70AB815c96711a31Bc65',
      [baseSepolia.id]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      [bscTestnet.id]: undefined,
      [optimismSepolia.id]: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
      [polygonAmoy.id]: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
      [sepolia.id]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
    },
    logoURL:
      'https://smartcontract.imgix.net/tokens/usdc.webp?auto=compress%2Cformat',
    tags: ['stablecoin', 'default']
  }
];
