// Test Cases for CowNFT Contract
const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('CowFactory', function () {
  let CowFactory, cowFactory, owner, addr1, addr2

  beforeEach(async function () {
    CowFactory = await ethers.getContractFactory('CowFactory')
    ;[owner, addr1, addr2] = await ethers.getSigners()
    cowFactory = await CowFactory.deploy(
      'mintSourceCode', // Replace with actual mint source code
      1, // Replace with actual subscription ID
      owner.address, // Replace with actual capital wallet address
      addr1.address // Replace with actual cow purchase wallet address
    )
    await cowFactory.deployed()
  })

  it('should deploy the contract and set the correct owner', async function () {
    expect(await cowFactory.owner()).to.equal(owner.address)
  })

  it('should update the price of a CowNFT', async function () {
    const newPrice = ethers.utils.parseEther('0.5')
    await cowFactory.setPrice(newPrice)
    expect(await cowFactory.cowPrice()).to.equal(newPrice)
  })

  it('should mint a CowNFT', async function () {
    const tokenURI = 'ipfs://your-token-uri'
    const amountOfTokensToMint = ethers.utils.parseEther('1')
    await cowFactory.setPrice(amountOfTokensToMint)

    await expect(cowFactory.sendRequestToMintCow(tokenURI, amountOfTokensToMint))
      .to.emit(cowFactory, 'CowMinted')
      .withArgs(owner.address, 0, tokenURI)

    expect(await cowFactory.nextTokenId()).to.equal(1)
    expect(await cowFactory.tokenURI(0)).to.equal(tokenURI)
  })

  it('should transfer funds to Cow Purchase Wallet before minting', async function () {
    const tokenURI = 'ipfs://your-token-uri'
    const amountOfTokensToMint = ethers.utils.parseEther('1')
    await cowFactory.setPrice(amountOfTokensToMint)

    await expect(() =>
      cowFactory.sendRequestToMintCow(tokenURI, amountOfTokensToMint)
    ).to.changeEtherBalances([owner, addr1], [-amountOfTokensToMint, amountOfTokensToMint])
  })

  it('should update the portfolio value', async function () {
    const newPortfolioValue = ethers.utils.parseEther('100')
    await cowFactory.updatePortfolioValue(newPortfolioValue)
    expect(await cowFactory.portfolioValue()).to.equal(newPortfolioValue)
  })
})
