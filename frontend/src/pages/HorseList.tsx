// File: frontend/src/pages/HorseList.tsx

import React from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Image,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const HorseList: React.FC = () => {
  const navigate = useNavigate();

  const handleBuyShare = () => {
    alert("Buying one fractional share of SodaPop!");
    // e.g., navigate("/buy/sodapop") or call on-chain function
  };

  const viewDetails = () => {
    navigate("/horses/sodapop");
  };

  return (
    <Box p={6}>
      <Heading mb={4}>Available Horses</Heading>

      {/* Single‐card layout for “SodaPop” */}
      <Box
        border="1px"
        borderColor="gray.200"
        borderRadius="md"
        overflow="hidden"
        maxW="400px"
        boxShadow="md"
      >
        {/* Remove fixed height so the entire portrait (including “SODA POP” text) is visible */}
        <Image
          src="/images/sodapop.png"
          alt="SodaPop"
          objectFit="cover"
          w="100%"
          // Let height adjust automatically to preserve full image
          h="auto"
          borderTopRadius="md"
        />

        <VStack align="start" spacing={2} p={4}>
          <Heading size="sm">SodaPop</Heading>
          <Text fontSize="sm" color="gray.600">
            Fractional horse ownership—buy as little as 0.1 share!
          </Text>
          <HStack spacing={2} mt={2}>
            <Button colorScheme="teal" size="sm" onClick={handleBuyShare}>
              Buy Share
            </Button>
            <Button variant="outline" size="sm" onClick={viewDetails}>
              Details
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default HorseList;
