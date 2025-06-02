import { ethers } from "ethers";
import { ALCHEMY_API_URL } from "../utils/config";

const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);

export async function getEthBalance(address: string): Promise<string> {
  if (!ethers.isAddress(address)) {
    throw new Error("Invalid Ethereum address.");
  }
  const balanceWei = await provider.getBalance(address);
  const balanceEth = ethers.formatEther(balanceWei);
  return balanceEth;
}
