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
  },
  {
    type: "function",
    name: "maxSupply",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "horseSupply",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "createHorseOffering",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "sharePrice", type: "uint256" },
      { name: "totalShares", type: "uint256" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "getHorseOffering",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "", type: "uint256" },
      { name: "", type: "uint256" }
    ]
  }
];

// Fixed asset (ERC-721 burnable) configuration
export const FIXED_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";

export const fixedTokenABI = [
  {
    type: "function",
    name: "mintFixed",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenURI", type: "string" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "burn",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: []
  }
];
