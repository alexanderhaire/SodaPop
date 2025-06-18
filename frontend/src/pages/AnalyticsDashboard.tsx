import {
    Box,
    Heading,
    Text,
    VStack,
    Badge,
    Progress,
    Spinner,
  } from "@chakra-ui/react";
  import { useEffect, useState, useRef } from "react";
  import { useAccount, useWalletClient } from "wagmi";
import { readContracts } from "@wagmi/core";
  import { HORSE_TOKEN_ADDRESS, horseTokenABI } from "../utils/contractConfig";
  
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
  
    const cacheRef = useRef<{ ts: number; data: ItemStats[] } | null>(null);

    useEffect(() => {
      const fetchAnalytics = async () => {
        if (!address || !walletClient) return;

        if (cacheRef.current && Date.now() - cacheRef.current.ts < 60000) {
          setItems(cacheRef.current.data);
          setVariableAssets(cacheRef.current.data);
          return;
        }

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
          const data = await res.json();
  
          // Optional: Fetch on-chain balances
          const chainId = walletClient?.chain?.id;
          if (!chainId) throw new Error("Missing chainId");

          const balanceCalls = data.map((_item: any, idx: number) => ({
            address: HORSE_TOKEN_ADDRESS,
            abi: horseTokenABI,
            functionName: "balanceOf",
            args: [address, idx],
            chainId,
          }));

          const results = await readContracts({ contracts: balanceCalls });

          const updated = data.map((item: any, idx: number) => ({
            ...item,
            my_share: Number(results[idx].result || 0),
          }));

          setItems(updated);
          setVariableAssets(updated);
          cacheRef.current = { ts: Date.now(), data: updated };
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
          {error && <Text color="red.500">{error}</Text>}
          {loading ? (
            <Spinner />
          ) : variableAssets.length === 0 ? (
            <Text>No share data available. Create a variable asset to get started.</Text>
          ) : (
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
          )}
        </Box>
      </>
    );
};

export default AnalyticsDashboard;
