// scripts/mint_horse_token.js

const HorseToken = artifacts.require("HorseToken");

module.exports = async function (callback) {
  try {
    const accounts = await web3.eth.getAccounts();
    const horseToken = await HorseToken.deployed();

    const to = accounts[0]; // mint to deployer
    const horseId = 1;
    const quantity = 5;
    const data = web3.utils.asciiToHex("Minted via Truffle script 🐎");

    await horseToken.mint(to, horseId, quantity, data, { from: to });

    const balance = await horseToken.balanceOf(to, horseId);
    console.log(`🐴 Minted ${quantity} of Horse ID ${horseId} to ${to}. Balance now: ${balance}`);
    callback();
  } catch (err) {
    console.error("❌ Error minting horse tokens:", err);
    callback(err);
  }
};
