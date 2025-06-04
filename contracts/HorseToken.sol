// Place this content into: ~/SodaPop/contracts/HorseToken.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HorseToken is ERC1155, Ownable {
    uint256 public totalSupply;
    mapping(uint256 => uint256) public horseSupply;

    constructor(string memory uri) ERC1155(uri) Ownable(msg.sender) {
        totalSupply = 0;
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
}
