import type { Abi, Log } from "viem";
import { decodeEventLog } from "viem";

export const tokenFactoryAbi = [
  {
    type: "function",
    name: "createToken",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "initialSupply", type: "uint256" }
    ],
    outputs: [{ name: "token", type: "address" }]
  },
  {
    type: "event",
    name: "TokenCreated",
    inputs: [
      { name: "token", type: "address", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "supply", type: "uint256" }
    ],
    anonymous: false
  }
] as const satisfies Abi;

export interface TokenCreatedEventArgs {
  token: `0x${string}`;
  owner: `0x${string}`;
  name: string;
  symbol: string;
  supply: bigint;
}

export const getTokenFactoryAddress = (): `0x${string}` => {
  const raw =
    import.meta.env.VITE_TOKEN_FACTORY_ADDRESS?.trim() ||
    import.meta.env.VITE_HORSE_FACTORY_ADDRESS?.trim();

  if (!raw) {
    throw new Error("Token factory address is not configured");
  }

  if (!raw.startsWith("0x")) {
    throw new Error("Token factory address must be a hex string");
  }

  return raw as `0x${string}`;
};

export const tryDecodeTokenCreatedLog = (log: Log): TokenCreatedEventArgs | null => {
  if (!log.topics || log.topics.length === 0) {
    return null;
  }
  try {
    const decoded = decodeEventLog({
      abi: tokenFactoryAbi,
      data: log.data,
      topics: log.topics,
    });

    if (decoded.eventName !== "TokenCreated") {
      return null;
    }

    const args = decoded.args as unknown as TokenCreatedEventArgs;
    return args;
  } catch (err) {
    return null;
  }
};
