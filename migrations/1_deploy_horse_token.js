const HorseToken = artifacts.require("HorseToken");

module.exports = function (deployer) {
  deployer.deploy(HorseToken, "https://api.sodapop.io/metadata/{id}.json");
};