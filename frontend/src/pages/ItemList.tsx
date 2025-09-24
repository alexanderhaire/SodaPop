// File: frontend/src/pages/ItemList.tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  Image,
  Text,
  Badge,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import items from "../mocks/items.json";
import { motion } from "framer-motion";
import {
  SpotlightItem,
  getStoredSpotlightItems,
  subscribeToSpotlightUpdates,
} from "../utils/spotlightItems";

const MotionBox = motion(Box);
const MotionHStack = motion(HStack);
type SpotlightListItem = SpotlightItem & {
  record: string;
};

const ItemList: React.FC = () => {
  const navigate = useNavigate();
  const [launchedItems, setLaunchedItems] = useState<SpotlightItem[]>([]);

  useEffect(() => {
    const syncRoster = () => {
      setLaunchedItems(getStoredSpotlightItems());
    };

    syncRoster();
    const unsubscribe = subscribeToSpotlightUpdates(syncRoster);

    return () => {
      unsubscribe();
    };
  }, []);

  const roster = useMemo<SpotlightListItem[]>(() => {
    const legacyItems: SpotlightListItem[] = (items as SpotlightListItem[]).map(
      (item) => ({
        ...item,
        image: item.image ?? `/images/${item.id}.png`,
      })
    );

    return [...launchedItems, ...legacyItems];
  }, [launchedItems]);

  const handleLaunchNavigation = (item: SpotlightListItem) => {
    if (item.mintAddress) {
      const explorerUrl = `https://explorer.solana.com/address/${item.mintAddress}?cluster=devnet`;
      if (typeof window !== "undefined") {
        window.open(explorerUrl, "_blank", "noopener,noreferrer");
      }
      return;
    }

    navigate(`/items/${item.id}`);
  };

  return (
    <MotionBox
      p={8}
      maxW="900px"
      mx="auto"
      bg="rgba(9, 14, 30, 0.82)"
      borderRadius="3xl"
      border="1px solid rgba(148, 163, 255, 0.22)"
      boxShadow="0 28px 70px rgba(4, 9, 24, 0.75)"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <HStack justify="space-between" mb={6} align="flex-end">
        <Box>
          <Badge
            colorScheme="cyan"
            variant="outline"
            borderRadius="full"
            px={3}
            py={1}
            mb={2}
          >
            Spotlight roster
          </Badge>
          <Heading size="lg">Featured champions on the exchange</Heading>
          <Text color="whiteAlpha.700" fontSize="sm" mt={2}>
            Explore tokenized stables ready for ignition. Each profile includes
            cinematic stats, live pricing, and transparent ownership history.
          </Text>
        </Box>
        <Button as={Link} to="/create" variant="cta" size="sm">
          Forge a listing
        </Button>
      </HStack>
      <VStack spacing={5} align="stretch">
        {roster.map((item, idx) => (
          <MotionHStack
            key={item.id}
            p={5}
            borderRadius="2xl"
            justify="space-between"
            align="center"
            bg="rgba(12, 18, 38, 0.9)"
            border="1px solid rgba(114, 140, 255, 0.18)"
            boxShadow="0 18px 45px rgba(4, 10, 28, 0.6)"
            spacing={6}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            whileHover={{ borderColor: "rgba(165, 196, 255, 0.4)", y: -4 }}
          >
            <HStack spacing={5} align="center">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  boxSize="96px"
                  borderRadius="xl"
                  objectFit="cover"
                />
              ) : (
                <Box
                  boxSize="96px"
                  borderRadius="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="3xl"
                  fontWeight="bold"
                  bgGradient="linear(to-br, rgba(80, 134, 255, 0.3), rgba(155, 100, 255, 0.3))"
                  border="1px solid rgba(114, 140, 255, 0.32)"
                >
                  {item.name.charAt(0).toUpperCase()}
                </Box>
              )}
              <Box>
                <Heading size="md">{item.name}</Heading>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {item.record}
                </Text>
              </Box>
            </HStack>
            <Button
              variant="cta"
              size="sm"
              onClick={() => handleLaunchNavigation(item)}
            >
              {item.mintAddress ? "View on Explorer" : "Enter details"}
            </Button>
          </MotionHStack>
        ))}
      </VStack>
    </MotionBox>
  );
};

export default ItemList;
