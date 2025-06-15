const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
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
    optimism_sepolia: {
      provider: () =>
        new HDWalletProvider(
          process.env.DEPLOYER_PRIVATE_KEY,
          process.env.ALCHEMY_API_URL
        ),
      network_id: 11155420,
      gas: 8000000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
  compilers: {
    solc: {
      version: "0.8.21",
    },
  },
};
