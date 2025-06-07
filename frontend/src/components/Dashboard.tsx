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
  const [horses, setHorses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userAddress) return;

    const fetchEarnings = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/earnings/${userAddress}`);
        setHorses(res.data);
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
        My Racehorse Earnings
      </Heading>
      {!userAddress ? (
        <Text color="gray.500">Connect your wallet to view portfolio.</Text>
      ) : loading ? (
        <Spinner />
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {horses.map((horse) => (
            <React.Fragment key={horse.id}>
              <Link to={`/horses/${horse.id}`}>
                <Box
                  borderWidth="1px"
                  borderRadius="lg"
                  p={4}
                  boxShadow="lg"
                  _hover={{ bg: "gray.50", cursor: "pointer" }}
                >
                  <Heading size="md">{horse.name}</Heading>
                  <Text>
                    My Ownership:{" "}
                    <Badge colorScheme="green">{horse.my_share}%</Badge>
                  </Text>
                  <Text>Total Earnings: ${horse.total_earned}</Text>
                  <Progress
                    value={horse.progress_to_goal}
                    size="sm"
                    mt={2}
                    colorScheme="blue"
                  />
                  <Text fontSize="sm" color="gray.600">
                    Goal: ${horse.goal}
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
