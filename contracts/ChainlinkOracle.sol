// ChainlinkOracle.sol  # Oracle integration for fetching cow prices
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IChainlinkOracle {
  function latestAnswer() external view returns (uint256);
}

contract ChainlinkOracle {
  IChainlinkOracle public priceFeed;

  constructor(address _priceFeed) {
    priceFeed = IChainlinkOracle(_priceFeed);
  }

  /**
   * @dev Fetches the latest cow price from the Chainlink Oracle.
   * @return The latest cow price.
   */
  function getLatestCowPrice() external view returns (uint256) {
    return priceFeed.latestAnswer();
  }
}
