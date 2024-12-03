//this is contract for Capital Wallet and Return Wallet
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract CapitalWallet {
  mapping(address => uint256) public balances;

  /**
   * @dev Checks if the caller has sufficient balance in the Capital Wallet.
   * @param amount Amount to check.
   * @return bool True if the caller has sufficient balance, false otherwise.
   */
  function checkCapitalBalance(uint256 amount) external view returns (bool) {
    return balances[msg.sender] >= amount;
  }

  /**
   * @dev Deposits funds into the caller's balance.
   */
  function deposit() external payable {
    balances[msg.sender] += msg.value;
  }

  /**
   * @dev Withdraws funds from the caller's balance.
   * @param amount Amount to withdraw.
   */
  function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount, "Insufficient balance");
    balances[msg.sender] -= amount;
    payable(msg.sender).transfer(amount);
  }
}

contract ReturnWallet {
  mapping(address => uint256) public balances;

  /**
   * @dev Deposits funds into the caller's balance.
   */
  function deposit() external payable {
    balances[msg.sender] += msg.value;
  }

  /**
   * @dev Withdraws funds from the caller's balance.
   * @param amount Amount to withdraw.
   */
  function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount, "Insufficient balance");
    balances[msg.sender] -= amount;
    payable(msg.sender).transfer(amount);
  }

  /**
   * @dev Transfers funds to an investor's wallet.
   * @param investor Address of the investor.
   * @param amount Amount to transfer.
   */
  function transferToInvestor(address investor, uint256 amount) external {
    require(balances[msg.sender] >= amount, "Insufficient balance");
    balances[msg.sender] -= amount;
    balances[investor] += amount;
  }
}
