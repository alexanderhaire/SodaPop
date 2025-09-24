import React from "react";
import {
  Box,
  Image,
  Heading,
  Text,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import assetsData from "../mocks/assets.json";
import { motion } from "framer-motion";

interface Asset {
  id: string;
  name: string;
  image: string;
  owner: string;
  sharePrice: number;
  totalShares: number;
  buyers: Partial<Record<string, number>>;
}

const assets = assetsData as unknown as Asset[];
const MotionBox = motion(Box);

const BoughtItems: React.FC = () => {
  const { publicKey } = useWallet();
  const address = publicKey?.toBase58();
  const bought = React.useMemo(() => {
    if (!address) return [] as typeof assets;
    return assets.filter((item) =>
      Object.keys(item.buyers).some(
        (b) => b.toLowerCase() === address.toLowerCase()
      )
    );
  }, [address]);

  return (
    <VStack spacing={5} align="stretch">
      {bought.length === 0 ? (
        <Box
          p={8}
          borderRadius="2xl"
          textAlign="center"
          bg="rgba(12, 20, 44, 0.85)"
          border="1px solid rgba(148, 163, 255, 0.18)"
          color="whiteAlpha.700"
        >
          You haven't acquired any legendary shares yet. Explore the spotlight to
          claim your first stake.
        </Box>
      ) : (
        bought.map((item, idx) => {
          const key = Object.keys(item.buyers).find(
            (b) => b.toLowerCase() === address?.toLowerCase()
          );
          const shares = key ? item.buyers[key] ?? 0 : 0;
          const cost = shares * item.sharePrice;
          return (
            <MotionBox
              key={item.id}
              p={5}
              borderRadius="2xl"
              display="flex"
              gap={5}
              alignItems="center"
              bg="rgba(9, 14, 30, 0.78)"
              border="1px solid rgba(114, 140, 255, 0.2)"
              boxShadow="0 20px 55px rgba(4, 9, 26, 0.65)"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ borderColor: "rgba(165, 196, 255, 0.4)", y: -4 }}
            >
              <Image
                src={item.image}
                alt={item.name}
                boxSize="92px"
                borderRadius="xl"
                objectFit="cover"
              />
              <Box>
                <Heading size="md">{item.name}</Heading>
                <Text color="whiteAlpha.700">{shares} shares secured</Text>
                <Text color="whiteAlpha.600" fontSize="sm">
                  Entry cost: {cost.toFixed(3)} SOL • Share price: {item.sharePrice} SOL
                </Text>
                <Badge colorScheme="cyan" mt={2} borderRadius="full">
                  Portfolio holding
                </Badge>
              </Box>
            </MotionBox>
          );
        })
      )}
    </VStack>
  );
};

export default BoughtItems;
