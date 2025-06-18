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
import MyItems from "./pages/MyItems";
import BoughtItems from "./pages/BoughtItems";
import SoldItems from "./pages/SoldItems";
import MyBoughtItems from "./pages/MyBoughtItems";
import MySoldItems from "./pages/MySoldItems";

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
      <Box as="header" px={4} py={2} bg="#d9d9d9" color="#000" boxShadow="md">
        <HStack justify="space-between">
          <Heading size="md" cursor="pointer" onClick={() => navigate("/")}> 
            Grey MarketPlace
          </Heading>

          <Button
            variant="grey"
            onClick={() => navigate("/")}
            size="sm"
          >
            Items
          </Button>

          <Button
            variant="grey"
            onClick={() => navigate("/my-items")}
            size="sm"
          >
            My Items
          </Button>

          <Button
            variant="grey"
            onClick={() => navigate("/bought")}
            size="sm"
          >
            My Bought Items
          </Button>

          <Button
            variant="grey"
            onClick={() => navigate("/sold")}
            size="sm"
          >
            My Sold Items
          </Button>

          <Button
            variant="grey"
            onClick={() => navigate("/analytics")}
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
                <Button size="sm" variant="grey" onClick={() => disconnect()}>
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
                  variant="grey"
                >
                  Connect Wallet
                </Button>
              ))
            )}
            <Button size="sm" variant="grey" onClick={handleLogout}>
              Logout
            </Button>
          </HStack>
        </HStack>
      </Box>

      <Routes>
        <Route path="/" element={<ItemList />} />
        <Route path="/create" element={<CreateItem />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/my-items" element={<MyItems />} />
        <Route path="/bought" element={<BoughtItems />} />
        <Route path="/sold" element={<SoldItems />} />
        <Route path="/my-bought-items" element={<MyBoughtItems />} />
        <Route path="/my-sold-items" element={<MySoldItems />} />
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
