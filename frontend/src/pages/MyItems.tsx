import React from "react";
import {
  Box,
  Image,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import items from "../mocks/items.json";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const MyItems: React.FC = () => {
  const navigate = useNavigate();

  return (
    <VStack spacing={5} align="stretch">
      {items.map((item, idx) => (
        <MotionBox
          key={idx}
          p={5}
          borderRadius="2xl"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          bg="rgba(9, 14, 30, 0.78)"
          border="1px solid rgba(114, 140, 255, 0.2)"
          boxShadow="0 20px 55px rgba(4, 9, 26, 0.65)"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.04 }}
          whileHover={{ borderColor: "rgba(165, 196, 255, 0.4)", y: -4 }}
        >
          <HStack spacing={4} align="center">
            <Image
              src={item.image}
              alt={item.name}
              boxSize="88px"
              borderRadius="xl"
              objectFit="cover"
            />
            <Box>
              <Heading size="md">{item.name}</Heading>
              <Text color="whiteAlpha.700" fontSize="sm">
                {item.record}
              </Text>
              <Badge colorScheme="cyan" mt={2} borderRadius="full">
                Owned asset
              </Badge>
            </Box>
          </HStack>
          <Button variant="cta" size="sm" onClick={() => navigate(`/items/${item.id}`)}>
            View performance
          </Button>
        </MotionBox>
      ))}
    </VStack>
  );
};

export default MyItems;
