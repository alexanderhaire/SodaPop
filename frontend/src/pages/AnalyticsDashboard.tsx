import {
    Box,
    Heading,
    Text,
    VStack,
    Badge,
    Progress,
    Spinner,
  } from "@chakra-ui/react";
  import { useEffect, useState } from "react";
  import { useAccount, useWalletClient } from "wagmi";
  import { readContract } from "@wagmi/core";
  import { HORSE_TOKEN_ADDRESS, horseTokenABI } from "../utils/contractConfig";
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
  
  interface ItemStats {
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
    const [items, setItems] = useState<ItemStats[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Placeholder for variable pricing assets.
  const [variableAssets, setVariableAssets] = useState<any[]>([]);
  const [chartData, setChartData] = useState<
    { name: string; earnings: number; share: number; goal: number }[]
  >([]);
  const COLORS = ["#805AD5", "#38B2AC", "#ED8936", "#718096", "#e53e3e"];
  
    useEffect(() => {
      const fetchAnalytics = async () => {
        if (!address || !walletClient) return;
        setLoading(true);
        setError("");
  
        try {
          const url = `/api/earnings/${address}`;
          const res = await fetch(url);
          if (!res.ok) {
            const text = await res.text();
            console.error(`Unexpected response for ${url}:`, res.status, text);
            throw new Error(`Invalid response ${res.status}`);
          }
          const ct = res.headers.get("content-type") || "";
          let data: any;
          if (ct.includes("application/json")) {
            data = await res.json();
          } else {
            const text = await res.text();
            throw new Error(`Expected JSON but received: ${text.slice(0, 100)}`);
          }
  
          // Optional: Fetch on-chain balances
          const updated = await Promise.all(
            data.map(async (item: any, idx: number) => {
  if (!walletClient?.chain?.id) throw new Error("Missing chainId in walletClient");
  const chainId = walletClient?.chain?.id;
  if (!chainId) throw new Error("Missing chainId");
              const raw = await readContract(undefined as any, {
                address: HORSE_TOKEN_ADDRESS,
                abi: horseTokenABI,
                functionName: "balanceOf",
                args: [address, idx],
                chainId,
              });
  
              return {
                ...item,
                my_share: Number(raw),
              };
            })
          );

          setItems(updated);
          setVariableAssets(updated);
          setChartData(
            updated.map((i) => ({
              name: i.name,
              earnings: i.total_earned,
              share: i.my_share,
              goal: i.goal,
            }))
          );
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
      <>
        <Box p={6} maxW="800px" mx="auto" bg="whiteAlpha.800" borderRadius="lg" boxShadow="lg">
          <Heading size="lg" mb={4} color="purple.600">
            Your Item Share Analytics
          </Heading>
          {variableAssets.length === 0 ? (
            <Text>No share data available. Create a variable asset to get started.</Text>
          ) : (
            <>
              <Box mb={6}>
                <Heading size="md" mb={2}>Portfolio Overview</Heading>
                <Box h="300px">
                  {loading ? (
                    <Spinner />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="earnings" fill="#805AD5" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
                <Box h="300px" mt={4}>
                  {loading ? (
                    <Spinner />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} dataKey="share" nameKey="name" outerRadius={100} label>
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
              <VStack spacing={4} align="stretch">
              {items.map((item) => (
                <Box
                  key={item.id}
                  borderWidth="1px"
                  borderRadius="lg"
                  p={4}
                  boxShadow="lg"
                >
                  <Heading size="md">{item.name}</Heading>
                  <Text>
                    My Ownership: <Badge colorScheme="green">{item.my_share}%</Badge>
                  </Text>
                  <Text>Total Earnings: ${item.total_earned}</Text>
                  <Progress
                    value={item.progress_to_goal}
                    size="sm"
                    mt={2}
                    colorScheme="blue"
                  />
                  <Text fontSize="sm" color="gray.600">Goal: ${item.goal}</Text>
                </Box>
              ))}
            </VStack>
            </>
          )}
        </Box>
      </>
    );
};

export default AnalyticsDashboard;
