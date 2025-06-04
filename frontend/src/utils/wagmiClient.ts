// File: frontend/src/utils/wagmiClient.ts

import { configureChains, createClient } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { goerli } from "wagmi/chains"; // replace with sepolia or localhost if needed

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [goerli],
  [publicProvider()]
);

export const wagmiClient = createClient({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});
