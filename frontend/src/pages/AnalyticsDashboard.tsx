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
  
    useEffect(() => {
      const fetchAnalytics = async () => {
        if (!address || !walletClient) return;
        setLoading(true);
        setError("");
  
        try {
          const res = await fetch(`/api/earnings/${address}`);
          const data = await res.json();
  
          // Optional: Fetch on-chain balances
          const updated = await Promise.all(
            data.map(async (item: any, idx: number) => {
  if (!walletClient?.chain?.id) throw new Error("Missing chainId in walletClient");
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
                ...item,
                my_share: Number(raw),
              };
            })
          );

          setItems(updated);
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
      <Box p={6} maxW="800px" mx="auto" bg="whiteAlpha.800" borderRadius="lg" boxShadow="lg">
        <Heading size="lg" mb={4} color="purple.600">
          Your Item Share Analytics
        </Heading>
        {variableAssets.length === 0 ? (
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
    </Box>
  );
};

export default AnalyticsDashboard;
