import { Link } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
// File: frontend/src/App.tsx
import CreateItem from "./pages/CreateItem";

import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  HStack,
  Button,
  Text,
} from "@chakra-ui/react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { clearToken } from "./utils/authToken";
import { formatAddress } from "./utils/formatAddress";
import ItemList from "./pages/ItemList";
import ItemDetail from "./pages/ItemDetail";
import Chatbot from "./pages/Chatbot";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

const App: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isLoading: connectLoading } = useConnect();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <Box>
      <Box
        as="header"
        px={4}
        py={2}
        bgGradient="linear(to-r, purple.500, pink.400)"
        color="white"
        boxShadow="md"
      >
        <HStack justify="space-between">
          <Heading size="md" cursor="pointer" onClick={() => navigate("/")}> 
            Grey MarketPlace
          </Heading>

          <Button
            variant="ghost"
            color="white"
            onClick={() => navigate("/")}
            _hover={{ bg: "whiteAlpha.300" }}
            size="sm"
          >
            Items
          </Button>

          <Button
            variant="ghost"
            color="white"
            onClick={() => navigate("/analytics")}
            _hover={{ bg: "whiteAlpha.300" }}
            size="sm"
          >
            Analytics
          </Button>

          <HStack spacing={3}>
            {isConnected && address ? (
              <>
                <Text fontSize="sm" color="gray.600">
                  Connected: {formatAddress(address)}
                </Text>
                <Button
                  size="sm"
                  colorScheme="whiteAlpha"
                  variant="outline"
                  onClick={() => disconnect()}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              connectors.map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  isLoading={
                    connectLoading && connector.id === connectors?.[0]?.id
                  }
                  size="sm"
                  colorScheme="whiteAlpha"
                  variant="outline"
                >
                  Connect Wallet
                </Button>
              ))
            )}
            <Button
              size="sm"
              colorScheme="whiteAlpha"
              variant="outline"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </HStack>
        </HStack>
      </Box>

      <Routes>
        <Route path="/" element={<ItemList />} />
        <Route path="/create" element={<CreateItem />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
      </Routes>

      <Box position="fixed" bottom={4} right={4} zIndex={10}>
        <React.Suspense fallback={null}>
          <Chatbot />
        </React.Suspense>
      </Box>
    </Box>
  );
};

export default App;
