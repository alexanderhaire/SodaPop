import React, { useMemo } from "react";
import {
  Box,
  Image,
  Heading,
  Text,
  VStack,
  Badge,
  Button,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { usePortfolio, type PortfolioToken } from "../hooks/usePortfolio";
import {
  formatRelativeTime,
  formatTokenAmount,
  shortenAddress,
} from "../utils/tokenDisplay";

const MotionBox = motion(Box);

interface PortfolioEntry {
  token: PortfolioToken;
  holding: bigint;
}

const openExplorer = (mint: string) => {
  const explorerUrl = `https://explorer.solana.com/address/${mint}?cluster=devnet`;
  if (typeof window !== "undefined") {
    window.open(explorerUrl, "_blank", "noopener,noreferrer");
  }
};

const BoughtItems: React.FC = () => {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? "";
  const { data: portfolioTokens, isLoading, isError } = usePortfolio(wallet);

  const entries = useMemo<PortfolioEntry[]>(() => {
    if (!portfolioTokens) {
      return [];
    }

    return portfolioTokens.map((token) => {
      let holding = 0n;
      try {
        holding = token.amount ? BigInt(token.amount) : 0n;
      } catch (err) {
        console.warn("[portfolio] Unable to parse holding amount", err);
      }

      return { token, holding };
    });
  }, [portfolioTokens]);

  return (
    <VStack spacing={5} align="stretch">
      {!wallet ? (
        <Box
          p={8}
          borderRadius="2xl"
          textAlign="center"
          bg="rgba(12, 20, 44, 0.85)"
          border="1px solid rgba(148, 163, 255, 0.18)"
          color="whiteAlpha.700"
        >
          Connect your wallet to view your on-chain token holdings.
        </Box>
      ) : isError ? (
        <Box
          p={8}
          borderRadius="2xl"
          textAlign="center"
          bg="rgba(12, 20, 44, 0.85)"
          border="1px solid rgba(148, 163, 255, 0.18)"
          color="whiteAlpha.700"
        >
          Unable to load your portfolio right now. Please try again shortly.
        </Box>
      ) : isLoading ? (
        <Box
          p={8}
          borderRadius="2xl"
          textAlign="center"
          bg="rgba(12, 20, 44, 0.85)"
          border="1px solid rgba(148, 163, 255, 0.18)"
        >
          <HStack justify="center" spacing={3}>
            <Spinner size="sm" color="cyan.200" />
            <Text color="whiteAlpha.700">Fetching your token roster…</Text>
          </HStack>
        </Box>
      ) : entries.length === 0 ? (
        <Box
          p={8}
          borderRadius="2xl"
          textAlign="center"
          bg="rgba(12, 20, 44, 0.85)"
          border="1px solid rgba(148, 163, 255, 0.18)"
          color="whiteAlpha.700"
        >
          You haven't acquired any on-chain tokens yet. Explore the Spotlight to
          launch or collect your first position.
        </Box>
      ) : (
        entries.map(({ token, holding }, idx) => {
          const holdingDisplay = formatTokenAmount(token.amount, token.decimals);
          const supplyDisplay = formatTokenAmount(
            token.creatorAmount,
            token.decimals
          );
          const isHolder = holding > 0n;
          const badgeLabel = isHolder
            ? "Portfolio holding"
            : token.isCreator
            ? "Creator allocation"
            : undefined;

          return (
            <MotionBox
              key={token.mint}
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
              {token.imageUrl ? (
                <Image
                  src={token.imageUrl}
                  alt={token.name}
                  boxSize="92px"
                  borderRadius="xl"
                  objectFit="cover"
                />
              ) : (
                <Box
                  boxSize="92px"
                  borderRadius="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="2xl"
                  fontWeight="bold"
                  bgGradient="linear(to-br, rgba(80, 134, 255, 0.3), rgba(155, 100, 255, 0.3))"
                  border="1px solid rgba(114, 140, 255, 0.32)"
                >
                  {token.name.charAt(0).toUpperCase()}
                </Box>
              )}
              <Box flex="1">
                <Heading size="md">{token.name}</Heading>
                <Text color="whiteAlpha.700">
                  {isHolder
                    ? `Holding ${holdingDisplay} ${token.symbol}`
                    : token.isCreator
                    ? `Creator supply ${supplyDisplay} ${token.symbol}`
                    : `No balance yet`}
                </Text>
                <Text color="whiteAlpha.600" fontSize="sm">
                  Launched {formatRelativeTime(token.createdAt)} • Mint {" "}
                  {shortenAddress(token.mint)}
                </Text>
                {badgeLabel && (
                  <Badge colorScheme="cyan" mt={2} borderRadius="full">
                    {badgeLabel}
                  </Badge>
                )}
              </Box>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openExplorer(token.mint)}
              >
                View mint
              </Button>
            </MotionBox>
          );
        })
      )}
    </VStack>
  );
};

export default BoughtItems;
