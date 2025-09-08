// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Receipt NFT Studio — minimal ERC721 with per-token tokenURI.
 * Only the contract owner can mint. Transfers are standard ERC721.
 */
contract ReceiptNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    event ReceiptMinted(
        address indexed to,
        uint256 indexed tokenId,
        string tokenURI,
        string itemsHash // optional; pass "" if unused
    );

    // Fixed name/symbol as requested
    constructor() ERC721("Receipt NFT Studio", "RCT") Ownable(msg.sender) {}

    function _mintCore(
        address to,
        string memory uri,
        string memory itemsHash
    ) internal returns (uint256 tokenId) {
        unchecked { tokenId = ++_nextTokenId; }
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);          // store ipfs://<CID>
        emit ReceiptMinted(to, tokenId, uri, itemsHash);
    }

    // Preferred API for your dapp
    function mintReceipt(address to, string calldata uri)
        external onlyOwner returns (uint256)
    { return _mintCore(to, uri, ""); }

    // Same but includes your basket/items hash in the event
    function mintReceiptWithHash(address to, string calldata uri, string calldata itemsHash)
        external onlyOwner returns (uint256)
    { return _mintCore(to, uri, itemsHash); }

    // Frontend compatibility shims (your UI tries mint/mintNFT)
    function mint(address to, string calldata uri)
        external onlyOwner returns (uint256)
    { return _mintCore(to, uri, ""); }

    function mintNFT(address to, string calldata uri)
        external onlyOwner returns (uint256)
    { return _mintCore(to, uri, ""); }
}
