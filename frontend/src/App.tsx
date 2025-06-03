import React from "react";
import {
  ChakraProvider,
  Grid,
  GridItem,
  Box,
  Heading,
  HStack,
  Button,
  Text,
} from "@chakra-ui/react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useNavigate } from "react-router-dom";
import { clearToken } from "./utils/authToken";
import { formatAddress } from "./utils/formatAddress";

import ChatWindow from "./components/ChatWindow";
import Dashboard from "./components/Dashboard";

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
    <ChakraProvider>
      <Box
        as="header"
        px={4}
        py={2}
        borderBottom="1px"
        borderColor="gray.200"
        bg="white"
      >
        <HStack justify="space-between">
          <Heading size="md">SodaPop DeFi Assistant</Heading>
          <HStack spacing={3}>
            {isConnected && address ? (
              <>
                <Text fontSize="sm" color="gray.600">
                  Connected: {formatAddress(address)}
                </Text>
                <Button size="sm" onClick={() => disconnect()}>
                  Disconnect
                </Button>
              </>
            ) : (
              connectors.map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  isLoading={connectLoading && connector.id === connectors[0]?.id}
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
      <Grid templateColumns="1fr 1fr" height="calc(100vh - 56px)">
        <GridItem
          colSpan={1}
          borderRight="1px"
          borderColor="gray.200"
          p={4}
          display="flex"
          flexDirection="column"
        >
          <Heading size="md" mb={4}>
            ChatGPT – SodaPop
          </Heading>
          <ChatWindow />
        </GridItem>
        <GridItem colSpan={1} p={4}>
          <Dashboard userAddress={address} />
        </GridItem>
      </Grid>
    </ChakraProvider>
  );
};

export default App;
