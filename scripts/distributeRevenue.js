// script to distribute revenue to investors
const { ethers } = require('hardhat')

async function main () {
  // Get the contract factory
  const ReturnWallet = await ethers.getContractFactory('ReturnWallet')

  // Attach to the deployed contract
  const returnWalletAddress = '0xYourDeployedReturnWalletAddress' // Replace with actual deployed ReturnWallet address
  const returnWallet = await ReturnWallet.attach(returnWalletAddress)

  // Define the investors and their respective shares
  const investors = [
    { address: '0xInvestorAddress1', share: 50 }, // Replace with actual investor address and share
    { address: '0xInvestorAddress2', share: 30 }, // Replace with actual investor address and share
    { address: '0xInvestorAddress3', share: 20 }  // Replace with actual investor address and share
  ]

  // Total revenue to be distributed
  const totalRevenue = ethers.utils.parseEther('10') // Replace with actual total revenue in ETH

  // Distribute revenue to each investor based on their share
  for (const investor of investors) {
    const amount = totalRevenue.mul(investor.share).div(100)
    const tx = await returnWallet.transferToInvestor(investor.address, amount)
    await tx.wait()
    console.log(`Transferred ${ethers.utils.formatEther(amount)} ETH to ${investor.address}`)
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
