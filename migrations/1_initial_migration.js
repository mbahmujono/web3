const { ethers } = require('hardhat')

async function main () {
  const [deployer] = await ethers.getSigners()

  console.log('Deploying contracts with the account:', deployer.address)

  const CowFactory = await ethers.getContractFactory('CowFactory')
  const cowFactory = await CowFactory.deploy(
    'mintSourceCode', // Replace with actual mint source code
    1, // Replace with actual subscription ID
    deployer.address, // Replace with actual capital wallet address
    deployer.address // Replace with actual cow purchase wallet address
  )
  await cowFactory.deployed()
  console.log('CowFactory deployed to:', cowFactory.address)

  const MilkToken = await ethers.getContractFactory('MilkToken')
  const milkToken = await MilkToken.deploy()
  await milkToken.deployed()
  console.log('MilkToken deployed to:', milkToken.address)

  const ReturnWallet = await ethers.getContractFactory('ReturnWallet')
  const returnWallet = await ReturnWallet.deploy()
  await returnWallet.deployed()
  console.log('ReturnWallet deployed to:', returnWallet.address)

  const Marketplace = await ethers.getContractFactory('Marketplace')
  const marketplace = await Marketplace.deploy()
  await marketplace.deployed()
  console.log('Marketplace deployed to:', marketplace.address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
