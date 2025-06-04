// src/components/Dashboard.tsx

import React, { useEffect, useState } from "react";
import { Box, Text, Spinner, VStack } from "@chakra-ui/react";
import axios from "../utils/axiosConfig";

interface DashboardProps {
  userAddress?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userAddress }) => {
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userAddress) {
      setEthBalance(null);
      return;
    }

    const fetchBalance = async () => {
      setLoading(true);
      setError("");
      try {
        // axiosConfig already has baseURL="http://localhost:4000/api"
        const res = await axios.get(`/portfolio/${userAddress}`);
        setEthBalance(res.data.ethBalance);
      } catch {
        setError("Failed to load balance.");
        setEthBalance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [userAddress]);

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={2}>
        Portfolio
      </Text>
      {!userAddress ? (
        <Text color="gray.500">Connect your wallet to view portfolio.</Text>
      ) : loading ? (
        <Spinner />
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <VStack align="start" spacing={1}>
          <Text>
            ETH Balance: {ethBalance !== null ? `${ethBalance} Ξ` : "N/A"}
          </Text>
        </VStack>
      )}
    </Box>
  );
};

export default Dashboard;
