import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';

const Welcome: React.FC = () => (
  <Box p={6} maxW="800px" mx="auto" bg="whiteAlpha.800" borderRadius="lg" boxShadow="lg">
    <VStack spacing={4} align="start">
      <Heading size="lg" color="purple.600">
        Welcome to Grey MarketPlace
      </Heading>
      <Text>
        Grey MarketPlace is a decentralized marketplace for creating, buying, and selling both variable and fixed assets. It combines Web3-powered investment infrastructure with on-chain commerce fulfillment.
      </Text>
      <Text>
        Variable assets provide ongoing fractional ownership via tokenized shares, while fixed assets enable one-time purchases. Explore the market to discover a variety of tokenized real-world assets.
      </Text>
    </VStack>
  </Box>
);

export default Welcome;
