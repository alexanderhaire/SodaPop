import { Link } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
// File: frontend/src/App.tsx
import CreateHorse from "./pages/CreateHorse";

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
import HorseList from "./pages/HorseList";
import HorseDetail from "./pages/HorseDetail";
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
        borderBottom="1px"
        borderColor="gray.200"
        bg="white"
      >
        <HStack justify="space-between">
          <Heading size="md" cursor="pointer" onClick={() => navigate("/")}>
            SodaPop DeFi Assistant
          </Heading>

          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            _hover={{ bg: "gray.100" }}
            size="sm"
          >
            Horses
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate("/analytics")}
            _hover={{ bg: "gray.100" }}
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
                <Button size="sm" onClick={() => disconnect()}>
                  Disconnect Wallet
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
                >
                  Connect Wallet
                </Button>
              ))
            )}
            <Button size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </HStack>
        </HStack>
      </Box>

      <Routes>
        <Route path="/" element={<HorseList />} />
        <Route path="/create" element={<CreateHorse />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/horses/:id" element={<HorseDetail />} />
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
