<div style="text-align:center" align="center">
    <a href="https://chain.link" target="_blank">
        <img src="https://raw.githubusercontent.com/smartcontractkit/chainlink/develop/docs/logo-chainlink-blue.svg" width="225" alt="Chainlink logo">
    </a>

[![License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/smartcontractkit/ccip-javascript-sdk/blob/main/LICENSE)
[![SDK Documentation](https://img.shields.io/static/v1?label=sdk-docs&message=latest&color=blue)](https://docs.chain.link/ccip/ccip-javascript-sdk/)
</div>

# CCIP JavaScript SDK

The CCIP JavaScript SDK includes two packages:
  - [`ccip-js`](/packages/ccip-js/README.md): A TypeScript library that provides a client for managing cross-chain token transfers that use Chainlink's [Cross-Chain Interoperability Protocol (CCIP)](https://docs.chain.link/ccip) routers.
  - [`ccip-react-components`](/packages/ccip-react-components/README.md): A set of prebuilt ready-to-use UI components built on top of `ccip-js`.

  Using both packages, you can add a fully featured CCIP bridge to your app that can be styled to match your app design.
  
  To view more detailed documentation and more examples, visit the [Chainlink Javascript SDK Documentation](https://docs.chain.link/ccip/ccip-javascript-sdk/).

### Prerequisites

1. Clone the `ccip-javascript-sdk` repo:

```sh
git clone https://github.com/smartcontractkit/ccip-javascript-sdk.git
```

2. [Install `pnpm`](https://pnpm.io/installation).

3. Run `pnpm install`


### Run the example app

```sh
pnpm build
```

```sh
pnpm dev-example
```

### Build packages

If you want to make changes to the package code, you need to rebuild the packages and make sure package.json file to point to the updated local versions. 

Make sure to build the `ccip-js` package before you build the `ccip-react-components` package. The React components depend on the JS package.

Follow these steps:

1. Build the `ccip-js` package:

```sh
pnpm build-ccip-js
```

2. Build the `ccip-react-components` package:

```sh
pnpm build-components
```

3. Update the `ccip-react-components` package to use the local `ccip-js` version by modifying `packages/ccip-react-components/package.json` file. Replace the `@chainlink/ccip-js` dependency with the workspace reference:

```sh
"@chainlink/ccip-js": "workspace:*"
```

4. Update the `examples/nextjs` app to use both local `ccip-js` and `ccip-react-components` version by modifying `examples/nextjs/package.json` file. Replace the `@chainlink/ccip-js` and `@chainlink/ccip-react-components` dependency with relative path:

```sh
"@chainlink/ccip-js": "link:../../packages/ccip-js",
"@chainlink/ccip-react-components": "link:../../packages/ccip-react-components",
```

## Resources

- [Chainlink CCIP Javascript SDK Documentation](https://docs.chain.link/ccip/ccip-javascript-sdk/)
- [Chainlink CCIP Documentation](https://docs.chain.link/ccip)
- [Chainlink CCIP Directory](https://docs.chain.link/ccip/directory)
- [Chainlink Documentation](https://docs.chain.link/)