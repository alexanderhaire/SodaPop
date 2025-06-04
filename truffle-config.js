// truffle-config.js
const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

module.exports = {
  networks: {
    "op-sepolia": {
      provider: () =>
        new HDWalletProvider(
          process.env.DEPLOYER_PRIVATE_KEY,
          "https://sepolia.optimism.io"
        ),
      network_id: 11155420,
      gas: 8000000,
      skipDryRun: true,
    },
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Accept any network ID
    },
  },
  compilers: {
    solc: {
      version: "0.8.21", // Match your contract version
    },
  },
};
