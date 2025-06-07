// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HorseFactory is ERC1155, Ownable {
    uint256 public nextHorseId;
    address public platform;
    mapping(uint256 => uint256) public totalShares;
    mapping(uint256 => uint256) public sharePrice;

    constructor(string memory uri) ERC1155(uri) {
        platform = msg.sender;
    }

    function createHorse(
        uint256 total,
        uint256 pricePerShare
    ) external {
        uint256 horseId = nextHorseId++;
        uint256 platformCut = (total * 10) / 100;
        uint256 ownerCut = total - platformCut;

        _mint(msg.sender, horseId, ownerCut, "");
        _mint(platform, horseId, platformCut, "");

        totalShares[horseId] = total;
        sharePrice[horseId] = pricePerShare;
    }

    function uri(uint256 id) public view override returns (string memory) {
        return super.uri(id);
    }
}
