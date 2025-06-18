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
import { fetchEarningsStats, ItemStats } from "../utils/earningsService";
  
  const AnalyticsDashboard: React.FC = () => {
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const [items, setItems] = useState<ItemStats[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Placeholder for variable pricing assets.
    const [variableAssets, setVariableAssets] = useState<any[]>([]);
  
    useEffect(() => {
      const fetchAnalytics = async () => {
        if (!address || !walletClient) return;
        setLoading(true);
        setError("");
  
        try {
          const chainId = walletClient?.chain?.id ?? 11155420;
          const updated = await fetchEarningsStats(address, chainId);
          setItems(updated);
          setVariableAssets(updated);
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
