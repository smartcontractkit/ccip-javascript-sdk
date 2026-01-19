<div style="text-align:center" align="center">
    <a href="https://chain.link" target="_blank">
        <img src="https://raw.githubusercontent.com/smartcontractkit/chainlink/develop/docs/logo-chainlink-blue.svg" width="225" alt="Chainlink logo">
    </a>

[![License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/smartcontractkit/ccip-javascript-sdk/blob/main/LICENSE)
[![SDK Documentation](https://img.shields.io/static/v1?label=sdk-docs&message=latest&color=blue)](https://docs.chain.link/ccip/ccip-javascript-sdk/)

</div>

# CCIP JavaScript SDK

<div role="note" align="center" style="background:#fff4e5;border-left:4px solid #ff8c00;padding:12px;border-radius:6px;margin-bottom:16px;">
  <strong>Deprecation notice:</strong> This repository is deprecated and no longer maintained. Instead please use the <a href="https://www.npmjs.com/package/@chainlink/ccip-sdk"> latest CCIP SDK here</a>.
</div>

### Start here

The CCIP JavaScript SDK is a monorepo for two packages:

-   [`ccip-js`](/packages/ccip-js/README.md): A TypeScript library that provides a client for managing cross-chain token transfers that use Chainlink's [Cross-Chain Interoperability Protocol (CCIP)](https://docs.chain.link/ccip) routers.
-   [`ccip-react-components`](/packages/ccip-react-components/README.md): A set of prebuilt ready-to-use React UI components. This package depends on `ccip-js`.

Using both packages, you can add a fully featured CCIP bridge to your app that can be styled to match your app design.

To view more detailed documentation and more examples, visit the [Chainlink Javascript SDK Documentation](https://docs.chain.link/ccip/ccip-javascript-sdk/). Development specific information is also found in individual READMEs inside the `./packages/<<PACKAGE_NAME>>` directory.

There is also an example implementation of a front end NextJS app that uses these packages in `./examples/nextjs`. That has its own README as well.

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

If you want to make changes to the package code, you need to rebuild the packages.
Then:

1. Make sure to build the `ccip-js` package before you build the `ccip-react-components` package. The React components depend on the JS package.

2. Make sure your client's package.json file to points to the updated local versions or use npm link or equivalent in your downstream client code. You can see examples of this in the steps below.

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

## Contributing

Contributions to either repos are welcome! Please open an issue or submit a pull request using the process below.

1. Fork the repository.
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ccip-javascript-sdk.git`
3. Navigate to directory: `cd ccip-javascript-sdk`
4. Fetch all branches: `git fetch origin`
5. Switch to develop branch: `git checkout develop`
6. Install dependencies: `pnpm install`
7. Create a feature branch: `git checkout -b feature/my-feature`
8. Commit your changes
9. Push to the branch (git push origin feature/my-feature).
10. Open a pull request from your fork to the `develop` branch of this repo.

🚨 Always branch off from `develop` when creating your feature branch.

## Resources

-   [ccip-js README](./packages/ccip-js/README.md)
-   [ccip-react-components README](./packages/ccip-react-components/README.md)
-   [examples/nextjs README](./examples/nextjs/README.md)
-   [Chainlink CCIP Javascript SDK Documentation](https://docs.chain.link/ccip/ccip-javascript-sdk/)
-   [Chainlink CCIP Documentation](https://docs.chain.link/ccip)
-   [Chainlink CCIP Directory](https://docs.chain.link/ccip/directory)
-   [Chainlink Documentation](https://docs.chain.link/)
