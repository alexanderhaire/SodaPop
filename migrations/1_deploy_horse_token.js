const HorseToken = artifacts.require("HorseToken");

module.exports = function (deployer) {
  const uri = "https://example.com/horse/{id}.json";
  const horseIds = [0];
  const horseCaps = [10000];

  deployer.deploy(HorseToken, uri, horseIds, horseCaps);
};
