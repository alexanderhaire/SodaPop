import React, { useEffect, useState } from "react";
import { Box, Heading, Text, VStack, HStack, Badge, Spinner } from "@chakra-ui/react";
import { formatAddress } from "../utils/formatAddress";

interface LeaderboardEntry {
  address: string;
  totalShares: number;
  uniqueAssets: number;
  topHolding: { tokenId: string; amount: number };
}

const Leaderboard: React.FC = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/leaderboard");
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load leaderboard", err);
        setError("Unable to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box p={6} maxW="600px" mx="auto" bg="whiteAlpha.800" borderRadius="lg" boxShadow="lg">
      <Heading size="lg" mb={4} color="purple.600">
        Share Ownership Leaderboard
      </Heading>
      {loading ? (
        <Spinner />
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <VStack spacing={3} align="stretch">
          {data.map((entry, idx) => (
            <HStack
              key={entry.address}
              p={3}
              borderWidth={1}
              borderRadius="md"
              justify="space-between"
              bg={idx % 2 === 0 ? "#fff" : "#f8f8f8"}
            >
              <HStack spacing={3}>
                <Text fontWeight="bold">
                  {idx === 0 ? "🥇" : idx + 1}
                </Text>
                <Text>{formatAddress(entry.address)}</Text>
              </HStack>
              <HStack spacing={4} fontSize="sm">
                <Text>Total Shares: {entry.totalShares}</Text>
                <Text>Unique Assets: {entry.uniqueAssets}</Text>
                <Text>
                  Top: <Badge colorScheme="green">{entry.topHolding.amount} of #{entry.topHolding.tokenId}</Badge>
                </Text>
              </HStack>
            </HStack>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default Leaderboard;
