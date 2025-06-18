// File: frontend/src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";
import {
  WagmiConfig,
  createConfig,
  configureChains,
  Chain,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import App from "./App";
import "./index.css";

// Define Optimism Sepolia chain
const optimismSepolia: Chain = {
  id: 11155420,
  name: "Optimism Sepolia",
  nativeCurrency: {
    name: "Sepolia ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.optimism.io"],
    },
    public: {
      http: ["https://sepolia.optimism.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://sepolia-optimism.etherscan.io",
    },
  },
  testnet: true,
};

// Configure chains and provider
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [optimismSepolia],
  [publicProvider()]
);

// Create the Wagmi client
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({
      chains,
      options: {
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ChakraProvider>
    </WagmiConfig>
  </React.StrictMode>
);
