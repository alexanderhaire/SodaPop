import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Spinner,
  VStack,
  Heading,
  Badge,
  Progress,
  HStack,
} from "@chakra-ui/react";
import axios from "../utils/axiosConfig";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface DashboardProps {
  userAddress?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userAddress }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userAddress) return;

    const fetchEarnings = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/earnings/${userAddress}`);
        setItems(res.data);
      } catch (err) {
        setError("Unable to load earnings.");
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [userAddress]);

  return (
    <Box>
      <Heading size="lg" mb={2}>
        Portfolio telemetry
      </Heading>
      <Text color="whiteAlpha.700" mb={6} fontSize="sm">
        Live insight into performance, ownership and targets for every champion
        you steward.
      </Text>
      {!userAddress ? (
        <Text color="whiteAlpha.600">Connect your wallet to unlock your command deck.</Text>
      ) : loading ? (
        <Spinner />
      ) : error ? (
        <Text color="red.400">{error}</Text>
      ) : (
        <VStack spacing={5} align="stretch">
          {items.map((item, idx) => (
            <Link key={item.id} to={`/items/${item.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Box
                  p={5}
                  borderRadius="2xl"
                  bg="rgba(12, 18, 38, 0.9)"
                  border="1px solid rgba(114, 140, 255, 0.2)"
                  boxShadow="0 22px 58px rgba(4, 9, 26, 0.7)"
                  cursor="pointer"
                  transition="border-color 0.2s ease"
                  _hover={{ borderColor: "rgba(165, 196, 255, 0.4)" }}
                >
                  <HStack justify="space-between" align="flex-start" mb={2}>
                    <Heading size="md">{item.name}</Heading>
                    <Badge colorScheme="cyan" borderRadius="full">
                      Goal: ${item.goal}
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
                    Target completion {item.progress_to_goal.toFixed(0)}%
                  </Text>
                </Box>
              </motion.div>
            </Link>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default Dashboard;
