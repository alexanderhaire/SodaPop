// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FixedAssetToken
 * @dev ERC-721 token representing fixed assets that are consumed or redeemed.
 *      Tokens can be burned once the underlying asset has been used.
 *      This contrasts with variable assets minted via ERC-1155 which remain
 *      tradeable after purchase.
 */
contract FixedAssetToken is ERC721Burnable, Ownable {
    uint256 public nextId;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("FixedAsset", "FIXED") Ownable(msg.sender) {}

    /**
     * @dev Mint a new fixed asset token to `to` with the given metadata URI.
     *      Returns the new tokenId. The token is burnable by its owner.
     */
    function mintFixed(address to, string memory tokenURI) external onlyOwner returns (uint256) {
        uint256 id = nextId++;
        _safeMint(to, id);
        _tokenURIs[id] = tokenURI;
        return id;
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        return _tokenURIs[id];
    }
}
