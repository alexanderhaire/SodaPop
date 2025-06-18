// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title FixedItem
/// @notice Represents consumable assets that are burned upon redemption.
/// @dev Token lifecycle: Mint -> Transfer to buyer -> Burn on redeem
contract FixedItem is ERC721Burnable, Ownable {
    /// @dev tokenId counter
    uint256 private _nextId;
    /// @dev tracks whether a token has been redeemed
    mapping(uint256 => bool) public redeemed;

    constructor() ERC721("FixedItem", "FIXED") {}

    /// @notice Mint a new fixed item to `to`
    function mint(address to) external onlyOwner returns (uint256) {
        uint256 id = _nextId++;
        _mint(to, id);
        return id;
    }

    /// @notice Redeem a token and burn it
    function redeem(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(!redeemed[tokenId], "Already redeemed");
        redeemed[tokenId] = true;
        _burn(tokenId);
    }

    /// @dev Prevent transfers after redemption
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override
    {
        require(!redeemed[tokenId], "Token redeemed");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
