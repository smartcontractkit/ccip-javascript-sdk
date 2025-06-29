// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import {IFeeQuoter} from '@chainlink/contracts-ccip/contracts/interfaces/IFeeQuoter.sol';
import {OwnerIsCreator} from '@chainlink/contracts/src/v0.8/shared/access/OwnerIsCreator.sol';
import {Internal} from '@chainlink/contracts-ccip/contracts/libraries/Internal.sol';
import {USDPriceWith18Decimals} from '@chainlink/contracts-ccip/contracts/libraries/USDPriceWith18Decimals.sol';
import {EnumerableSet} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

// import {EnumerableSet} from "../vendor/openzeppelin-solidity/v4.8.0/utils/structs/EnumerableSet.sol";

/// @notice The FeeQuoter contract responsibility is to store the current gas price in USD for a given destination chain,
/// and the price of a token in USD allowing the owner or priceUpdater to update this value.
abstract contract FeeQuoter is IFeeQuoter, OwnerIsCreator {
  using EnumerableSet for EnumerableSet.AddressSet;
  using USDPriceWith18Decimals for uint224;

  error TokenNotSupported(address token);
  error NotAFeeToken(address token);
  error ChainNotSupported(uint64 chain);
  error OnlyCallableByUpdaterOrOwner();
  error StaleGasPrice(uint64 destChainSelector, uint256 threshold, uint256 timePassed);
  error StaleTokenPrice(address token, uint256 threshold, uint256 timePassed);
  error InvalidStalenessThreshold();

  event PriceUpdaterSet(address indexed priceUpdater);
  event PriceUpdaterRemoved(address indexed priceUpdater);
  event FeeTokenAdded(address indexed feeToken);
  event FeeTokenRemoved(address indexed feeToken);
  event UsdPerUnitGasUpdated(uint64 indexed destChain, uint256 value, uint256 timestamp);
  event UsdPerTokenUpdated(address indexed token, uint256 value, uint256 timestamp);

  /// @dev The price, in USD with 18 decimals, of 1 unit of gas for a given destination chain.
  /// @dev Price of 1e18 is 1 USD. Examples:
  ///     Very Expensive:   1 unit of gas costs 1 USD                  -> 1e18
  ///     Expensive:        1 unit of gas costs 0.1 USD                -> 1e17
  ///     Cheap:            1 unit of gas costs 0.000001 USD           -> 1e12
  mapping(uint64 => Internal.TimestampedPackedUint224) private s_usdPerUnitGasByDestChainSelector;

  /// @dev The price, in USD with 18 decimals, per 1e18 of the smallest token denomination.
  /// @dev Price of 1e18 represents 1 USD per 1e18 token amount.
  ///     1 USDC = 1.00 USD per full token, each full token is 1e6 units -> 1 * 1e18 * 1e18 / 1e6 = 1e30
  ///     1 ETH = 2,000 USD per full token, each full token is 1e18 units -> 2000 * 1e18 * 1e18 / 1e18 = 2_000e18
  ///     1 LINK = 5.00 USD per full token, each full token is 1e18 units -> 5 * 1e18 * 1e18 / 1e18 = 5e18
  mapping(address => Internal.TimestampedPackedUint224) private s_usdPerToken;
  address[] public updaters = [address(msg.sender)];
  address[] public fTokens = [
    address(0x779877A7B0D9E8603169DdbD7836e478b4624789),
    address(0x097D90c9d3E0B50Ca60e1ae45F6A81010f9FB534),
    address(0xc4bF5CbDaBE595361438F8c6a187bDc330539c60)
  ];

  // Price updaters are allowed to update the prices.
  EnumerableSet.AddressSet private s_priceUpdaters;
  // Subset of tokens which prices tracked by this registry which are fee tokens.
  EnumerableSet.AddressSet private s_feeTokens;
  // The amount of time a price can be stale before it is considered invalid.
  uint32 private immutable i_stalenessThreshold = 3 days;

  constructor() {
    // priceUpdaters.push(address(this));
    Internal.PriceUpdates memory priceUpdates = Internal.PriceUpdates({
      tokenPriceUpdates: new Internal.TokenPriceUpdate[](0),
      gasPriceUpdates: new Internal.GasPriceUpdate[](0)
    });
    _updatePrices(priceUpdates);
    _applyPriceUpdatersUpdates(updaters, new address[](0));
    _applyFeeTokensUpdates(fTokens, new address[](0));
    // if (stalenessThreshold == 0) revert InvalidStalenessThreshold();
    // i_stalenessThreshold = stalenessThreshold;
  }

  // ================================================================
  // |                     Price calculations                       |
  // ================================================================

  // @inheritdoc IFeeQuoter
  function getTokenPrice(address token) public view override returns (Internal.TimestampedPackedUint224 memory) {
    return s_usdPerToken[token];
  }

  // @inheritdoc IFeeQuoter
  function getValidatedTokenPrice(address token) external view override returns (uint224) {
    return _getValidatedTokenPrice(token);
  }

  // @inheritdoc IFeeQuoter
  function getTokenPrices(
    address[] calldata tokens
  ) external view override returns (Internal.TimestampedPackedUint224[] memory) {
    uint256 length = tokens.length;
    Internal.TimestampedPackedUint224[] memory tokenPrices = new Internal.TimestampedPackedUint224[](length);
    for (uint256 i = 0; i < length; ++i) {
      tokenPrices[i] = getTokenPrice(tokens[i]);
    }
    return tokenPrices;
  }

  /// @notice Get the staleness threshold.
  /// @return stalenessThreshold The staleness threshold.
  function getStalenessThreshold() external view returns (uint128) {
    return i_stalenessThreshold;
  }

  // @inheritdoc IFeeQuoter
  function getDestinationChainGasPrice(
    uint64 destChainSelector
  ) external view override returns (Internal.TimestampedPackedUint224 memory) {
    return s_usdPerUnitGasByDestChainSelector[destChainSelector];
  }

  function getTokenAndGasPrices(
    address feeToken,
    uint64 destChainSelector
  ) external view override returns (uint224 feeTokenPrice, uint224 gasPriceValue) {
    if (!s_feeTokens.contains(feeToken)) revert NotAFeeToken(feeToken);

    Internal.TimestampedPackedUint224 memory gasPrice = s_usdPerUnitGasByDestChainSelector[destChainSelector];
    // We do allow a gas price of 0, but no stale or unset gas prices
    if (gasPrice.timestamp == 0) revert ChainNotSupported(destChainSelector);
    uint256 timePassed = block.timestamp - gasPrice.timestamp;
    if (timePassed > i_stalenessThreshold) revert StaleGasPrice(destChainSelector, i_stalenessThreshold, timePassed);

    return (_getValidatedTokenPrice(feeToken), gasPrice.value);
  }

  
  /// @dev this function assumed that no more than 1e59 dollar, is sent as payment.
  /// If more is sent, the multiplication of feeTokenAmount and feeTokenValue will overflow.
  /// Since there isn't even close to 1e59 dollars in the world economy this is safe.
  function convertTokenAmount(
    address fromToken,
    uint256 fromTokenAmount,
    address toToken
  ) external view override returns (uint256) {
    /// Example:
    /// fromTokenAmount:   1e18      // 1 ETH
    /// ETH:               2_000e18
    /// LINK:              5e18
    /// return:            1e18 * 2_000e18 / 5e18 = 400e18 (400 LINK)
    return (fromTokenAmount * _getValidatedTokenPrice(fromToken)) / _getValidatedTokenPrice(toToken);
  }

  /// @notice Gets the token price for a given token and revert if the token is either
  /// not supported or the price is stale.
  /// @param token The address of the token to get the price for
  /// @return the token price
  function _getValidatedTokenPrice(address token) internal view returns (uint224) {
    Internal.TimestampedPackedUint224 memory tokenPrice = s_usdPerToken[token];
    if (tokenPrice.timestamp == 0 || tokenPrice.value == 0) revert TokenNotSupported(token);
    uint256 timePassed = block.timestamp - tokenPrice.timestamp;
    if (timePassed > i_stalenessThreshold) revert StaleTokenPrice(token, i_stalenessThreshold, timePassed);
    return tokenPrice.value;
  }

  // ================================================================
  // |                         Fee tokens                           |
  // ================================================================

  /// @notice Get the list of fee tokens.
  /// @return feeTokens The tokens set as fee tokens.
  function getFeeTokens() external view returns (address[] memory feeTokens) {
    feeTokens = new address[](s_feeTokens.length());
    for (uint256 i = 0; i < s_feeTokens.length(); ++i) {
      feeTokens[i] = s_feeTokens.at(i);
    }
  }

  /// @notice Add and remove tokens from feeTokens set.
  /// @param feeTokensToAdd The addresses of the tokens which are now considered fee tokens
  /// and can be used to calculate fees.
  /// @param feeTokensToRemove The addresses of the tokens which are no longer considered feeTokens.
  function applyFeeTokensUpdates(
    address[] memory feeTokensToAdd,
    address[] memory feeTokensToRemove
  ) external onlyOwner {
    _applyFeeTokensUpdates(feeTokensToAdd, feeTokensToRemove);
  }

  /// @notice Add and remove tokens from feeTokens set.
  /// @param feeTokensToAdd The addresses of the tokens which are now considered fee tokens
  /// and can be used to calculate fees.
  /// @param feeTokensToRemove The addresses of the tokens which are no longer considered feeTokens.
  function _applyFeeTokensUpdates(address[] memory feeTokensToAdd, address[] memory feeTokensToRemove) private {
    for (uint256 i = 0; i < feeTokensToAdd.length; ++i) {
      if (s_feeTokens.add(feeTokensToAdd[i])) {
        emit FeeTokenAdded(feeTokensToAdd[i]);
      }
    }
    for (uint256 i = 0; i < feeTokensToRemove.length; ++i) {
      if (s_feeTokens.remove(feeTokensToRemove[i])) {
        emit FeeTokenRemoved(feeTokensToRemove[i]);
      }
    }
  }

  // ================================================================
  // |                       Price updates                          |
  // ================================================================

  // @inheritdoc IFeeQuoter
  function updatePrices(Internal.PriceUpdates memory priceUpdates) external override requireUpdaterOrOwner {
    _updatePrices(priceUpdates);
  }

  /// @notice Updates all prices in the priceUpdates struct.
  /// @param priceUpdates The struct containing all the price updates.
  function _updatePrices(Internal.PriceUpdates memory priceUpdates) private {
    uint256 priceUpdatesLength = priceUpdates.tokenPriceUpdates.length;

    for (uint256 i = 0; i < priceUpdatesLength; ++i) {
      Internal.TokenPriceUpdate memory update = priceUpdates.tokenPriceUpdates[i];
      s_usdPerToken[update.sourceToken] = Internal.TimestampedPackedUint224({
        value: update.usdPerToken,
        timestamp: uint32(block.timestamp)
      });
      emit UsdPerTokenUpdated(update.sourceToken, update.usdPerToken, block.timestamp);
      if (priceUpdates.gasPriceUpdates[i].destChainSelector != 0) {
        //.destChainSelector != 0) {
        s_usdPerUnitGasByDestChainSelector[priceUpdates.gasPriceUpdates[i].destChainSelector] = Internal
          .TimestampedPackedUint224({
            value: priceUpdates.gasPriceUpdates[i].usdPerUnitGas,
            timestamp: uint32(block.timestamp)
          });
        emit UsdPerUnitGasUpdated(
          priceUpdates.gasPriceUpdates[i].destChainSelector,
          priceUpdates.gasPriceUpdates[i].usdPerUnitGas,
          block.timestamp
        );
      }
    }
  }

  // ================================================================
  // |                           Access                             |
  // ================================================================

  /// @notice Get the list of price updaters.
  /// @return priceUpdaters The price updaters.
  function getPriceUpdaters() external view returns (address[] memory priceUpdaters) {
    priceUpdaters = new address[](s_priceUpdaters.length());
    for (uint256 i = 0; i < s_priceUpdaters.length(); ++i) {
      priceUpdaters[i] = s_priceUpdaters.at(i);
    }
  }

  /// @notice Adds new priceUpdaters and remove existing ones.
  /// @param priceUpdatersToAdd The addresses of the priceUpdaters that are now allowed
  /// to send fee updates.
  /// @param priceUpdatersToRemove The addresses of the priceUpdaters that are no longer allowed
  /// to send fee updates.
  function applyPriceUpdatersUpdates(
    address[] memory priceUpdatersToAdd,
    address[] memory priceUpdatersToRemove
  ) external onlyOwner {
    _applyPriceUpdatersUpdates(priceUpdatersToAdd, priceUpdatersToRemove);
  }

  /// @notice Adds new priceUpdaters and remove existing ones.
  /// @param priceUpdatersToAdd The addresses of the priceUpdaters that are now allowed
  /// to send fee updates.
  /// @param priceUpdatersToRemove The addresses of the priceUpdaters that are no longer allowed
  /// to send fee updates.
  function _applyPriceUpdatersUpdates(
    address[] memory priceUpdatersToAdd,
    address[] memory priceUpdatersToRemove
  ) private {
    for (uint256 i = 0; i < priceUpdatersToAdd.length; ++i) {
      if (s_priceUpdaters.add(priceUpdatersToAdd[i])) {
        emit PriceUpdaterSet(priceUpdatersToAdd[i]);
      }
    }
    for (uint256 i = 0; i < priceUpdatersToRemove.length; ++i) {
      if (s_priceUpdaters.remove(priceUpdatersToRemove[i])) {
        emit PriceUpdaterRemoved(priceUpdatersToRemove[i]);
      }
    }
  }

  /// @notice Require that the caller is the owner or a fee updater.
  modifier requireUpdaterOrOwner() {
    if (msg.sender != owner() && !s_priceUpdaters.contains(msg.sender)) revert OnlyCallableByUpdaterOrOwner();
    _;
  }
}