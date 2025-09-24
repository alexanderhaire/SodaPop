import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { SOLANA_RPC_URL } from "../utils/config";

const connection = new Connection(SOLANA_RPC_URL, "confirmed");

export async function getSolBalance(address: string): Promise<string> {
  try {
    const pubkey = new PublicKey(address);
    const balanceLamports = await connection.getBalance(pubkey);
    const balanceSol = balanceLamports / LAMPORTS_PER_SOL;
    return balanceSol.toFixed(4);
  } catch (err) {
    throw new Error("Invalid Solana address.");
  }
}
