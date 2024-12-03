// Test Cases for Marketplace Contract
const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Marketplace Contract', function () {
  let Marketplace, marketplace, CowNFT, cowNFT, owner, addr1, addr2

  beforeEach(async function () {
    // Deploy CowNFT contract
    CowNFT = await ethers.getContractFactory('CowNFT')
    ;[owner, addr1, addr2] = await ethers.getSigners()
    cowNFT = await CowNFT.deploy()
    await cowNFT.deployed()

    // Deploy Marketplace contract
    Marketplace = await ethers.getContractFactory('Marketplace')
    marketplace = await Marketplace.deploy(cowNFT.address, 2) // 2% transaction fee
    await marketplace.deployed()
  })

  it('should list an NFT on the marketplace', async function () {
    const tokenId = 1
    const price = ethers.utils.parseEther('0.1')

    await cowNFT.mint(owner.address, tokenId)
    await cowNFT.approve(marketplace.address, tokenId)

    await expect(marketplace.listNFT(tokenId, price))
      .to.emit(marketplace, 'NFTListed')
      .withArgs(owner.address, tokenId, price)

    const listing = await marketplace.listings(tokenId)
    expect(listing.seller).to.equal(owner.address)
    expect(listing.price).to.equal(price)
    expect(listing.isActive).to.be.true
  })

  it('should buy an NFT from the marketplace', async function () {
    const tokenId = 1
    const price = ethers.utils.parseEther('0.1')

    await cowNFT.mint(owner.address, tokenId)
    await cowNFT.approve(marketplace.address, tokenId)
    await marketplace.listNFT(tokenId, price)

    await expect(() =>
      marketplace.connect(addr1).buyNFT(tokenId, { value: price })
    ).to.changeEtherBalances([addr1, owner], [-price, price])

    const listing = await marketplace.listings(tokenId)
    expect(listing.isActive).to.be.false
    expect(await cowNFT.ownerOf(tokenId)).to.equal(addr1.address)
  })

  it('should delist an NFT from the marketplace', async function () {
    const tokenId = 1
    const price = ethers.utils.parseEther('0.1')

    await cowNFT.mint(owner.address, tokenId)
    await cowNFT.approve(marketplace.address, tokenId)
    await marketplace.listNFT(tokenId, price)

    await expect(marketplace.delistNFT(tokenId))
      .to.emit(marketplace, 'NFTDelisted')
      .withArgs(owner.address, tokenId)

    const listing = await marketplace.listings(tokenId)
    expect(listing.isActive).to.be.false
  })

  it('should update the transaction fee', async function () {
    const newFee = 5 // 5%
    await marketplace.updateTransactionFee(newFee)
    expect(await marketplace.transactionFee()).to.equal(newFee)
  })

  it('should update the price of CowNFTs', async function () {
    const newPrice = ethers.utils.parseEther('0.5')
    await marketplace.updateCowNFTPrice(newPrice)
    expect(await marketplace.getCowNFTPrice()).to.equal(newPrice)
  })
})

// Test Cases for listOnMarketplace.js script
describe('listOnMarketplace.js script', function () {
  let CowFactory, cowFactory, owner, addr1

  beforeEach(async function () {
    CowFactory = await ethers.getContractFactory('CowFactory')
    ;[owner, addr1] = await ethers.getSigners()
    cowFactory = await CowFactory.deploy(
      'mintSourceCode', // Replace with actual mint source code
      1, // Replace with actual subscription ID
      owner.address, // Replace with actual capital wallet address
      addr1.address // Replace with actual cow purchase wallet address
    )
    await cowFactory.deployed()
  })

  it('should list a CowNFT on the marketplace', async function () {
    const tokenId = 1
    const price = ethers.utils.parseEther('0.1')

    await cowFactory.mint(owner.address, tokenId)
    await cowFactory.approve(marketplace.address, tokenId)

    const tx = await cowFactory.listCowNFTOnMarketplace(tokenId, price)
    await tx.wait()

    const listing = await marketplace.listings(tokenId)
    expect(listing.seller).to.equal(owner.address)
    expect(listing.price).to.equal(price)
    expect(listing.isActive).to.be.true
  })
})
