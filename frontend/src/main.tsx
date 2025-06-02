import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import { getToken } from "./utils/authToken";

import {
  WagmiConfig,
  createConfig,
  configureChains,
  optimismSepolia,
} from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";

import { ChakraProvider } from "@chakra-ui/react";

const { chains, publicClient } = configureChains(
  [optimismSepolia],
  [
    alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_API_KEY || "" }),
    publicProvider(),
  ]
);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({
      chains,
      options: { shimDisconnect: true },
    }),
  ],
  publicClient,
});

const Root: React.FC = () => {
  const token = getToken();
  const path = window.location.pathname;

  if (!token && path !== "/login" && path !== "/register") {
    window.history.replaceState({}, "", "/login");
  } else if (token && (path === "/login" || path === "/register")) {
    window.history.replaceState({}, "", "/app");
  }

  return (
    <WagmiConfig config={wagmiConfig}>
      <ChakraProvider>
        {window.location.pathname === "/login" ? (
          <Login />
        ) : window.location.pathname === "/register" ? (
          <Register />
        ) : (
          <App />
        )}
      </ChakraProvider>
    </WagmiConfig>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
