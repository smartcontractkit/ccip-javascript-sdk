# CCIP-REACT-COMPONENTS

The CCIP-REACT-COMPONENTS package is a set of prebuilt ready-to-use UI components built on top of [CCIP-JS](../ccip-js/README.md). Using both packages, you can add a fully featured CCIP bridge to your app that can be styled to match your app design.

## Table of contents

- [CCIP-REACT-COMPONENTS](#ccip-react-components)
   - [Table of contents](#table-of-contents)
   - [Installation](#installation)
   - [Quick start](#quick-start)
   - [Tokens](#tokens)
   - [Config](#config)
      - [Chains](#chains)
         - [Preselected chains](#preselected-chains)
         - [Preselect token](#preselect-token)

      - [Wallets](#wallets)
      - [Theme](#theme)
      - [Variants](#variants)
         - [Drawer](#drawer)

   - [Contributing](#contributing)
   - [License](#license)

## Installation

Install `@chainlink/ccip-react-components`:

Using NPM:

```sh
npm install @chainlink/ccip-react-components
```

Using Yarn:

```sh
yarn add @chainlink/ccip-react-components
```

Using PNPM:

```sh
pnpm add @chainlink/ccip-react-components
```

## Quick start

```tsx
import 'ccip-react-components/dist/style.css';
import { CCIPWidget, Config, Token } from 'ccip-react-components';
import { sepolia, optimismSepolia } from 'viem/chains';

const tokensList: Token[] = [
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
    logoURL: 'https://smartcontract.imgix.net/tokens/ccip-bnm.webp?auto=compress%2Cformat',
    tags: ['chainlink', 'default']
  },
  {
    symbol: 'CCIP-LnM',
    address: {
      [optimismSepolia.id]: '0x044a6B4b561af69D2319A2f4be5Ec327a6975D0a',
      [sepolia.id]: '0x466D489b6d36E7E3b824ef491C225F5830E81cC1'
    },
    logoURL: 'https://smartcontract.imgix.net/tokens/ccip-lnm.webp?auto=compress%2Cformat',
    tags: ['chainlink', 'default']
  }
];

const config: Config = {
    theme: {
        pallette: {
            background: '#FFFFFF',
            border: '#B3B7C0',
            text: '#000000',
        }
        shape: {
            radius: 6
        },
    }
};

<CCIPWidget config={config} tokensList={tokensList} />;
```

## Tokens

You should provide a list of tokens that your app will support transferring. For a list of all currently supported tokens, refer to the [CCIP Supported Networks](https://docs.chain.link/ccip/supported-networks) page. Learn [how to get CCIP Test Tokens](https://docs.chain.link/ccip/test-tokens#mint-tokens-in-a-block-explorer).

```tsx 
import { CCIPWidget, Token } from 'ccip-react-components';
import { sepolia, optimismSepolia } from 'viem/chains';

const tokensList: Token[] = [
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
    logoURL: 'https://smartcontract.imgix.net/tokens/ccip-bnm.webp?auto=compress%2Cformat',
    tags: ['chainlink', 'default']
  },
  {
    symbol: 'CCIP-LnM',
    address: {
      [optimismSepolia.id]: '0x044a6B4b561af69D2319A2f4be5Ec327a6975D0a',
      [sepolia.id]: '0x466D489b6d36E7E3b824ef491C225F5830E81cC1',
    },
    logoURL: 'https://smartcontract.imgix.net/tokens/ccip-lnm.webp?auto=compress%2Cformat',
    tags: ['chainlink', 'default']
  },
];

<CCIPWidget tokensList={tokensList} />
```

`tokensList` accepts an array of `Token` objects

```ts
export declare type TokenMap = {
  [chainId: number]: Address | undefined;
}

export declare type Token = {
  /** The token's symbol that will be shown in the UI  */
  symbol: string;
  /** The token's address, represented as a mapping by chainId */
  address: TokenMap;
  /** URL of the token's logo that will be shown in the UI */
  logoURL: string;
  /** A list of meta information tags for organizing and sorting (optional) */
  tags?: string[];
};

type TokenMap = {
  [chainId: number]: Address | undefined;
};
```

## Config

All `Config` properties are optional.

```tsx
import { CCIPWidget, Config } from 'ccip-react-components';

const config: Config = {
    ...
};

<CCIPWidget config={config} />;
```

### Chains

`allow` and `deny` configuration options are provided to control which chains can be used.

```typescript
import { mainnet, avalanche } from 'viem/chains';
import { Config } from 'ccip-react-components';
const config: Config = {
  // Only Ethereum and Avalanche will be available
  chains: { allow: [mainnet.id, avalanche.id] },
};
```

```typescript
import { mainnet, avalanche } from 'viem/chains';
import { Config } from 'ccip-react-components';
const config: Config = {
  // All chains except Ethereum and Avalanche will be available
  chains: { deny: [mainnet.id, avalanche.id] },
};
```

You can also specify source chains (chains from which transfers can be sent) and destination chains (chains from which transfers can be received).

```typescript
import { mainnet, avalanche } from 'viem/chains';
import { Config } from 'ccip-react-components';
const config: Config = {
  // Transfers can be sent only from Ethereum and Avalanche
  chains: { from: { allow: [mainnet.id, avalanche.id] } },
};
```

```typescript
import { mainnet, avalanche } from 'viem/chains';
import { Config } from 'ccip-react-components';
const config: Config = {
  // Transfers can be sent from all chains except Ethereum and Avalanche
  chains: { from: { deny: [mainnet.id, avalanche.id] } },
};
```

```typescript
import { mainnet, avalanche } from 'viem/chains';
import { Config } from 'ccip-react-components';
const config: Config = {
  // Transfers can be received only to Ethereum and Avalanche
  chains: { to: { allow: [mainnet.id, avalanche.id] } },
};
```

```typescript
import { mainnet, avalanche } from 'viem/chains';
import { Config } from 'ccip-react-components';
const config: Config = {
  // Transfers can be received on all chains except Ethereum and Avalanche
  chains: { to: { deny: [mainnet.id, avalanche.id] } },
};
```

#### Preselected chains

You can configure default chains: as soon as the component loads, the chains will display as preselected.

Preselect a chain to send a transfer from:

```typescript
import { mainnet } from 'viem/chains';
import { Config } from 'ccip-react-components';
const config: Config = { fromChain: mainnet.id };
```

Preselect a chain to receive a transfer:

```typescript
import { mainnet } from 'viem/chains';
import { Config } from 'ccip-react-components';
const config: Config = { toChain: mainnet.id };
```

#### Preselect Token

You can also specify a default token to display as preselected:

```typescript
import { Config } from 'ccip-react-components';
const config: Config = { token: 'USDC' };
```

### Wallets

If needed, you can pass additional wallet configurations:

```typescript
import { Config } from 'ccip-react-components';
const config: Config = { walletConfig: {
  /** Configure the connection options for Injected Connectors
   * More info: https://wagmi.sh/react/api/connectors/injected
   */ 
  injected?: InjectedParameters;
  /** Configure the connection options for MetaMask
   * More info: https://wagmi.sh/react/api/connectors/metaMask
   */
  metamask?: MetaMaskParameters;
  /** Configure the connection options for Wallet Connect
   * NOTE: A valid projectId should be provided in order to use Wallet Connect!
   * More info: https://wagmi.sh/react/api/connectors/walletConnect
   */
  walletConnect?: WalletConnectParameters;
  /** Configure the connection options for Coinbase Wallet
   * More info: https://wagmi.sh/react/api/connectors/coinbaseWallet
   */
  coinbaseWallet?: CoinbaseWalletParameters;
} };
```

### Theme

You can customize the component's theme to be in line with your app design.

```typescript
import { Config } from 'ccip-react-components';
const config: Config = { theme:
    {
    /** Define the app colors in HEX format */
    palette?: {
      /** Titles color and primary button background, default #000000 */
      primary?: string;
      /** Background color, default '#FFFFFF' */
      background?: string;
      /** Border color, default '#B3B7C0' */
      border?: string;
      /** Text color, default '#000000' */
      text?: string;
      /** Secondary text, inactive and placeholders color, default '#6D7480' */
      muted?: string;
      /** Input fields background color, default '#FFFFFF' */
      input?: string;
      /** Popovers, dropdowns and select fields background color, default '#F5F7FA' */
      popover?: string;
      /** Selected field from a dropdown background color, default '#D7DBE0' */
      selected?: string;
      /** Warning text color, default '#F7B955' */
      warning?: string;
      /** Warning text background color, default '#FFF5E0' */
      warningBackground?: string;
    };
    shape?: {
      /** Border radius size in px default 6 */
      radius?: number;
    };
  };}
```

### Variants

There are three variants: `default`, `compact` and `drawer`

#### Drawer

If you chose the `drawer` variant, you need to create and assign a `ref` in order to control it:

```tsx
import { useRef } from 'react';
import { TDrawer, CCIPWidget, Config } from 'ccip-react-components';

export const Page = () = {
  const drawerRef = useRef<TDrawer>(null);
  const toggleDrawer = () => drawerRef.current?.toggleDrawer();

  return (
    <div>
      <button onClick={toggleDrawer}>Open</button>
      <CCIPWidget config={config} ref={drawerRef} />
    </div>
  );
}
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

1. Fork the repository.
1. Create your feature branch (git checkout -b feature/my-feature).
1. Commit your changes (git commit -m 'Add some feature').
1. Push to the branch (git push origin feature/my-feature).
1. Open a pull request.

## License

CCIP-React-Components is available under the MIT license.