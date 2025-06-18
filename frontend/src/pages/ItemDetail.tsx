// File: frontend/src/pages/ItemDetail.tsx

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
  HStack,
  Tooltip,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import axios from "axios";
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
import { readContract } from "@wagmi/core";
import { parseEther } from "viem";
import { HORSE_TOKEN_ADDRESS, horseTokenABI } from "../utils/contractConfig";
import items from "../mocks/items.json";

const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { address } = useAccount();
  const toast = useToast();
  const tokenId = id ? items.findIndex((h) => h.id === id) : -1;

  const [maxSupply, setMaxSupply] = useState<number | null>(null);
  const [mintedSoFar, setMintedSoFar] = useState<number | null>(null);
  const [remainingSupply, setRemainingSupply] = useState<number | null>(null);
  const [sharesOwned, setSharesOwned] = useState<number | null>(null);
  const [sharePrice, setSharePrice] = useState<number | null>(null);
  const [offeringShares, setOfferingShares] = useState<number | null>(null);
  const [calcShares, setCalcShares] = useState<string>("");
  const [calcEarnings, setCalcEarnings] = useState<string>("");

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

  const {
    config: buyMaxConfig,
    isLoading: isPreparingMax,
    error: prepareMaxError,
    isSuccess: canBuyMax,
  } = usePrepareContractWrite({
    address: HORSE_TOKEN_ADDRESS,
    abi: horseTokenABI,
    functionName: "mint",
    args: [address, tokenId, remainingSupply ?? 0],
    overrides:
      remainingSupply !== null
        ? { value: BigInt(remainingSupply) * parseEther("0.00001") }
        : undefined,
    chainId: 11155420,
    enabled: Boolean(
      address &&
      tokenId >= 0 &&
      remainingSupply !== null &&
      remainingSupply > 0
    ),
  });

  const {
    writeAsync: buyMaxAsync,
    isLoading: isBuyingMax,
    error: buyMaxError,
  } = useContractWrite(buyMaxConfig);

  useEffect(() => {
    if (tokenId < 0) return;
    const fetchSupply = async () => {
      try {
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

  useEffect(() => {
    if (tokenId < 0) return;
    const fetchOffering = async () => {
      try {
        const [price, total] = (await readContract({
          address: HORSE_TOKEN_ADDRESS,
          abi: horseTokenABI,
          functionName: "getItemOffering",
          args: [tokenId],
          chainId: 11155420,
        })) as unknown as [bigint, bigint];

        setSharePrice(Number(price));
        setOfferingShares(Number(total));
      } catch (err) {
        console.error("Failed to fetch item offering:", err);
      }
    };
    fetchOffering();
  }, [tokenId]);

  useEffect(() => {
    if (!address || tokenId < 0) {
      setSharesOwned(null);
      return;
    }
    const fetchBalance = async () => {
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

  const item = items.find((i) => i.id === id);
  if (!item) {
    return (
      <Box p={6}>
        <Heading>Item not found</Heading>
        <Text>No item with ID: {id}</Text>
      </Box>
    );
  }

  const handleBuyShare = async () => {
    if (!address) return alert("Please connect your wallet first.");
    if (isPreparing) return alert("Preparing transaction—please wait.");
    if (prepareError) {
      console.error("Prepare error:", prepareError);
      return alert("Failed to prepare transaction.");
    }
    if (!canMint || !mintAsync) return alert("Transaction not ready yet.");
    try {
      const tx = await mintAsync();
      alert(`Transaction sent! Hash: ${tx.hash}`);
    } catch (err) {
      console.error("Mint failed:", err);
      alert("Transaction failed.");
    }
  };

  const handleBuyMax = async () => {
    if (!address) return alert("Please connect your wallet first.");
    if (isPreparingMax) return alert("Preparing transaction—please wait.");
    if (prepareMaxError) {
      console.error("Prepare error:", prepareMaxError);
      return alert("Failed to prepare transaction.");
    }
    if (!canBuyMax || !buyMaxAsync) return alert("Transaction not ready yet.");
    try {
      const tx = await buyMaxAsync();
      toast({
        title: `Purchased remaining shares!`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Mint failed:", err);
      alert("Transaction failed.");
    }
  };

  const projectedReturn = React.useMemo(() => {
    if (!calcShares || !calcEarnings || !maxSupply) return "0";
    try {
      const earningsWei = ethers.parseEther(calcEarnings);
      const resultWei = (earningsWei * BigInt(Number(calcShares))) / BigInt(maxSupply);
      return ethers.formatEther(resultWei);
    } catch {
      return "0";
    }
  }, [calcShares, calcEarnings, maxSupply]);

  const ownershipPercent = React.useMemo(() => {
    if (!calcShares || !maxSupply) return 0;
    return (Number(calcShares) / maxSupply) * 100;
  }, [calcShares, maxSupply]);

  return (
    <Box p={6} maxW="700px" mx="auto" bg="whiteAlpha.800" borderRadius="lg" boxShadow="lg">
      <Heading mb={4} color="purple.600">
        {item.name}
      </Heading>
      <Image
        src={`/images/${item.id}.png`}
        alt={item.name}
        borderRadius="lg"
        boxShadow="md"
        mb={4}
      />
      <Divider mb={4} />

      <VStack spacing={3} align="start">
        <Text><strong>Age:</strong> {item.age}</Text>
        <Text><strong>Trainer:</strong> {item.trainer}</Text>
        <Text><strong>Record:</strong> {item.record}</Text>
        <Text><strong>Earnings:</strong> {item.earnings}</Text>

        {sharePrice !== null && (
          <Text><strong>Share Price:</strong> {sharePrice} wei</Text>
        )}
        {offeringShares !== null && (
          <Text><strong>Total Shares:</strong> {offeringShares}</Text>
        )}
        {maxSupply !== null && mintedSoFar !== null && (
          <Box>
            <Text><strong>Minted:</strong> {mintedSoFar} / {maxSupply}</Text>
            <Text><strong>Remaining:</strong> {remainingSupply}</Text>
          </Box>
        )}
        {sharesOwned !== null && (
          <Text color="gray.600">
            You own {sharesOwned} share{sharesOwned !== 1 && "s"} of this item.
          </Text>
        )}
      </VStack>

      <HStack mt={6} spacing={4}>
        <Button variant="cta" onClick={handleBuyShare} isLoading={isPreparing || isMinting}>
          Buy Share for 0.00001 ETH
        </Button>
        <Tooltip
          label="No shares remaining"
          isDisabled={remainingSupply !== null && remainingSupply > 0}
        >
          <Button
            variant="grey"
            size="sm"
            onClick={handleBuyMax}
            isDisabled={remainingSupply !== null && remainingSupply <= 0}
            isLoading={isPreparingMax || isBuyingMax}
          >
            Buy Max
          </Button>
        </Tooltip>
      </HStack>

      <Accordion allowToggle mt={4}>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">Projected Earnings</Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={3} align="stretch">
              <FormControl>
                <FormLabel>Number of Shares</FormLabel>
                <Input
                  type="number"
                  value={calcShares}
                  onChange={(e) => setCalcShares(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Projected Item Earnings (ETH)</FormLabel>
                <Input
                  type="number"
                  value={calcEarnings}
                  onChange={(e) => setCalcEarnings(e.target.value)}
                />
              </FormControl>
              {calcShares && calcEarnings && maxSupply !== null && (
                <Text>
                  You would earn {projectedReturn} ETH ({ownershipPercent.toFixed(2)}% ownership)
                </Text>
              )}
              <Text fontSize="sm" color="gray.500">
                This is an estimate. Actual earnings may vary.
              </Text>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default ItemDetail;
