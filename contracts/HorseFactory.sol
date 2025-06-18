// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Variable Asset Lifecycle:
// 1. Creator calls createHorse to mint initial supply.
// 2. Shares are freely transferable between wallets.
// 3. No burning occurs; ownership persists.

/// @title HorseFactory
/// @notice Mints tradable fractional shares representing variable assets.
/// Each share can be transferred freely after purchase.
contract HorseFactory is ERC1155, Ownable {
    uint256 public nextHorseId;
    address public platform;

    mapping(uint256 => uint256) public totalShares;
    mapping(uint256 => uint256) public sharePrice;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC1155("") Ownable(msg.sender) {
        platform = msg.sender;
    }

    /// @notice Create a new variable asset
    /// @dev Mints shares to creator and platform. Requires positive supply and price.
    function createHorse(
        uint256 total,
        uint256 pricePerShare,
        string memory ipfsURI
    ) external {
        require(total > 0, "total must be > 0");
        require(pricePerShare > 0, "price must be > 0");
        uint256 horseId = nextHorseId++;
        uint256 platformCut = (total * 10) / 100;
        uint256 ownerCut = total - platformCut;

        // initial distribution between creator and platform
        _mint(msg.sender, horseId, ownerCut, "");
        _mint(platform, horseId, platformCut, "");

        totalShares[horseId] = total;
        sharePrice[horseId] = pricePerShare;
        _tokenURIs[horseId] = ipfsURI;
    }

    function uri(uint256 id) public view override returns (string memory) {
        return _tokenURIs[id];
    }
}
