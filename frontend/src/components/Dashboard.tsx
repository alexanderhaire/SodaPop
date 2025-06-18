import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Spinner,
  VStack,
  Heading,
  Badge,
  Progress,
} from "@chakra-ui/react";
import axios from "../utils/axiosConfig";
import { Link } from "react-router-dom";

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
      <Heading size="lg" mb={4}>
        My Item Earnings
      </Heading>
      {!userAddress ? (
        <Text color="gray.500">Connect your wallet to view portfolio.</Text>
      ) : loading ? (
        <Spinner />
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {items.map((item) => (
            <React.Fragment key={item.id}>
              <Link to={`/items/${item.id}`}>
                <Box
                  borderWidth="1px"
                  borderRadius="lg"
                  p={4}
                  boxShadow="lg"
                  _hover={{ bg: "gray.50", cursor: "pointer" }}
                >
                  <Heading size="md">{item.name}</Heading>
                  <Text>
                    My Ownership:{" "}
                    <Badge colorScheme="green">{item.my_share}%</Badge>
                  </Text>
                  <Text>Total Earnings: ${item.total_earned}</Text>
                  <Progress
                    value={item.progress_to_goal}
                    size="sm"
                    mt={2}
                    colorScheme="blue"
                  />
                  <Text fontSize="sm" color="gray.600">
                    Goal: ${item.goal}
                </Text>
              </Box>
              </Link>
            </React.Fragment>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default Dashboard;
