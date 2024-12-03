// ERC20 contract for the $MILK token
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;
// ERC20 contract for the $MILK token
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MilkToken is ERC20, Ownable {
  constructor() ERC20("MilkToken", "MILK") {
    _mint(msg.sender, 1000000 * 10 ** decimals());
  }

  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
  }

  function burn(uint256 amount) public {
    _burn(msg.sender, amount);
  }
}
