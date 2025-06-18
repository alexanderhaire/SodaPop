// File: frontend/src/pages/HorseList.tsx

import React from "react";
import {
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  Image,
  Text,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import horses from "../mocks/horses.json";

const HorseList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box p={6} maxW="800px" mx="auto" bg="whiteAlpha.800" borderRadius="lg" boxShadow="lg">
      <HStack justify="space-between" mb={4}>
        <Heading size="lg" color="#000">Available Horses</Heading>
        <Button as={Link} to="/create" variant="cta">
          Add Item
        </Button>
      </HStack>
      <VStack spacing={6} align="stretch">
        {horses.map((horse, idx) => (
          <HStack
            key={horse.id}
            p={4}
            borderWidth={1}
            borderRadius="lg"
            justify="space-between"
            align="center"
            bg={idx % 2 === 0 ? "#fff" : "#f8f8f8"}
            boxShadow="md"
          >
            <HStack spacing={4}>
              <Image
                src={`/images/${horse.id}.png`}
                alt={horse.name}
                boxSize="100px"
                borderRadius="md"
              />
              <Box>
                <Heading size="md">{horse.name}</Heading>
                <Text color="gray.500">{horse.record}</Text>
              </Box>
            </HStack>
            <Button variant="grey" onClick={() => navigate(`/horses/${horse.id}`)}>
              Details
            </Button>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default HorseList;
