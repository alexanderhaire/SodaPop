import { ethers } from "ethers";
import { ALCHEMY_API_URL, PRIVATE_KEY } from "../utils/config";

/**
 * Returns:
 *  - provider: a JsonRpcProvider connected to Alchemy (read-only)
 *  - signer: a Wallet signer (if PRIVATE_KEY is set) for on-chain transactions
 */
export function getProviderAndSigner(): {
  provider: ethers.JsonRpcProvider;
  signer?: ethers.Wallet;
} {
  if (!ALCHEMY_API_URL) {
    throw new Error("ALCHEMY_API_URL is not defined in .env");
  }

  const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);

  let signer: ethers.Wallet | undefined;
  if (PRIVATE_KEY) {
    signer = new ethers.Wallet(PRIVATE_KEY, provider);
  }

  return { provider, signer };
}

/**
 * Given a wallet address, fetch ETH balance (in wei).
 */
export async function getEthBalance(address: string): Promise<string> {
  const { provider } = getProviderAndSigner();
  const balanceBigNumber = await provider.getBalance(address);
  // Return as decimal string in ether
  return ethers.formatEther(balanceBigNumber);
}
