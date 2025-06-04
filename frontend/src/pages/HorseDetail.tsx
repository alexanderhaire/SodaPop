// File: frontend/src/pages/HorseDetail.tsx

import React from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Image,
  Text,
  VStack,
  Divider,
  Button,
} from "@chakra-ui/react";
import { useAccount, usePrepareContractWrite, useContractWrite } from "wagmi";
import { readContract } from "@wagmi/core";
import { parseEther } from "viem";
import { HORSE_TOKEN_ADDRESS, horseTokenABI } from "../utils/contractConfig";
import horses from "../mocks/horses.json";

const HorseDetail: React.FC = () => {
  const { id } = useParams();
  const { address } = useAccount();

  // Determine tokenId from the horse ID
  const tokenId = horses.findIndex((h) => h.id === id);

  // Prepare the "mint" transaction (0.00001 ETH)
  const {
    config,
    isLoading: isPrepareLoading,
    isSuccess: isPrepareSuccess,
    error: prepareError,
  } = usePrepareContractWrite({
    address: HORSE_TOKEN_ADDRESS,
    abi: horseTokenABI,
    functionName: "mint",
    args: [address, tokenId, 1],
    overrides: {
      value: parseEther("0.00001"),
    },
    chainId: 11155420,
    enabled: !!address && tokenId >= 0,
  });

  const {
    writeAsync: mintAsync,
    isLoading: isMinting,
    error: writeError,
  } = useContractWrite(config);

  const [sharesOwned, setSharesOwned] = React.useState<number | null>(null);

  // Fetch on‐chain balanceOf whenever address or tokenId changes
  React.useEffect(() => {
    const fetchBalance = async () => {
      if (!address || tokenId < 0) {
        setSharesOwned(null);
        return;
      }
      try {
        const balance = await readContract({
          address: HORSE_TOKEN_ADDRESS,
          abi: horseTokenABI,
          functionName: "balanceOf",
          args: [address, tokenId],
          chainId: 11155420,
        });
        setSharesOwned(Number(balance));
      } catch (err) {
        console.error("readContract failed:", err);
        setSharesOwned(null);
      }
    };
    fetchBalance();
  }, [address, tokenId]);

  const horse = horses.find((h) => h.id === id);
  if (!horse) {
    return (
      <Box p={6}>
        <Heading>Horse not found</Heading>
        <Text>No horse with ID: {id}</Text>
      </Box>
    );
  }

  const handleBuyShare = async () => {
    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }

    if (isPrepareLoading) {
      alert("Preparing transaction—please wait a moment.");
      return;
    }

    if (prepareError) {
      console.error("Prepare error:", prepareError);
      alert("Failed to prepare transaction. See console for details.");
      return;
    }

    if (!isPrepareSuccess || !mintAsync) {
      alert("Transaction is not ready yet. Please wait.");
      return;
    }

    try {
      const tx = await mintAsync();
      alert(`Transaction sent! Hash: ${tx.hash}`);
    } catch (err) {
      console.error("writeContract error:", err);
      alert("Transaction failed");
    }
  };

  return (
    <Box p={6} maxW="700px" mx="auto">
      <Heading mb={4}>{horse.name}</Heading>
      <Image
        src={`/images/${id}.png`}
        alt={horse.name}
        borderRadius="lg"
        boxShadow="md"
        mb={4}
      />
      <Divider mb={4} />
      <VStack spacing={3} align="start">
        <Text>
          <strong>Age:</strong> {horse.age}
        </Text>
        <Text>
          <strong>Trainer:</strong> {horse.trainer}
        </Text>
        <Text>
          <strong>Record:</strong> {horse.record}
        </Text>
        <Text>
          <strong>Earnings:</strong> {horse.earnings}
        </Text>
      </VStack>

      {sharesOwned !== null && (
        <Text color="gray.600" mt={2}>
          You own {sharesOwned} share{sharesOwned === 1 ? "" : "s"} of this horse.
        </Text>
      )}

      <Button
        colorScheme="teal"
        mt={6}
        onClick={handleBuyShare}
        isLoading={isPrepareLoading || isMinting}
      >
        Buy Share for 0.00001 ETH
      </Button>
    </Box>
  );
};

export default HorseDetail;
