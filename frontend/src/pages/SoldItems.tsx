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

const SoldItems: React.FC = () => {
  const { address } = useAccount();
  const sold = React.useMemo(() => {
    if (!address) return [] as typeof assets;
    return assets.filter(
      (item) =>
        item.owner.toLowerCase() === address.toLowerCase() &&
        Object.keys(item.buyers).some(
          (b) => b.toLowerCase() !== address.toLowerCase()
        )
    );
  }, [address]);

  return (
    <VStack spacing={4} align="stretch">
      {sold.length === 0 ? (
        <Text>No sold items found.</Text>
      ) : (
        sold.map((item, idx) => {
          const soldShares = Object.entries(item.buyers).reduce((acc, [addr, num]) => {
            if (addr.toLowerCase() === address?.toLowerCase()) return acc;
            return acc + (num as number);
          }, 0);
          const ownership = item.totalShares - soldShares;
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
                  <Text>Total Shares Sold: {soldShares}</Text>
                  <Text>Current Ownership: {ownership}</Text>
                </Box>
              </Box>
            </Box>
          );
        })
      )}
    </VStack>
  );
};

export default SoldItems;
