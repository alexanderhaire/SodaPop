// scripts/check_uri.js

const HorseToken = artifacts.require("HorseToken");

module.exports = async function (callback) {
  const contract = await HorseToken.deployed();
  const tokenId = 1;

  const tokenURI = await contract.uri(tokenId);
  console.log(`🧾 URI for Horse ID ${tokenId}:`, tokenURI);

  callback();
};
