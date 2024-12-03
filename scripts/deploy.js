const { ethers } = require('hardhat')

async function main () {
  // Get the contract factory
  const CowFactory = await ethers.getContractFactory('CowFactory')

  // Deploy the contract
  const cowFactory = await CowFactory.deploy(
    'mintSourceCode', // Replace with actual mint source code
    1, // Replace with actual subscription ID
    '0xYourCapitalWalletAddress', // Replace with actual capital wallet address
    '0xYourCowPurchaseWalletAddress' // Replace with actual cow purchase wallet address
  )

  await cowFactory.deployed()

  console.log('CowFactory deployed to:', cowFactory.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
