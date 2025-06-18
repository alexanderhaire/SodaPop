import React from "react";
import { Box, Image, Heading, Text, VStack } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import assetsData from "../mocks/assets.json";

interface Asset {
  id: string;
  name: string;
  image: string;
  owner: string;
  sharePrice: number;
  totalShares: number;
  buyers: Record<string, number>;
}

const assets = assetsData as unknown as Asset[];

const BoughtItems: React.FC = () => {
  const { address } = useAccount();
  const bought = React.useMemo(() => {
    if (!address) return [] as typeof assets;
    return assets.filter((item) =>
      Object.keys(item.buyers).some(
        (b) => b.toLowerCase() === address.toLowerCase()
      )
    );
  }, [address]);

  return (
    <VStack spacing={4} align="stretch">
      {bought.length === 0 ? (
        <Text>No bought items found.</Text>
      ) : (
        bought.map((item, idx) => {
          const key = Object.keys(item.buyers).find(
            (b) => b.toLowerCase() === address?.toLowerCase()
          );
          const shares = key ? item.buyers[key] : 0;
          const cost = shares * item.sharePrice;
          return (
            <Box
              key={item.id}
              p={4}
              borderWidth={1}
              borderRadius="lg"
              boxShadow="md"
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
                  <Text>Shares Owned: {shares}</Text>
                  <Text>Price Paid: {cost} ETH</Text>
                </Box>
              </Box>
            </Box>
          );
        })
      )}
    </VStack>
  );
};

export default BoughtItems;
