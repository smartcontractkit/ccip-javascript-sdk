// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import {BurnMintERC677} from '@chainlink/contracts-ccip/src/v0.8/shared/token/ERC677/BurnMintERC677.sol';

/// @title BridgeToken
/// @notice This contract extends the functionality of the BurnMintERC677 token contract to include a `drip` function that mints one full token to a specified address.
/// @dev Inherits from the BurnMintERC677 contract and sets the token name, symbol, decimals, and initial supply in the constructor.
contract BridgeToken is BurnMintERC677 {
  /**
   * @notice Constructor to initialize the BridgeToken contract with a name and symbol.
   * @dev Calls the parent constructor of BurnMintERC677 with fixed decimals (18) and initial supply (0).
   * @param name - The name of the token.
   * @param symbol - The symbol of the token.
   */
  constructor(string memory name, string memory symbol) BurnMintERC677(name, symbol, 18, 0) {}

  /**
   * @notice Mints one full token (1e18) to the specified address.
   * @dev Calls the internal `_mint` function from the BurnMintERC677 contract.
   * @param to - The address to receive the minted token.
   */
  function drip(address to) external {
    _mint(to, 1e18);
  }
}
