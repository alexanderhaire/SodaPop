import React from "react";
import {
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  Image,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import horses from "../mocks/horses.json";

const HorseList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box p={6}>
      <Heading mb={6}>Available Horses</Heading>
      <VStack spacing={6} align="stretch">
        {horses.map((horse) => (
          <HStack
            key={horse.id}
            p={4}
            borderWidth={1}
            borderRadius="lg"
            justify="space-between"
            align="center"
          >
            <HStack spacing={4}>
              <Image
                src={`/images/${horse.id}.png`}
                alt={horse.name}
                boxSize="100px"
                borderRadius="md"
              />
              <Box>
                <Heading size="md">{horse.name}</Heading>
                <Text color="gray.500">{horse.record}</Text>
              </Box>
            </HStack>
            <Button onClick={() => navigate(`/horses/${horse.id}`)}>
              Details
            </Button>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default HorseList;
