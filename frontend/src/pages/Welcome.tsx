import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';

const Welcome: React.FC = () => (
  <Box p={6} maxW="800px" mx="auto" bg="whiteAlpha.800" borderRadius="lg" boxShadow="lg">
    <VStack spacing={4} align="start">
      <Heading size="lg" color="purple.600">
        Welcome to Grey MarketPlace
      </Heading>
      <Text>
        Grey MarketPlace is a decentralized marketplace for creating, buying,
        and selling both variable and fixed assets. It combines Web3-powered
        investment infrastructure with on-chain commerce fulfillment.
      </Text>
      <Text>
        Variable assets provide ongoing fractional ownership via tokenized
        shares, while fixed assets enable one-time purchases. Explore the market
        to discover a variety of tokenized real-world assets.
      </Text>
      <Text>
        Behind the scenes, the platform leverages several OpenAI services. A
        personalization engine tracks your wallet interactions and recommends
        items tailored to your interests. Embeddings enable semantic search and
        suggest assets similar to those you viewed or purchased.
      </Text>
      <Text>
        Uploaded images can be analyzed with GPT-4 Vision to generate default
        titles and descriptions. You can also chat with SodaBot, an AI assistant
        that summarizes transactions and provides helpful marketplace tips.
      </Text>
      <Text>
        Developer tools further integrate AI, from code improvement scripts to
        ledger analysis. Together these features create a personalized, modern
        trading experience powered by smart defaults and insights.
      </Text>
    </VStack>
  </Box>
);

export default Welcome;
