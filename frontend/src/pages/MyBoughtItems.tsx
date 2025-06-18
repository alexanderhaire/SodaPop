import React from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Image,
  Text,
  Button,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

interface Item {
  name: string;
  image: string;
  starts: number;
  wins: number;
  places: number;
}

const items: Item[] = [
  {
    name: "Thunder Bolt",
    image: "https://via.placeholder.com/150",
    starts: 10,
    wins: 3,
    places: 6,
  },
  {
    name: "Iron Comet",
    image: "https://via.placeholder.com/150",
    starts: 15,
    wins: 7,
    places: 4,
  },
];

const MyBoughtItems: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box p={6} maxW="800px" mx="auto" bg="whiteAlpha.800" borderRadius="lg" boxShadow="lg">
      <Heading size="lg" color="purple.600" mb={4}>
        My Bought Items
      </Heading>
      <VStack spacing={6} align="stretch">
        {items.map((item, idx) => (
          <HStack
            key={idx}
            p={4}
            borderWidth={1}
            borderRadius="lg"
            justify="space-between"
            align="center"
            bg={idx % 2 === 0 ? "#fff" : "#f8f8f8"}
            boxShadow="md"
          >
            <HStack spacing={4} align="center">
              <Image src={item.image} alt={item.name} boxSize="100px" borderRadius="md" />
              <Box>
                <Heading size="md">{item.name}</Heading>
                <Text color="gray.500">
                  {item.starts} starts – {item.wins} wins – {item.places} places
                </Text>
              </Box>
            </HStack>
            <Button colorScheme="teal" onClick={() => navigate("/items/" + idx)}>
              Details
            </Button>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default MyBoughtItems;
