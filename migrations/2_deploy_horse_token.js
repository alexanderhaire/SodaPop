const HorseToken = artifacts.require("HorseToken");

module.exports = async function (deployer, network, accounts) {
  const baseUri = "https://example.com/metadata/{id}.json";
  const horseIds = [0]; // You can add more IDs if needed
  const horseCaps = [10000]; // Total supply cap for each horse

  await deployer.deploy(HorseToken, baseUri, horseIds, horseCaps);
};
