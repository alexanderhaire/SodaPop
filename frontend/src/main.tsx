// File: frontend/src/main.tsx

import React, { PropsWithChildren, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { Buffer } from "buffer";
import process from "process";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import App from "./App";
import theme from "./theme";
import "./index.css";
import "@solana/wallet-adapter-react-ui/styles.css";

// Ensure Buffer/process globals exist for Solana libraries when bundled with Vite
if (typeof window !== "undefined") {
  const w = window as unknown as Record<string, unknown>;
  if (!w.Buffer) {
    w.Buffer = Buffer;
  }
  if (!w.process) {
    w.process = process;
  }
}

const SolanaProviders: React.FC<PropsWithChildren> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => {
    return (
      import.meta.env.VITE_SOLANA_RPC_URL ||
      clusterApiUrl(network)
    );
  }, [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: "confirmed" }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <SolanaProviders>
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ChakraProvider>
    </SolanaProviders>
  </React.StrictMode>
);
