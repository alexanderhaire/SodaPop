const HorseFactory = artifacts.require("HorseFactory");

module.exports = async function (callback) {
  try {
    const instance = await HorseFactory.at("0xaCC9a224F2607559E124FD37EA9E2973302033Eb");
    const platformAddress = await instance.platform();
    console.log("✅ Platform address:", platformAddress);
  } catch (err) {
    console.error("❌ Error reading platform address:", err);
  }

  callback();
};
