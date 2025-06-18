// File: frontend/src/pages/ItemList.tsx

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
import items from "../mocks/items.json";
const ItemList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box p={6} maxW="800px" mx="auto" bg="whiteAlpha.800" borderRadius="lg" boxShadow="lg">
      <HStack justify="space-between" mb={4}>
        <Heading size="lg" color="purple.600">Available Items</Heading>
        <Button as={Link} to="/create" colorScheme="purple" variant="solid">
          Add Item
        </Button>
      </HStack>
      <VStack spacing={6} align="stretch">
        {items.map((item, idx) => (
          <HStack
            key={item.id}
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
                src={`/images/${item.id}.png`}
                alt={item.name}
                boxSize="100px"
                borderRadius="md"
              />
              <Box>
                <Heading size="md">{item.name}</Heading>
                <Text color="gray.500">{item.record}</Text>
              </Box>
            </HStack>
            <Button colorScheme="teal" onClick={() => navigate(`/items/${item.id}`)}>
              Details
            </Button>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default ItemList;
