// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/functions/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/functions/request/FunctionsRequest.sol";

contract CowFactory is ERC721URIStorage, ConfirmedOwner, FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    enum MintOrRedeem {
        Mint,
        Redeem
    }

    struct CowRequest {
        uint256 amountOfTokensToMint;
        address owner;
        string tokenURI;
        MintOrRedeem action;
    }

    // Chainlink-related constants
    address constant SEPOLIA_FUNCTIONS_ROUTER = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;
    bytes32 constant DON_ID = hex"66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000";
    uint32 constant GAS_LIMIT = 300_000;

    uint64 immutable i_subscriptionId; // Chainlink subscription ID
    string private s_mintSourceCode;  // Off-chain source code for mint logic

    // Token state
    uint256 public nextTokenId;  // Next token ID to be minted
    uint256 public cowPrice;     // Price of a CowNFT
    uint256 public portfolioValue; // Custodian's portfolio value
    mapping(bytes32 => CowRequest) private s_requestIdToCowRequest; // Request mapping

    // Wallet addresses
    address public capitalWallet;
    address public cowPurchaseWallet;

    // Events
    event CowMinted(address indexed owner, uint256 indexed tokenId, string tokenURI);
    event PriceUpdated(uint256 newPrice);
    event FundsTransferred(address indexed from, address indexed to, uint256 amount);

    constructor(string memory mintSourceCode, uint64 subscriptionId, address _capitalWallet, address _cowPurchaseWallet)
        ERC721("CowNFT", "COW")
        ConfirmedOwner(msg.sender)
        FunctionsClient(SEPOLIA_FUNCTIONS_ROUTER)
    {
        s_mintSourceCode = mintSourceCode;
        i_subscriptionId = subscriptionId;
        capitalWallet = _capitalWallet;
        cowPurchaseWallet = _cowPurchaseWallet;
    }

    /**
     * @dev Update the price of a CowNFT.
     * @param price New price in wei.
     */
    function setPrice(uint256 price) external onlyOwner {
        cowPrice = price;
        emit PriceUpdated(price);
    }

    /**
     * @dev Checks if the contract has sufficient balance in the Capital Wallet.
     */
    function checkCapitalBalance() internal view returns (bool) {
        return address(this).balance >= cowPrice;
    }

    /**
     * @dev Fetches the current cow price using a Chainlink Oracle.
     */
    function fetchCowPrice() external onlyOwner {
        // Initialize Chainlink Functions request
        FunctionsRequest.Request memory request;
        request.initializeRequestForInlineJavaScript(s_mintSourceCode);

        // Send request to Chainlink Oracle
        _sendRequest(request.encodeCBOR(), i_subscriptionId, GAS_LIMIT, DON_ID);
    }

    /**
     * @dev Transfers funds from the Capital Wallet to the Cow Purchase Wallet.
     * @param amount Amount to transfer.
     */
    function transferFundsToCowPurchaseWallet(uint256 amount) internal {
        require(address(this).balance >= amount, "Insufficient balance in Capital Wallet.");
        payable(cowPurchaseWallet).transfer(amount);
        emit FundsTransferred(capitalWallet, cowPurchaseWallet, amount);
    }

    /**
     * @dev Sends a request to mint a CowNFT.
     * @param tokenURI Metadata URI for the cow.
     * @param amountOfTokensToMint Amount of tokens equivalent to cow price.
     */
    function sendRequestToMintCow(string memory tokenURI, uint256 amountOfTokensToMint)
        external
        onlyOwner
        returns (bytes32)
    {
        require(amountOfTokensToMint >= cowPrice, "Insufficient payment for minting.");
        require(checkCapitalBalance(), "Insufficient balance in Capital Wallet.");

        // Transfer funds to Cow Purchase Wallet before minting
        transferFundsToCowPurchaseWallet(cowPrice);

        // Initialize Chainlink Functions request
        FunctionsRequest.Request memory request;
        request.initializeRequestForInlineJavaScript(s_mintSourceCode);

        bytes32 requestId = _sendRequest(request.encodeCBOR(), i_subscriptionId, GAS_LIMIT, DON_ID);

        // Store request details
        s_requestIdToCowRequest[requestId] = CowRequest({
            amountOfTokensToMint: amountOfTokensToMint,
            owner: msg.sender,
            tokenURI: tokenURI,
            action: MintOrRedeem.Mint
        });

        return requestId;
    }

    /**
     * @dev Chainlink callback to handle fulfilled mint requests.
     */
    function fulfillRequest(bytes32 requestId, bytes memory response)
        internal
        override
        recordChainlinkFulfillment(requestId)
    {
        CowRequest memory cowRequest = s_requestIdToCowRequest[requestId];

        if (cowRequest.action == MintOrRedeem.Mint) {
            _mintCow(cowRequest.owner, cowRequest.tokenURI);
        } else {
            // Handle redeem logic (optional)
        }

        delete s_requestIdToCowRequest[requestId];
    }

    /**
     * @dev Internal function to mint a CowNFT.
     * @param to Address of the recipient.
     * @param tokenURI Metadata URI of the NFT.
     */
    function _mintCow(address to, string memory tokenURI) internal {
        uint256 tokenId = nextTokenId;

        // Mint the NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit CowMinted(to, tokenId, tokenURI);

        nextTokenId++;
    }

    /**
     * @dev Updates the portfolio value manually (simulation for this prototype).
     * @param newPortfolioValue New value of the portfolio.
     */
    function updatePortfolioValue(uint256 newPortfolioValue) external onlyOwner {
        portfolioValue = newPortfolioValue;
    }

    // Fallback function to receive Ether
    receive() external payable {}
}
