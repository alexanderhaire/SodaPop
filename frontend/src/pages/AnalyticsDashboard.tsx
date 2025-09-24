import {
  Box,
  Heading,
  Text,
  VStack,
  Badge,
  Progress,
  Spinner,
  HStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import assetsData from "../mocks/assets.json";

  interface ItemStats {
    id: string;
    name: string;
    goal: number;
    my_share: number;
    total_earned: number;
    progress_to_goal: number;
  }

const AnalyticsDashboard: React.FC = () => {
  const { publicKey } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);
  const [items, setItems] = useState<ItemStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [variableAssets, setVariableAssets] = useState<any[]>([]);
  const [chartData, setChartData] = useState<
    { name: string; earnings: number; share: number; goal: number }[]
  >([]);
  const COLORS = ["#60a5fa", "#34d399", "#f472b6", "#fcd34d", "#c084fc"];

  useEffect(() => {
    const populateFromMock = async () => {
      if (!address) {
        setItems([]);
        setVariableAssets([]);
        setChartData([]);
        return;
      }
      setLoading(true);
      setError("");

      try {
        const positions = (assetsData as any[])
          .map((asset, idx) => {
            const owned = asset.buyers[address] ?? 0;
            if (!owned) return null;
            const earnings = owned * asset.sharePrice * 4.2;
            const progress = Math.min(
              100,
              Math.round((owned / asset.totalShares) * 100)
            );
            return {
              id: asset.id,
              name: asset.name,
              goal: asset.totalShares,
              my_share: owned,
              total_earned: Number(earnings.toFixed(3)),
              progress_to_goal: progress,
            } as ItemStats;
          })
          .filter(Boolean) as ItemStats[];

        setItems(positions);
        setVariableAssets(positions);
        setChartData(
          positions.map((position) => ({
            name: position.name,
            earnings: position.total_earned,
            share: position.my_share,
            goal: position.goal,
          }))
        );
      } catch (err) {
        console.error("Failed to assemble analytics:", err);
        setError("Failed to assemble analytics.");
      } finally {
        setLoading(false);
      }
    };

    void populateFromMock();
  }, [address]);

  return (
    <Box
      p={{ base: 6, md: 10 }}
      maxW="1200px"
      mx="auto"
      bg="rgba(9, 14, 30, 0.82)"
      borderRadius="3xl"
      border="1px solid rgba(148, 163, 255, 0.22)"
      boxShadow="0 28px 70px rgba(4, 9, 24, 0.75)"
    >
      <Heading size="lg" mb={2}>
        Performance command center
      </Heading>
      <Text color="whiteAlpha.700" mb={6} fontSize="sm">
        Monitor portfolio velocity, distribution, and earnings signals for every
        asset under your watch.
      </Text>
      {error && (
        <Text color="red.400" mb={4}>
          {error}
        </Text>
      )}
      {variableAssets.length === 0 ? (
        <Text color="whiteAlpha.600">
          No telemetry yet. Launch a variable asset to populate live analytics.
        </Text>
      ) : (
        <>
          <Box mb={10}>
            <Heading size="md" mb={3}>
              Portfolio overview
            </Heading>
            <Box
              display="grid"
              gridTemplateColumns={{ base: "1fr", lg: "1fr 1fr" }}
              gap={6}
            >
              <Box
                bg="rgba(12, 18, 38, 0.9)"
                borderRadius="2xl"
                border="1px solid rgba(114, 140, 255, 0.2)"
                p={4}
                minH="300px"
              >
                {loading ? (
                  <Spinner />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#cbd5f5" tick={{ fill: "#cbd5f5" }} />
                      <YAxis stroke="#cbd5f5" tick={{ fill: "#cbd5f5" }} />
                      <Tooltip />
                      <Bar dataKey="earnings" fill="#60a5fa" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
              <Box
                bg="rgba(12, 18, 38, 0.9)"
                borderRadius="2xl"
                border="1px solid rgba(114, 140, 255, 0.2)"
                p={4}
                minH="300px"
              >
                {loading ? (
                  <Spinner />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} dataKey="share" nameKey="name" outerRadius={110} label>
                        {chartData.map((_, idx) => (
                          <Cell key={`c-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Box>
          </Box>
          <VStack spacing={5} align="stretch">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Box
                  p={5}
                  borderRadius="2xl"
                  bg="rgba(12, 18, 38, 0.9)"
                  border="1px solid rgba(114, 140, 255, 0.2)"
                  boxShadow="0 20px 55px rgba(4, 9, 26, 0.65)"
                >
                  <HStack justify="space-between" mb={2} align="baseline">
                    <Heading size="md">{item.name}</Heading>
                    <Badge colorScheme="cyan" borderRadius="full">
                      Goal ${item.goal}
                    </Badge>
                  </HStack>
                  <Text color="whiteAlpha.700" fontSize="sm" mb={2}>
                    Ownership share
                    <Badge ml={2} colorScheme="green" borderRadius="full">
                      {item.my_share}%
                    </Badge>
                  </Text>
                  <Text color="whiteAlpha.800" fontWeight="semibold">
                    Earnings to date: ${item.total_earned}
                  </Text>
                  <Progress
                    value={item.progress_to_goal}
                    size="sm"
                    mt={3}
                    borderRadius="full"
                    colorScheme="cyan"
                    bg="rgba(255, 255, 255, 0.08)"
                  />
                  <Text fontSize="xs" color="whiteAlpha.600" mt={2}>
                    Trajectory {item.progress_to_goal.toFixed(0)}% complete
                  </Text>
                </Box>
              </motion.div>
            ))}
          </VStack>
        </>
      )}
    </Box>
  );
};

export default AnalyticsDashboard;
