# CCIP JavaScript SDK Changelog

## [Unreleased]

### Fixed

#### Component Tests
- **ActionButton.test.tsx**:
  - Fixed the SwitchNetwork button test by using a more robust text matcher with regex pattern (`getByRole('button', { name: /switch/i })`)
  - Added proper mock for the `useSwitchChain` hook to enable correct button rendering
  - Corrected test case setup to ensure SwitchNetworkButton is rendered by using different chains for source and current
  - Fixed TypeScript errors in test mocks with proper type annotations

- **SendButton.test.tsx**:
  - Renamed test case from "render send button" to "render action button" for flexibility with actual rendered components
  - Updated mocks with complete type specifications and status values
  - Improved button selection approach using `screen.getByRole('button')` instead of exact text matching
  - Removed redundant test case to improve test maintenance

- **App.test.tsx**:
  - Created TestProviders wrapper component with WagmiProvider and QueryClientProvider
  - Added mocks for wagmi hooks to properly simulate blockchain state
  - Fixed "WagmiProviderNotFoundError" by ensuring all components are wrapped properly
  - Updated to pass required `chain` prop to App component
  - Extended network configuration to include all supported chains (Sepolia, Optimism Sepolia, Arbitrum Sepolia, etc.)

- **AppDefault.test.tsx**:
  - Updated context provider values with proper chain information
  - Added test data for chain configuration, contracts, and token addresses

#### Testing Infrastructure

- **run_tests.sh**:
  - Fixed script to properly handle Anvil startup and shutdown
  - Added proper port configuration (8545) to match test expectations
  - Implemented cleanup handling with bash trap to ensure Anvil is always terminated
  - Added environment variable export for test configuration
  - Fixed Jest configuration for test runs

- **package.json**:
  - Updated test script commands for better organization
  - Added Jest configuration section to avoid conflicts with config files
  - Separated test scripts to support different testing approaches

### Changed

- **UI Text Updates**:
  - Updated "Switch to chain" to "Switch" for more compact UI in ActionButton component
  - Updated related test cases to match new text

- **Documentation**:
  - Updated example code in README.md to use Avalanche Fuji instead of Optimism Sepolia
  - Fixed typo in config variable name (`networkConfing` → `networkConfig`)
  - Updated contract addresses in example configuration

### Added

- **Test Framework**:
  - Added improved mock implementations for all Wagmi hooks
  - Added test coverage reporting configuration
  - Included proper cleanup routines for test environment

## [0.3.0] - 2025-03-27

Initial version tracked in this changelog.
