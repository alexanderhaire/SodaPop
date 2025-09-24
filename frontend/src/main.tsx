// File: frontend/src/main.tsx

import React, { PropsWithChildren, useEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Buffer } from "buffer";
import process from "process";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import {
  WalletAdapterNetwork,
  type Adapter,
} from "@solana/wallet-adapter-base";
import { useStandardWalletAdapters } from "@solana/wallet-standard-wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import App from "./App";
import theme from "./theme";
import "./index.css";
import "@solana/wallet-adapter-react-ui/styles.css";

const queryClient = new QueryClient();

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

  const baseAdapters = useMemo(() => [new PhantomWalletAdapter()], []);
  const standardAwareAdapters = useStandardWalletAdapters(baseAdapters);
  const missingAdapterWarningLogged = useRef(false);

  const wallets = useMemo(() => {
    const sanitized = standardAwareAdapters.filter((adapter): adapter is Adapter => {
      if (!adapter) {
        return false;
      }

      return (
        typeof adapter.name === "string" &&
        typeof adapter.readyState !== "undefined"
      );
    });

    if (sanitized.length !== standardAwareAdapters.length && !missingAdapterWarningLogged.current) {
      console.debug(
        "[wallets] Filtered %d unsupported wallet adapters from Wallet Standard detection results.",
        standardAwareAdapters.length - sanitized.length
      );
      missingAdapterWarningLogged.current = true;
    }

    return sanitized;
  }, [standardAwareAdapters]);

  useEffect(() => {
    if (wallets.length === 0 && !missingAdapterWarningLogged.current) {
      console.debug(
        "[wallets] No compatible adapters detected yet; continuing with base adapter fallback."
      );
      missingAdapterWarningLogged.current = true;
    }
  }, [wallets]);

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
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ChakraProvider>
    </SolanaProviders>
  </React.StrictMode>
);
