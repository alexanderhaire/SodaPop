"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProviderAndSigner = getProviderAndSigner;
exports.getEthBalance = getEthBalance;
const ethers_1 = require("ethers");
const config_1 = require("../utils/config");
/**
 * Returns:
 *  - provider: a JsonRpcProvider connected to Alchemy (read-only)
 *  - signer: a Wallet signer (if PRIVATE_KEY is set) for on-chain transactions
 */
function getProviderAndSigner() {
    if (!config_1.ALCHEMY_API_URL) {
        throw new Error("ALCHEMY_API_URL is not defined in .env");
    }
    const provider = new ethers_1.ethers.JsonRpcProvider(config_1.ALCHEMY_API_URL);
    let signer;
    if (config_1.PRIVATE_KEY) {
        signer = new ethers_1.ethers.Wallet(config_1.PRIVATE_KEY, provider);
    }
    return { provider, signer };
}
/**
 * Given a wallet address, fetch ETH balance (in wei).
 */
async function getEthBalance(address) {
    const { provider } = getProviderAndSigner();
    const balanceBigNumber = await provider.getBalance(address);
    // Return as decimal string in ether
    return ethers_1.ethers.formatEther(balanceBigNumber);
}
