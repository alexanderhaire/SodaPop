import React from "react";
import { Box, Image, Heading, Text, Button, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import items from "../mocks/items.json";

const MyItems: React.FC = () => {
  const navigate = useNavigate();

  return (
    <VStack spacing={4} align="stretch">
      {items.map((item, idx) => (
        <Box
          key={idx}
          p={4}
          borderWidth={1}
          borderRadius="lg"
          boxShadow="md"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          bg={idx % 2 === 0 ? "#fff" : "#f8f8f8"}
        >
          <Box display="flex" alignItems="center" gap={4}>
            <Image
              src={item.image}
              alt={item.name}
              boxSize="80px"
              borderRadius="md"
            />
            <Box>
              <Heading size="md">{item.name}</Heading>
              <Text color="gray.500">{item.record}</Text>
            </Box>
          </Box>
          <Button colorScheme="teal" onClick={() => navigate(`/items/${item.id}`)}>
            Details
          </Button>
        </Box>
      ))}
    </VStack>
  );
};

export default MyItems;
