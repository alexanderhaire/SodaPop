// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev Factory contract for variable assets represented by ERC-1155 tokens.
 *      Each token ID corresponds to a fractionalized asset where `totalShares`
 *      and `sharePrice` define its metadata. These tokens are transferable and
 *      persist after initial sale unlike fixed assets minted via ERC-721 which
 *      are burned once redeemed.
 */
contract HorseFactory is ERC1155, Ownable {
    uint256 public nextHorseId;
    address public platform;

    mapping(uint256 => uint256) public totalShares;
    mapping(uint256 => uint256) public sharePrice;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC1155("") Ownable(msg.sender) {
        platform = msg.sender;
    }

    /**
     * @notice Create a new variable asset.
     * @dev Mints ERC-1155 tokens representing fractional ownership.
     * @param total The total number of fractional shares.
     * @param pricePerShare Price per share denominated by the creator.
     * @param ipfsURI Metadata URI describing the asset.
     */
    function createHorse(
        uint256 total,
        uint256 pricePerShare,
        string memory ipfsURI
    ) external {
        uint256 horseId = nextHorseId++;
        uint256 platformCut = (total * 10) / 100;
        uint256 ownerCut = total - platformCut;

        _mint(msg.sender, horseId, ownerCut, "");
        _mint(platform, horseId, platformCut, "");

        totalShares[horseId] = total;
        sharePrice[horseId] = pricePerShare;
        _tokenURIs[horseId] = ipfsURI;
    }

    function uri(uint256 id) public view override returns (string memory) {
        return _tokenURIs[id];
    }

    // Variable asset tokens persist and remain transferable after minting.
}
