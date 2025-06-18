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
            data.map(async (horse: any, idx: number) => {
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
      <Box p={6} maxW="800px" mx="auto" bg="whiteAlpha.800" borderRadius="lg" boxShadow="lg">
        <Heading size="lg" mb={4} color="#000">
          Your Horse Share Analytics
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
              >
                <Heading size="md">{horse.name}</Heading>
                <Text>
                  My Ownership: <Badge>{horse.my_share}%</Badge>
                </Text>
                <Text>Total Earnings: ${horse.total_earned}</Text>
                <Progress
                  value={horse.progress_to_goal}
                  size="sm"
                  mt={2}
                />
                <Text fontSize="sm" color="gray.600">Goal: ${horse.goal}</Text>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    );
  };
  
  export default AnalyticsDashboard;
  