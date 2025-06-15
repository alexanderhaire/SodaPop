"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEthBalance = getEthBalance;
const ethers_1 = require("ethers");
const config_1 = require("../utils/config");
const provider = new ethers_1.ethers.JsonRpcProvider(config_1.ALCHEMY_API_URL);
async function getEthBalance(address) {
    if (!ethers_1.ethers.isAddress(address)) {
        throw new Error("Invalid Ethereum address.");
    }
    const balanceWei = await provider.getBalance(address);
    const balanceEth = ethers_1.ethers.formatEther(balanceWei);
    return balanceEth;
}
