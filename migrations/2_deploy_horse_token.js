const HorseToken = artifacts.require("HorseToken");

module.exports = function (deployer, network, accounts) {
  const initialURI = "https://your-domain.com/metadata/{id}.json";
  deployer.deploy(HorseToken, initialURI, { from: accounts[0] });
};
