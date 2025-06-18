import {
  Box,
  Heading,
  Text,
  VStack,
  Badge,
  Progress,
  Spinner,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { readContract } from "@wagmi/core";
import { HORSE_TOKEN_ADDRESS, horseTokenABI } from "../utils/contractConfig";

interface HorseStats {
  id: string;
  name: string;
  goal: number;
  my_share: number;
  total_earned: number;
  progress_to_goal: number;
}

const AnalyticsDashboard: React.FC = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [horses, setHorses] = useState<HorseStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const variableAssets = [
    {
      name: "SodaPop (Horse)",
      history: [12, 12.5, 13, 13.5, 14],
      shares: 40,
    },
    {
      name: "Beachfront Bungalow (Real Estate)",
      history: [4.5, 4.6, 4.8, 5.0, 5.2],
      shares: 30,
    },
    {
      name: "Abstract Waves (Art)",
      history: [1.2, 1.3, 1.35, 1.4, 1.5],
      shares: 30,
    },
  ];

  const dates = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"];

  const lineData = dates.map((d, idx) => ({
    name: d,
    ...variableAssets.reduce((acc, asset) => {
      acc[asset.name] = asset.history[idx];
      return acc;
    }, {} as Record<string, number>),
  }));

  const barData = variableAssets.map((asset) => ({
    name: asset.name,
    price: asset.history[asset.history.length - 1],
  }));

  const pieData = variableAssets.map((asset) => ({
    name: asset.name,
    value: asset.shares,
  }));

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!address || !walletClient) return;
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/earnings/${address}`);
        const data = await res.json();

        const updated = await Promise.all(
          data.map(async (horse: any, idx: number) => {
            const chainId = walletClient?.chain?.id;
            if (!chainId) throw new Error("Missing chainId");

            const raw = await readContract({
              address: HORSE_TOKEN_ADDRESS,
              abi: horseTokenABI,
              functionName: "balanceOf",
              chainId,
              args: [address, idx],
            });

            return {
              ...horse,
              my_share: Number(raw),
            };
          })
        );

        setHorses(updated);
      } catch (err) {
        console.error("❌ Failed to load earnings:", err);
        setError("Failed to load earnings.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [address, walletClient]);

  return (
    <Box p={6} maxW="1200px" mx="auto" bg="#f8f8f8" borderRadius="lg" boxShadow="lg">
      <Heading size="lg" mb={4} color="#000">
        Your Item Share Analytics
      </Heading>
      {loading ? (
        <Spinner />
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {horses.map((horse) => (
            <Box
              key={horse.id}
              borderWidth="1px"
              borderRadius="lg"
              p={4}
              boxShadow="lg"
              bg="white"
            >
              <Heading size="md">{horse.name}</Heading>
              <Text>
                My Ownership: <Badge>{horse.my_share}%</Badge>
              </Text>
              <Text>Total Earnings: ${horse.total_earned}</Text>
              <Progress value={horse.progress_to_goal} size="sm" mt={2} />
              <Text fontSize="sm" color="gray.600">Goal: ${horse.goal}</Text>
            </Box>
          ))}
        </VStack>
      )}

      <Box mt={10}>
        <Heading size="lg" mb={4} color="#000">
          Variable Asset Analytics
        </Heading>
        {variableAssets.length === 0 ? (
          <Text>No share data available. Create a variable asset to get started.</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            <Box bg="white" p={4} boxShadow="md" borderRadius="md">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="name" stroke="#000" />
                  <YAxis stroke="#000" />
                  <Tooltip />
                  <Legend />
                  {variableAssets.map((asset, idx) => (
                    <Line key={asset.name} type="monotone" dataKey={asset.name} stroke={idx % 2 ? '#555' : '#000'} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Box>

            <Box bg="white" p={4} boxShadow="md" borderRadius="md">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="name" stroke="#000" />
                  <YAxis stroke="#000" />
                  <Tooltip />
                  <Bar dataKey="price" fill="#555" />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box bg="white" p={4} boxShadow="md" borderRadius="md">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie dataKey="value" data={pieData} outerRadius={100} fill="#888" label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 ? '#555' : '#000'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsDashboard;
