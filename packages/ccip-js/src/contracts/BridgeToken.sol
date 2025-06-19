// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

// import {BurnMintERC677} from '/@chainlink/contracts-ccip/src/v0.8/shared/token/ERC677/BurnMintERC677.sol';
import {BurnMintERC677Helper} from '@chainlink/contracts-ccip/contracts/test/helpers/BurnMintERC677Helper.sol';

/// @title BridgeToken
/// @notice This contract is the same as BurnMintERC677Helper in that it extends the functionality of the BurnMintERC677 token contract to include a `drip` function that mints one full token to a specified address.
/// @dev Inherits from the BurnMintERC677 contract and sets the token name, symbol, decimals, and initial supply in the constructor.
abstract contract BridgeToken is BurnMintERC677Helper { }
