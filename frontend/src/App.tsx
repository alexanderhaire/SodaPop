import DashboardPage from "./pages/DashboardPage";
import CreateItemForm from "./pages/CreateItemForm";

import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  HStack,
  Button,
  Text,
  useToast,
  Flex,
  Spacer,
  Badge,
  Stack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import {
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletReadyState,
  WalletName,
} from "@solana/wallet-adapter-base";
import { clearToken } from "./utils/authToken";
import { formatAddress } from "./utils/formatAddress";
import ItemList from "./pages/ItemList";
import Welcome from "./pages/Welcome";
import ItemDetail from "./pages/ItemDetail";
import Chatbot from "./pages/Chatbot";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import MyItems from "./pages/MyItems";
import BoughtItems from "./pages/BoughtItems";
import SoldItems from "./pages/SoldItems";
import MyBoughtItems from "./pages/MyBoughtItems";
import MySoldItems from "./pages/MySoldItems";

const App: React.FC = () => {
  const {
    publicKey,
    connected,
    connecting,
    wallets,
    select,
    connect,
    disconnect,
  } = useWallet();
  const navigate = useNavigate();
  const toast = useToast();
  const [pendingWallet, setPendingWallet] = useState<WalletName<string> | null>(
    null
  );

  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const availableWallets = useMemo(
    () =>
      wallets.filter((wallet) =>
        [WalletReadyState.Installed, WalletReadyState.Loadable].includes(
          wallet.readyState
        )
      ),
    [wallets]
  );

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  const navigation = [
    { label: "Spotlight", action: () => navigate("/items") },
    { label: "Launch Forge", action: () => navigate("/create") },
    { label: "Portfolio", action: () => navigate("/my-items") },
    { label: "Telemetry", action: () => navigate("/analytics") },
  ];

  const handleWalletConnect = async (
    walletName: WalletName<string>
  ) => {
    try {
      setPendingWallet(walletName);
      await select(walletName);
      await connect();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to connect to wallet";
      toast({
        title: "Wallet connection failed",
        description: message,
        status: "error",
      });
    }
    setPendingWallet(null);
  };

  return (
    <Box minH="100vh" pb={24}>
      <Box
        as="header"
        px={{ base: 4, md: 10 }}
        py={4}
        position="sticky"
        top={0}
        zIndex={20}
        bg="rgba(5, 7, 20, 0.85)"
        backdropFilter="blur(16px)"
        borderBottom="1px solid rgba(148, 163, 255, 0.12)"
      >
        <Flex align="center" gap={{ base: 4, md: 8 }}>
          <HStack spacing={3} cursor="pointer" onClick={() => navigate("/")}>
            <Badge
              colorScheme="purple"
              variant="solid"
              borderRadius="full"
              px={3}
              py={1}
              textTransform="none"
            >
              LIVE
            </Badge>
            <Heading size={{ base: "sm", md: "md" }} fontWeight="extrabold">
              SodaPop Ascension Hub
            </Heading>
          </HStack>

          <HStack
            spacing={2}
            display={{ base: "none", md: "flex" }}
            fontSize="sm"
            color="whiteAlpha.700"
          >
            {navigation.map((item) => (
              <Button
                key={item.label}
                variant="grey"
                size="sm"
                onClick={item.action}
              >
                {item.label}
              </Button>
            ))}
          </HStack>

          <Spacer />

          <Stack direction={{ base: "column", sm: "row" }} spacing={3} align="center">
            {connected && address ? (
              <HStack spacing={3}>
                <Text fontSize="sm" color="whiteAlpha.700">
                  {formatAddress(address)}
                </Text>
                <Button size="sm" variant="grey" onClick={() => disconnect()}>
                  Disconnect
                </Button>
              </HStack>
            ) : (
              availableWallets.length > 0 ? (
                availableWallets.map(({ adapter }) => (
                  <Button
                    key={adapter.name}
                    onClick={() => handleWalletConnect(adapter.name)}
                    isLoading={
                      (connecting || pendingWallet === adapter.name) &&
                      pendingWallet === adapter.name
                    }
                    size="sm"
                    variant="cta"
                  >
                    Connect {adapter.name}
                  </Button>
                ))
              ) : (
                <Button
                  size="sm"
                  variant="cta"
                  onClick={() =>
                    toast({
                      title: "No Solana wallets detected",
                      description:
                        "Install Phantom, Backpack, Solflare, or another Solana wallet extension.",
                      status: "info",
                    })
                  }
                >
                  Install a Solana wallet
                </Button>
              )
            )}
            <Button size="sm" variant="grey" onClick={handleLogout}>
              Logout
            </Button>
          </Stack>
        </Flex>
      </Box>

      <Box px={{ base: 4, md: 10 }} pt={{ base: 6, md: 12 }}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/items" element={<ItemList />} />
          <Route path="/create" element={<CreateItemForm />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-items" element={<MyItems />} />
          <Route path="/bought" element={<BoughtItems />} />
          <Route path="/sold" element={<SoldItems />} />
          <Route path="/my-bought-items" element={<MyBoughtItems />} />
          <Route path="/my-sold-items" element={<MySoldItems />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
        </Routes>
      </Box>

      <Box position="fixed" bottom={4} right={4} zIndex={10}>
        <React.Suspense fallback={null}>
          <Chatbot />
        </React.Suspense>
      </Box>
    </Box>
  );
};

export default App;
