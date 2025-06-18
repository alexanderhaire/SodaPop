// Place this content into: ~/SodaPop/contracts/HorseToken.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HorseToken is ERC1155, Ownable {
    uint256 public totalSupply;
    mapping(uint256 => uint256) public horseSupply;
    mapping(uint256 => uint256) public maxSupply;

    struct HorseOffering {
        uint256 sharePrice;
        uint256 totalShares;
    }

    mapping(uint256 => HorseOffering) private offerings;

    event HorseOfferingCreated(uint256 indexed tokenId, uint256 sharePrice, uint256 totalShares);

constructor(
    string memory uri,
    uint256[] memory horseIds,
    uint256[] memory horseCaps
) ERC1155(uri) Ownable(msg.sender) {
    require(horseIds.length == horseCaps.length, "Mismatched array lengths");
    for (uint256 i = 0; i < horseIds.length; i++) {
        uint256 id = horseIds[i];
        uint256 cap = horseCaps[i];
        maxSupply[id] = cap;
        uint256 companyStake = (cap * 10) / 100;
        _mint(msg.sender, id, companyStake, "");
        horseSupply[id] = companyStake;
        totalSupply += companyStake;
    }
}

    function mint(address to, uint256 id, uint256 amount) public {
        _mint(to, id, amount, "");
        totalSupply += amount;
        horseSupply[id] += amount;
    }

    function uri(uint256 _id) public view override returns (string memory) {
        return super.uri(_id);
    }

    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }

    function createHorseOffering(uint256 tokenId, uint256 sharePrice, uint256 totalShares) external onlyOwner {
        require(offerings[tokenId].totalShares == 0, "Horse already exists");
        maxSupply[tokenId] = totalShares;
        uint256 companyStake = (totalShares * 10) / 100;
        _mint(msg.sender, tokenId, companyStake, "");
        horseSupply[tokenId] = companyStake;
        totalSupply += companyStake;
        offerings[tokenId] = HorseOffering({sharePrice: sharePrice, totalShares: totalShares});
        emit HorseOfferingCreated(tokenId, sharePrice, totalShares);
    }

    function getHorseOffering(uint256 tokenId) external view returns (uint256, uint256) {
        HorseOffering memory o = offerings[tokenId];
        return (o.sharePrice, o.totalShares);
    }
}
