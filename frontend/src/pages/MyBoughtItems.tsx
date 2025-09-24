import React from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Image,
  Text,
  Button,
  Badge,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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

const MotionHStack = motion(HStack);

const MyBoughtItems: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box
      p={8}
      maxW="900px"
      mx="auto"
      bg="rgba(9, 14, 30, 0.82)"
      borderRadius="3xl"
      border="1px solid rgba(148, 163, 255, 0.22)"
      boxShadow="0 28px 70px rgba(4, 9, 24, 0.75)"
    >
      <Heading size="lg" mb={2}>
        My curated acquisitions
      </Heading>
      <Text color="whiteAlpha.700" mb={6} fontSize="sm">
        A personal archive of the champions you have selectively backed across
        the exchange.
      </Text>
      <VStack spacing={6} align="stretch">
        {items.map((item, idx) => (
          <MotionHStack
            key={idx}
            p={5}
            borderRadius="2xl"
            justify="space-between"
            align="center"
            bg="rgba(12, 18, 38, 0.9)"
            border="1px solid rgba(114, 140, 255, 0.18)"
            boxShadow="0 20px 55px rgba(4, 9, 26, 0.65)"
            spacing={6}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            whileHover={{ borderColor: "rgba(165, 196, 255, 0.4)", y: -4 }}
          >
            <HStack spacing={4} align="center">
              <Image src={item.image} alt={item.name} boxSize="96px" borderRadius="xl" />
              <Box>
                <Heading size="md">{item.name}</Heading>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {item.starts} starts • {item.wins} wins • {item.places} podiums
                </Text>
                <Badge colorScheme="cyan" mt={2} borderRadius="full">
                  Collector's pick
                </Badge>
              </Box>
            </HStack>
            <Button variant="cta" size="sm" onClick={() => navigate("/items/" + idx)}>
              View dossier
            </Button>
          </MotionHStack>
        ))}
      </VStack>
    </Box>
  );
};

export default MyBoughtItems;
