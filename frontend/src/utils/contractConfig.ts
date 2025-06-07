import { parseEther } from "viem";

export const HORSE_TOKEN_ADDRESS = "0xaCC9a224F2607559E124FD37EA9E2973302033Eb";

export const horseTokenABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" }
    ],
    outputs: [
      { name: "", type: "uint256" }
    ]
  },
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "id", type: "uint256" },
      { name: "amount", type: "uint256" }
    ],
    outputs: []
  }
];
