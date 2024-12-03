// script to list CowNFTs on the marketplace
const { ethers } = require('hardhat')

async function main () {
  // Get the contract factory
  const CowFactory = await ethers.getContractFactory('CowFactory')

  // Attach to the deployed contract
  const cowFactoryAddress = '0xYourDeployedCowFactoryAddress' // Replace with actual deployed CowFactory address
  const cowFactory = await CowFactory.attach(cowFactoryAddress)

  // List CowNFT on the marketplace
  const tokenId = 1 // Replace with the actual token ID you want to list
  const price = ethers.utils.parseEther('0.1') // Replace with the actual price in ETH

  const tx = await cowFactory.listCowNFTOnMarketplace(tokenId, price)
  await tx.wait()

  console.log(`CowNFT with token ID ${tokenId} listed on the marketplace for ${ethers.utils.formatEther(price)} ETH`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
