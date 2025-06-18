import React, { useEffect, useState } from "react";
import { Box, Heading, VStack, Text } from "@chakra-ui/react";
import api from "../utils/api";

interface LeaderboardEntry {
  address: string;
  totalShares: number;
  uniqueAssets: number;
  topHolding: string;
}

const Leaderboard: React.FC = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<LeaderboardEntry[]>("/leaderboard");
        setData(res.data);
      } catch (err) {
        console.error("Failed to load leaderboard", err);
        setError("Failed to load leaderboard");
      }
    };
    load();
  }, []);

  return (
    <Box p={6} maxW="600px" mx="auto" bg="whiteAlpha.800" borderRadius="lg" boxShadow="lg">
      <Heading size="lg" mb={4} color="purple.600">
        Share Ownership Leaderboard
      </Heading>
      {error && <Text color="red.500">{error}</Text>}
      <VStack align="stretch" spacing={3}>
        {data.map((entry, idx) => (
          <Box key={entry.address} p={3} borderBottom="1px solid #e2e8f0">
            <Text fontWeight="bold">
              {idx === 0 ? "🥇 " : ""}
              {idx + 1}. {entry.address}
            </Text>
            <Text>{entry.totalShares} shares across {entry.uniqueAssets} assets</Text>
            <Text fontSize="sm" color="gray.500">Top Holding: {entry.topHolding}</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default Leaderboard;
