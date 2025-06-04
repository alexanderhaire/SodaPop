// truffle-config.js
module.exports = {
    networks: {
      development: {
        host: "127.0.0.1",
        port: 8545,
        network_id: "*", // Accept any network ID (Ganache sometimes uses a large random one)
      },
    },
    compilers: {
      solc: {
        version: "0.8.21", // or whatever version your contract uses
      },
    },
  };
  