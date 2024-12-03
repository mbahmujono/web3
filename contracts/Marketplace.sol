// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ICowNFT {
  function setPrice(uint256 price) external;
  function cowPrice() external view returns (uint256);
}

contract Marketplace is ReentrancyGuard, Ownable {
  struct Listing {
    address seller;
    uint256 price;
    bool isActive;
  }

  ICowNFT public cowNFT;
  uint256 public transactionFee; // Fee in percentage (e.g., 2 for 2%)
  mapping(uint256 => Listing) public listings;

  event NFTListed(address indexed seller, uint256 indexed tokenId, uint256 price);
  event NFTSold(address indexed buyer, uint256 indexed tokenId, uint256 price);
  event NFTDelisted(address indexed seller, uint256 indexed tokenId);

  constructor(address cowNFTAddress, uint256 initialTransactionFee) {
    cowNFT = ICowNFT(cowNFTAddress);
    transactionFee = initialTransactionFee;
  }

  function listNFT(uint256 tokenId, uint256 price) external nonReentrant {
    require(cowNFT.ownerOf(tokenId) == msg.sender, "Not the owner");
    require(price > 0, "Price must be greater than zero");

    listings[tokenId] = Listing({
      seller: msg.sender,
      price: price,
      isActive: true
    });

    emit NFTListed(msg.sender, tokenId, price);
  }

  function buyNFT(uint256 tokenId) external payable nonReentrant {
    Listing memory listing = listings[tokenId];
    require(listing.isActive, "NFT not listed for sale");
    require(msg.value >= listing.price, "Insufficient payment");

    uint256 fee = (listing.price * transactionFee) / 100;
    uint256 sellerProceeds = listing.price - fee;

    payable(listing.seller).transfer(sellerProceeds);
    payable(owner()).transfer(fee);

    cowNFT.safeTransferFrom(listing.seller, msg.sender, tokenId);

    listings[tokenId].isActive = false;

    emit NFTSold(msg.sender, tokenId, listing.price);
  }

  function delistNFT(uint256 tokenId) external nonReentrant {
    Listing memory listing = listings[tokenId];
    require(listing.seller == msg.sender, "Not the seller");
    require(listing.isActive, "NFT not listed");

    listings[tokenId].isActive = false;

    emit NFTDelisted(msg.sender, tokenId);
  }

  function updateTransactionFee(uint256 newFee) external onlyOwner {
    transactionFee = newFee;
  }

  // New function to update the price of CowNFTs
  function updateCowNFTPrice(uint256 newPrice) external onlyOwner {
    cowNFT.setPrice(newPrice);
  }

  // New function to get the current price of CowNFTs
  function getCowNFTPrice() external view returns (uint256) {
    return cowNFT.cowPrice();
  }
}
