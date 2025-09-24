"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSolBalance = getSolBalance;
const web3_js_1 = require("@solana/web3.js");
const config_1 = require("../utils/config");
const connection = new web3_js_1.Connection(config_1.SOLANA_RPC_URL, "confirmed");
async function getSolBalance(address) {
    try {
        const pubkey = new web3_js_1.PublicKey(address);
        const balanceLamports = await connection.getBalance(pubkey);
        const balanceSol = balanceLamports / web3_js_1.LAMPORTS_PER_SOL;
        return balanceSol.toFixed(4);
    }
    catch (err) {
        throw new Error("Invalid Solana address.");
    }
}
