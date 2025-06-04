import React from "react";
import {
  Box,
  Heading,
  Image,
  Text,
  VStack,
  HStack,
  Spinner,
  Divider,
} from "@chakra-ui/react";
import { useAccount, useWalletClient } from "wagmi";
import { readContract } from "@wagmi/core";
import { HORSE_TOKEN_ADDRESS, horseTokenABI } from "../utils/contractConfig";
import horses from "../mocks/horses.json";

interface HorseBalance {
  id: string;
  name: string;
  balance: number;
}

const AnalyticsDashboard: React.FC = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [balances, setBalances] = React.useState<HorseBalance[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchAllBalances = async () => {
      if (!address || !walletClient) return;
      setLoading(true);

      try {
        const results = await Promise.all(
          horses.map(async (horse, idx) => {
            const raw = await readContract({
              address: HORSE_TOKEN_ADDRESS,
              abi: horseTokenABI,
              functionName: "balanceOf",
              args: [address, idx],
            });
            return {
              id: horse.id,
              name: horse.name,
              balance: Number(raw),
            };
          })
        );

        setBalances(results);
      } catch (err) {
        console.error("Failed to fetch balances:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBalances();
  }, [address, walletClient]);

  if (!address) {
    return (
      <Box p={6} textAlign="center">
        <Heading>Please connect your wallet to see analytics</Heading>
      </Box>
    );
  }

  return (
    <Box p={6} maxW="800px" mx="auto">
      <Heading mb={4}>Your Horse Share Analytics</Heading>
      <Divider mb={6} />

      {loading ? (
        <Spinner size="lg" />
      ) : (
        <VStack spacing={6} align="stretch">
          {balances.map((hb) => (
            <HStack
              key={hb.id}
              p={4}
              borderWidth={1}
              borderRadius="md"
              align="center"
            >
              <Image
                src={`/images/${hb.id}.png`}
                alt={hb.name}
                boxSize="80px"
                borderRadius="md"
              />
              <VStack align="start" spacing={1} flex="1">
                <Text fontWeight="bold">{hb.name}</Text>
                <Text color="gray.600">
                  You own {hb.balance} share{hb.balance === 1 ? "" : "s"}
                </Text>
              </VStack>
            </HStack>
          ))}
          {balances.every((hb) => hb.balance === 0) && (
            <Text color="gray.500" textAlign="center">
              You don’t own any shares yet.
            </Text>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default AnalyticsDashboard;
