// scripts/update_uri.js

const HorseToken = artifacts.require("HorseToken");

module.exports = async function (callback) {
  try {
    const token = await HorseToken.deployed();

    const newURI = "http://127.0.0.1:8080/{id}.json";
    await token.setURI(newURI);

    const testId = 1;
    const updatedURI = await token.uri(testId);
    console.log(`✅ URI successfully updated to: ${updatedURI}`);
  } catch (err) {
    console.error("❌ Error updating URI:", err);
  }

  callback();
};
