import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { SOLANA_RPC_URL } from "../utils/config";

export function getConnection(): Connection {
  return new Connection(SOLANA_RPC_URL, "confirmed");
}

export async function getSolBalance(address: string): Promise<string> {
  try {
    const connection = getConnection();
    const pubkey = new PublicKey(address);
    const lamports = await connection.getBalance(pubkey);
    return (lamports / LAMPORTS_PER_SOL).toFixed(4);
  } catch (err) {
    throw new Error("Unable to fetch SOL balance");
  }
}
