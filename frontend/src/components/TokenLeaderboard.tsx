import React, { useEffect, useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Text } from "@chakra-ui/react";
import axios from "../utils/axiosConfig";

interface LeaderboardEntry {
  address: string;
  shares: number;
}

interface TokenLeaderboardProps {
  tokenId: string | number;
}

const TokenLeaderboard: React.FC<TokenLeaderboardProps> = ({ tokenId }) => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tokenId && tokenId !== 0) return;
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/leaderboard/${tokenId}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load leaderboard", err);
        setError("Unable to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tokenId]);

  if (loading) return <Text>Loading leaderboard...</Text>;
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box mt={4} overflowX="auto">
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Address</Th>
            <Th isNumeric>Shares</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((entry, idx) => (
            <Tr key={entry.address}>
              <Td>
                {idx === 0 && "🥇 "}
                {entry.address}
              </Td>
              <Td isNumeric>{entry.shares}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default TokenLeaderboard;
