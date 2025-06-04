import { parseEther } from "viem";

export const HORSE_TOKEN_ADDRESS = "0x1E26422DB4813572159ebCF36a8b2AF5Eea9CA33";

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
