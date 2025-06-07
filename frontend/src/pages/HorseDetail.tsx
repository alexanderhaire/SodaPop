// File: frontend/src/pages/HorseDetail.tsx

import React, { useEffect, useState } from "react";
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
import axios from "axios";
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
import { readContract } from "@wagmi/core";
import { parseEther } from "viem";
import { HORSE_TOKEN_ADDRESS, horseTokenABI } from "../utils/contractConfig";
import horses from "../mocks/horses.json";

const HorseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { address } = useAccount();
  const tokenId = id ? horses.findIndex((h) => h.id === id) : -1;

  const [maxSupply, setMaxSupply] = useState<number | null>(null);
  const [mintedSoFar, setMintedSoFar] = useState<number | null>(null);
  const [remainingSupply, setRemainingSupply] = useState<number | null>(null);
  const [sharesOwned, setSharesOwned] = useState<number | null>(null);

  // Prepare mint transaction
  const {
    config,
    isLoading: isPreparing,
    error: prepareError,
    isSuccess: canMint,
  } = usePrepareContractWrite({
    address: HORSE_TOKEN_ADDRESS,
    abi: horseTokenABI,
    functionName: "mint",
    args: [address, tokenId, 1],
    overrides: { value: parseEther("0.00001") },
    chainId: 11155420,
    enabled: Boolean(address && tokenId >= 0),
  });
  const {
    writeAsync: mintAsync,
    isLoading: isMinting,
    error: mintError,
  } = useContractWrite(config);

  // 1) Fetch on-chain maxSupply and mintedSoFar → compute remainingSupply
  useEffect(() => {
    if (tokenId < 0) return;
    const fetchSupply = async (params: { chainId?: number } = {}) => {
      try {
  const { chainId } = params;
  if (!chainId) return;
        const [maxOnChain, mintedOnChain] = await Promise.all([
          readContract({
            address: HORSE_TOKEN_ADDRESS,
            abi: horseTokenABI,
            functionName: "maxSupply",
            args: [tokenId],
            chainId: 11155420,
          }),
          readContract({
            address: HORSE_TOKEN_ADDRESS,
            abi: horseTokenABI,
            functionName: "horseSupply",
            args: [tokenId],
            chainId: 11155420,
          }),
        ]);

        const maxNum = Number(maxOnChain);
        const mintedNum = Number(mintedOnChain);
        setMaxSupply(maxNum);
        setMintedSoFar(mintedNum);
        setRemainingSupply(maxNum - mintedNum);
      } catch (err) {
        console.error("Failed to fetch on-chain supply:", err);
      }
    };
    fetchSupply();
  }, [tokenId]);

  // 2) Fetch off-chain API supply (if you still need it)
  // Uncomment if needed:
  // useEffect(() => {
  //   if (tokenId < 0) return;
  //   axios
  //     .get<{ minted: number }>(`/api/supply/${tokenId}`)
  //     .then((resp) => {
  //       // do something with resp.data.minted
  //     })
  //     .catch((err) => console.error("Off-chain API failed:", err));
  // }, [tokenId]);

  // 3) Fetch how many shares the user owns
  useEffect(() => {
    if (!address || tokenId < 0) {
      setSharesOwned(null);
      return;
    }
    const fetchBalance = async (params: { chainId?: number } = {}) => {
  const { chainId } = params;
  if (!chainId) return;
      try {
        const bal = await readContract({
          address: HORSE_TOKEN_ADDRESS,
          abi: horseTokenABI,
          functionName: "balanceOf",
          args: [address, tokenId],
          chainId: 11155420,
        });
        setSharesOwned(Number(bal));
      } catch (err) {
        console.error("Failed to fetch shares balance:", err);
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
    if (isPreparing) {
      alert("Preparing transaction—please wait.");
      return;
    }
    if (prepareError) {
      console.error("Prepare error:", prepareError);
      alert("Failed to prepare transaction.");
      return;
    }
    if (!canMint || !mintAsync) {
      alert("Transaction not ready yet.");
      return;
    }
    try {
      const tx = await mintAsync();
      alert(`Transaction sent! Hash: ${tx.hash}`);
    } catch (err) {
      console.error("Mint failed:", err);
      alert("Transaction failed.");
    }
  };

  return (
    <Box p={6} maxW="700px" mx="auto">
      <Heading mb={4}>{horse.name}</Heading>
      <Image
        src={`/images/${horse.id}.png`}
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

        {maxSupply !== null && mintedSoFar !== null && (
          <Box>
            <Text>
              <strong>Minted:</strong> {mintedSoFar} / {maxSupply}
            </Text>
            <Text>
              <strong>Remaining:</strong> {remainingSupply}
            </Text>
          </Box>
        )}

        {sharesOwned !== null && (
          <Text color="gray.600">
            You own {sharesOwned} share{sharesOwned !== 1 && "s"} of this horse.
          </Text>
        )}
      </VStack>

      <Button
        colorScheme="teal"
        mt={6}
        onClick={handleBuyShare}
        isLoading={isPreparing || isMinting}
      >
        Buy Share for 0.00001 ETH
      </Button>
    </Box>
  );
};

export default HorseDetail;
