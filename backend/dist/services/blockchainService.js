"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnection = getConnection;
exports.getSolBalance = getSolBalance;
const web3_js_1 = require("@solana/web3.js");
const config_1 = require("../utils/config");
function getConnection() {
    return new web3_js_1.Connection(config_1.SOLANA_RPC_URL, "confirmed");
}
async function getSolBalance(address) {
    try {
        const connection = getConnection();
        const pubkey = new web3_js_1.PublicKey(address);
        const lamports = await connection.getBalance(pubkey);
        return (lamports / web3_js_1.LAMPORTS_PER_SOL).toFixed(4);
    }
    catch (err) {
        throw new Error("Unable to fetch SOL balance");
    }
}
