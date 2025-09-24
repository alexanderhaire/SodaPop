// Place this content into: ~/SodaPop/contracts/HorseToken.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HorseToken is ERC1155, Ownable {
    uint256 public totalSupply;
    uint256 public nextHorseId;
    mapping(uint256 => uint256) public horseSupply;
    mapping(uint256 => uint256) public maxSupply;

    struct HorseOffering {
        uint256 sharePrice;
        uint256 totalShares;
    }

    struct HorseProfile {
        string name;
        string trackLocation;
        string streamUrl;
        string legalContractURI;
        string metadataURI;
        address horseOwner;
        bool verified;
    }

    mapping(uint256 => HorseOffering) private offerings;
    mapping(uint256 => HorseProfile) private horseProfiles;
    mapping(uint256 => string) private tokenURIs;

    event HorseOfferingCreated(uint256 indexed tokenId, uint256 sharePrice, uint256 totalShares);
    event HorseProfileRegistered(
        uint256 indexed tokenId,
        address indexed owner,
        string streamUrl,
        string legalContractURI
    );
    event HorseProfileUpdated(
        uint256 indexed tokenId,
        address indexed owner,
        string streamUrl,
        string legalContractURI
    );

    constructor(
        string memory uri,
        uint256[] memory horseIds,
        uint256[] memory horseCaps
    ) ERC1155(uri) Ownable(msg.sender) {
        require(horseIds.length == horseCaps.length, "Mismatched array lengths");
        uint256 highestId = 0;
        for (uint256 i = 0; i < horseIds.length; i++) {
            uint256 id = horseIds[i];
            uint256 cap = horseCaps[i];
            maxSupply[id] = cap;
            uint256 companyStake = (cap * 10) / 100;
            _mint(msg.sender, id, companyStake, "");
            horseSupply[id] = companyStake;
            totalSupply += companyStake;
            if (id > highestId) {
                highestId = id;
            }
        }
        nextHorseId = highestId + 1;
    }

    function mint(address to, uint256 id, uint256 amount) public {
        uint256 cap = maxSupply[id];
        if (cap > 0) {
            require(horseSupply[id] + amount <= cap, "Exceeds max supply");
        }
        _mint(to, id, amount, "");
        totalSupply += amount;
        horseSupply[id] += amount;
    }

    function uri(uint256 _id) public view override returns (string memory) {
        string memory directURI = tokenURIs[_id];
        if (bytes(directURI).length > 0) {
            return directURI;
        }
        return super.uri(_id);
    }

    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }

    function createHorse(
        string calldata name,
        string calldata trackLocation,
        string calldata streamUrl,
        string calldata legalContractURI,
        string calldata metadataURI,
        uint256 sharePrice,
        uint256 totalShares
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(streamUrl).length > 0, "Stream URL required");
        require(bytes(legalContractURI).length > 0, "Legal contract required");
        require(totalShares > 0, "Total shares required");
        require(sharePrice > 0, "Share price required");

        uint256 tokenId = nextHorseId++;
        maxSupply[tokenId] = totalShares;

        uint256 platformCut = (totalShares * 10) / 100;
        uint256 ownerCut = (totalShares * 10) / 100;
        uint256 mintedAmount = platformCut + ownerCut;
        require(mintedAmount <= totalShares, "Invalid supply allocation");

        if (ownerCut > 0) {
            _mint(msg.sender, tokenId, ownerCut, "");
        }

        if (platformCut > 0) {
            _mint(owner(), tokenId, platformCut, "");
        }

        horseSupply[tokenId] = mintedAmount;
        totalSupply += mintedAmount;

        offerings[tokenId] = HorseOffering({sharePrice: sharePrice, totalShares: totalShares});

        horseProfiles[tokenId] = HorseProfile({
            name: name,
            trackLocation: trackLocation,
            streamUrl: streamUrl,
            legalContractURI: legalContractURI,
            metadataURI: metadataURI,
            horseOwner: msg.sender,
            verified: true
        });

        if (bytes(metadataURI).length > 0) {
            tokenURIs[tokenId] = metadataURI;
        }

        emit HorseOfferingCreated(tokenId, sharePrice, totalShares);
        emit HorseProfileRegistered(tokenId, msg.sender, streamUrl, legalContractURI);

        return tokenId;
    }

    function createHorseOffering(
        uint256 tokenId,
        uint256 sharePrice,
        uint256 totalShares
    ) external onlyOwner {
        require(offerings[tokenId].totalShares == 0, "Horse already exists");
        maxSupply[tokenId] = totalShares;
        uint256 companyStake = (totalShares * 10) / 100;
        _mint(msg.sender, tokenId, companyStake, "");
        horseSupply[tokenId] = companyStake;
        totalSupply += companyStake;
        offerings[tokenId] = HorseOffering({sharePrice: sharePrice, totalShares: totalShares});
        emit HorseOfferingCreated(tokenId, sharePrice, totalShares);
    }

    function updateHorseDetails(
        uint256 tokenId,
        string calldata streamUrl,
        string calldata legalContractURI
    ) external {
        HorseProfile storage profile = horseProfiles[tokenId];
        require(profile.horseOwner == msg.sender, "Not horse owner");
        require(bytes(streamUrl).length > 0, "Stream URL required");
        require(bytes(legalContractURI).length > 0, "Legal contract required");

        profile.streamUrl = streamUrl;
        profile.legalContractURI = legalContractURI;
        profile.verified = true;

        emit HorseProfileUpdated(tokenId, msg.sender, streamUrl, legalContractURI);
    }

    function getHorseOffering(uint256 tokenId) external view returns (uint256, uint256) {
        HorseOffering memory o = offerings[tokenId];
        return (o.sharePrice, o.totalShares);
    }

    function getHorseProfile(uint256 tokenId)
        external
        view
        returns (
            string memory name,
            string memory trackLocation,
            string memory streamUrl,
            string memory legalContractURI,
            string memory metadataURI,
            address horseOwner,
            bool verified
        )
    {
        HorseProfile memory profile = horseProfiles[tokenId];
        return (
            profile.name,
            profile.trackLocation,
            profile.streamUrl,
            profile.legalContractURI,
            profile.metadataURI,
            profile.horseOwner,
            profile.verified
        );
    }

    function verifyHorseOwnership(
        address claimant,
        uint256 tokenId,
        string calldata legalContractURI
    ) external view returns (bool) {
        HorseProfile memory profile = horseProfiles[tokenId];
        if (!profile.verified) {
            return false;
        }
        if (profile.horseOwner != claimant) {
            return false;
        }
        if (
            keccak256(bytes(profile.legalContractURI)) != keccak256(bytes(legalContractURI))
        ) {
            return false;
        }
        return balanceOf(claimant, tokenId) > 0;
    }
}
