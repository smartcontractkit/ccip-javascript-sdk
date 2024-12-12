import { Address } from 'viem';
import {
  CoinbaseWalletParameters,
  MetaMaskParameters,
  InjectedParameters,
  WalletConnectParameters,
} from 'wagmi/connectors';
export type Config = {
  /** The main shape of the app */
  variant?: 'default' | 'compact' | 'drawer';
  /** Customize the theme of the app */
  theme?: {
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
  };
  /** Set the available chain IDs on which transfers can be both sent and received
   * 
   * @example
   * import { mainnet, avalanche } from 'viem/chains';
   * import { Config } from '@chainlink/ccip-react-components';
   * const config: Config = {
   *  // Only Ethereum and Avalanche will be available
      chains: { allow: [mainnet.id, avalanche.id] },
    };
   * @example
   * import { mainnet, avalanche } from 'viem/chains';
   * import { Config } from '@chainlink/ccip-react-components';
   * const config: Config = {
      // All chains except Ethereum and Avalanche will be available
      chains: { deny: [mainnet.id, avalanche.id] },
    };
   *
   */
  chains?: {
    /** Set chains IDs from which transfers can be sent
     * 
     * @example
     * import { mainnet, avalanche } from 'viem/chains';
     * import { Config } from '@chainlink/ccip-react-components';
     * const config: Config = {
     *  // Transfers can be sent only from Ethereum and Avalanche
        chains: { from: { allow: [mainnet.id, avalanche.id] } },
       };
     * @example
     * import { mainnet, avalanche } from 'viem/chains';
     * import { Config } from '@chainlink/ccip-react-components';
     * const config: Config = {
     *  // Transfers can be sent from all chains except Ethereum and Avalanche
      chains: { from: { deny: [mainnet.id, avalanche.id] } },
      };
     */
    from?: AllowDeny<number>;
    /** Set chains IDs where transfers can be received
     * 
     * @example
     * import { mainnet, avalanche } from 'viem/chains';
     * import { Config } from '@chainlink/ccip-react-components';
     * const config: Config = {
     *  // Transfers can be received only to Ethereum and Avalanche
        chains: { to: { allow: [mainnet.id, avalanche.id] } },
       };
     * @example
     * import { mainnet, avalanche } from 'viem/chains';
     * import { Config } from '@chainlink/ccip-react-components';
     * const config: Config = {
     *  // Transfers can be received on all chains except Ethereum and Avalanche
        chains: { to: { deny: [mainnet.id, avalanche.id] } },
       };
     */
    to?: AllowDeny<number>;
  } & AllowDeny<number>;
  /** Preselect a chain to send a transfer from
   * @example
   * import { mainnet } from 'viem/chains';
   * import { Config } from '@chainlink/ccip-react-components';
   * const config: Config = { fromChain: mainnet.id };
   */
  fromChain?: number;
  /** Preselect a chain to receive a transfer
   * @example
   * import { mainnet } from 'viem/chains';
   * import { Config } from '@chainlink/ccip-react-components';
   * const config: Config = { toChain: mainnet.id };
   */
  toChain?: number;
  /** Preselect a token to transfer
   * @example
   * import { Config } from '@chainlink/ccip-react-components';
   * const config: Config = { token: 'USDC' }
   */
  token?: string;
  /** Configure the wallet connection options */
  walletConfig?: WalletConfig;
};

export type WalletConfig = {
  /** Configure the connection options for Injected Connectors
   * More info: https://wagmi.sh/react/api/connectors/injected
   */
  injected?: InjectedParameters;
  /** Configure the connection options for MetaMask
   * More info: https://wagmi.sh/react/api/connectors/metaMask
   */
  metamask?: MetaMaskParameters;
  /** Configure the connection options for Wallet Connect
   * A valid projectId should be provided in order to use Wallet Connect
   * More info: https://wagmi.sh/react/api/connectors/walletConnect
   */
  walletConnect?: WalletConnectParameters;
  /** Configure the connection options for Coinbase Wallet
   * More info: https://wagmi.sh/react/api/connectors/coinbaseWallet
   */
  coinbaseWallet?: CoinbaseWalletParameters;
};

export type ConfigProps = {
  config?: Config;
  drawer?: DrawerProps;
  /** Refer to CCIP docs for a list of the supported tokens: https://docs.chain.link/ccip/supported-networks */
  tokensList: Token[];
};

export type DrawerProps = {
  open?: boolean;
};

export interface AllowDeny<T> {
  /** If specified only the items in this list will be available */
  allow?: T[];
  /** If specified the default items will be available, except the ones in this list */
  deny?: T[];
}

export type TDrawer = {
  isOpen(): void;
  toggleDrawer(): void;
  openDrawer(): void;
  closeDrawer(): void;
};

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
  /** A list of meta information tags for organizing and sorting */
  tags?: string[];
};
