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
  Link,
} from "@chakra-ui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import { ethers } from "ethers";
import axios from "../utils/axiosConfig";
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
  const [marketData, setMarketData] = useState<{ price: number; timestamp: string }[]>([]);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [horseProfile, setHorseProfile] = useState<
    | {
        name: string;
        trackLocation: string;
        streamUrl: string;
        legalContractUri: string;
        metadataUri: string;
        owner: string;
        verified: boolean;
      }
    | null
  >(null);
  const [ownershipVerified, setOwnershipVerified] = useState<boolean | null>(null);

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
          readContract(undefined as any, {
            address: HORSE_TOKEN_ADDRESS,
            abi: horseTokenABI,
            functionName: "maxSupply",
            args: [tokenId],
            chainId: 11155420,
          }),
          readContract(undefined as any, {
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
        const [price, total] = (await readContract(undefined as any, {
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
        const bal = await readContract(undefined as any, {
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

  useEffect(() => {
    if (!id) return;
    const fetchMarket = async () => {
      try {
        const res = await axios.get(`/asset/market-data/${id}`);
        const data = res.data as { price: number; timestamp: string };
        setMarketData((prev) => [...prev.slice(-19), data]);
        setLatestPrice(data.price);
      } catch (err) {
        console.error('Failed to load market data:', err);
      }
    };
    fetchMarket();
    const interval = setInterval(fetchMarket, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (tokenId < 0) return;
    const fetchHorseProfile = async () => {
      try {
        const result = (await readContract(undefined as any, {
          address: HORSE_TOKEN_ADDRESS,
          abi: horseTokenABI,
          functionName: "getHorseProfile",
          args: [tokenId],
          chainId: 11155420,
        })) as unknown as [
          string,
          string,
          string,
          string,
          string,
          string,
          boolean
        ];

        const [name, trackLocation, streamUrl, legalContractUri, metadataUri, owner, verified] =
          result;

        const profile = {
          name,
          trackLocation,
          streamUrl,
          legalContractUri,
          metadataUri,
          owner,
          verified,
        };
        setHorseProfile(profile);

        if (verified && owner && owner !== ethers.ZeroAddress && legalContractUri) {
          const isVerified = await readContract(undefined as any, {
            address: HORSE_TOKEN_ADDRESS,
            abi: horseTokenABI,
            functionName: "verifyHorseOwnership",
            args: [owner, tokenId, legalContractUri],
            chainId: 11155420,
          });
          setOwnershipVerified(Boolean(isVerified));
        } else {
          setOwnershipVerified(false);
        }
      } catch (err) {
        console.error("Failed to load horse profile:", err);
        setHorseProfile(null);
        setOwnershipVerified(null);
      }
    };
    fetchHorseProfile();
  }, [tokenId]);

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
    <Box
      p={{ base: 6, md: 10 }}
      maxW="960px"
      mx="auto"
      bg="rgba(9, 14, 30, 0.82)"
      borderRadius="3xl"
      border="1px solid rgba(148, 163, 255, 0.22)"
      boxShadow="0 28px 70px rgba(4, 9, 24, 0.75)"
    >
      <Heading mb={4}>
        {item.name}
      </Heading>
      <Box h="250px" mb={4}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={marketData}>
            <XAxis dataKey="timestamp" hide />
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <ChartTooltip />
            <Line type="monotone" dataKey="price" stroke="#805AD5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      <Divider mb={4} />

      <VStack spacing={3} align="start" color="whiteAlpha.800">
        <Text>
          <strong>Age:</strong> {item.age}
        </Text>
        <Text>
          <strong>Trainer:</strong> {item.trainer}
        </Text>
        <Text>
          <strong>Record:</strong> {item.record}
        </Text>
        <Text>
          <strong>Earnings:</strong> {item.earnings}
        </Text>

        {sharePrice !== null && (
          <Text>
            <strong>Share Price:</strong> {sharePrice} wei
          </Text>
        )}
        {offeringShares !== null && (
          <Text>
            <strong>Total Shares:</strong> {offeringShares}
          </Text>
        )}
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
          <Text color="whiteAlpha.700">
            You command {sharesOwned} share{sharesOwned !== 1 && "s"} of this asset.
          </Text>
        )}
      </VStack>

      <HStack mt={6} spacing={4}>
        <Button variant="grey" size="sm">
          Shares: {sharesOwned ?? 0}
        </Button>
        <Button variant="grey" size="sm">
          Total Value: {latestPrice && sharesOwned ? (latestPrice * sharesOwned).toFixed(2) : 0}
        </Button>
      </HStack>

      <HStack mt={4} spacing={4}>
        <Button variant="cta" onClick={handleBuyShare} isLoading={isPreparing || isMinting}>
          Acquire share for 0.00001 ETH
        </Button>
        <Tooltip
          label="Allocation complete"
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
              <Text fontSize="sm" color="whiteAlpha.600">
                This projection is indicative. Chain activity may shift returns.
              </Text>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      {horseProfile && (
        <Box mt={6} w="100%">
          <Divider mb={4} />
          <Heading size="md" mb={2}>
            Ownership & Compliance
          </Heading>
          <VStack align="start" spacing={2} fontSize="sm">
            {horseProfile.name && (
              <Text>
                <strong>Registered Horse:</strong> {horseProfile.name}
              </Text>
            )}
            {horseProfile.trackLocation && (
              <Text>
                <strong>Primary Track:</strong> {horseProfile.trackLocation}
              </Text>
            )}
            {horseProfile.owner && horseProfile.owner !== ethers.ZeroAddress && (
              <Text>
                <strong>On-Chain Owner:</strong> {horseProfile.owner}
              </Text>
            )}
            {horseProfile.streamUrl && (
              <Text>
                <strong>Live Stream:</strong>{" "}
                <Link href={horseProfile.streamUrl} color="purple.600" isExternal>
                  Watch race feed
                </Link>
              </Text>
            )}
            {horseProfile.legalContractUri && (
              <Text>
                <strong>Legal Contract:</strong>{" "}
                <Link href={horseProfile.legalContractUri} color="cyan.300" isExternal>
                  View signed agreement
                </Link>
              </Text>
            )}
            {ownershipVerified !== null && (
              <Text color={ownershipVerified ? "green.300" : "red.400"} fontWeight="semibold">
                {ownershipVerified
                  ? "Ownership verified on-chain via legal contract reference."
                  : "Ownership verification pending or legal reference mismatch."}
              </Text>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default ItemDetail;
