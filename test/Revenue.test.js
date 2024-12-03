// Test Cases for Revenue.js script and Revenue Contract
const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Revenue.js script', function () {
  let ReturnWallet, returnWallet, owner, addr1, addr2

  beforeEach(async function () {
    ReturnWallet = await ethers.getContractFactory('ReturnWallet')
    ;[owner, addr1, addr2] = await ethers.getSigners()
    returnWallet = await ReturnWallet.deploy()
    await returnWallet.deployed()
  })

  it('should distribute revenue to investors', async function () {
    const investors = [
      { address: addr1.address, share: 50 },
      { address: addr2.address, share: 30 },
      { address: owner.address, share: 20 }
    ]
    const totalRevenue = ethers.utils.parseEther('10')

    // Deposit total revenue to the return wallet
    await returnWallet.connect(owner).deposit({ value: totalRevenue })

    // Distribute revenue
    for (const investor of investors) {
      const amount = totalRevenue.mul(investor.share).div(100)
      await returnWallet.connect(owner).transferToInvestor(investor.address, amount)
    }

    // Check balances
    expect(await returnWallet.balances(addr1.address)).to.equal(ethers.utils.parseEther('5'))
    expect(await returnWallet.balances(addr2.address)).to.equal(ethers.utils.parseEther('3'))
    expect(await returnWallet.balances(owner.address)).to.equal(ethers.utils.parseEther('2'))
  })
})

describe('ReturnWallet Contract', function () {
  let ReturnWallet, returnWallet, owner, addr1

  beforeEach(async function () {
    ReturnWallet = await ethers.getContractFactory('ReturnWallet')
    ;[owner, addr1] = await ethers.getSigners()
    returnWallet = await ReturnWallet.deploy()
    await returnWallet.deployed()
  })

  it('should deposit funds into the caller\'s balance', async function () {
    const depositAmount = ethers.utils.parseEther('1')
    await returnWallet.connect(owner).deposit({ value: depositAmount })
    expect(await returnWallet.balances(owner.address)).to.equal(depositAmount)
  })

  it('should withdraw funds from the caller\'s balance', async function () {
    const depositAmount = ethers.utils.parseEther('1')
    const withdrawAmount = ethers.utils.parseEther('0.5')
    await returnWallet.connect(owner).deposit({ value: depositAmount })
    await returnWallet.connect(owner).withdraw(withdrawAmount)
    expect(await returnWallet.balances(owner.address)).to.equal(depositAmount.sub(withdrawAmount))
  })

  it('should transfer funds to an investor\'s wallet', async function () {
    const depositAmount = ethers.utils.parseEther('1')
    const transferAmount = ethers.utils.parseEther('0.5')
    await returnWallet.connect(owner).deposit({ value: depositAmount })
    await returnWallet.connect(owner).transferToInvestor(addr1.address, transferAmount)
    expect(await returnWallet.balances(owner.address)).to.equal(depositAmount.sub(transferAmount))
    expect(await returnWallet.balances(addr1.address)).to.equal(transferAmount)
  })
})
