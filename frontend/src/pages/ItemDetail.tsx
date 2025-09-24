import React, { useEffect, useMemo, useState } from "react";
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
  Badge,
  Stack,
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
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import axios from "../utils/axiosConfig";
import itemsData from "../mocks/items.json";
import assetsData from "../mocks/assets.json";
import { formatAddress } from "../utils/formatAddress";

type MarketDatum = { price: number; timestamp: string };

type Asset = {
  id: string;
  name: string;
  image: string;
  owner: string;
  sharePrice: number; // in SOL
  totalShares: number;
  treasury: string;
  mintAddress?: string;
  buyers: Partial<Record<string, number>>;
};

const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const item = useMemo(
    () => itemsData.find((candidate) => candidate.id === id),
    [id]
  );
  const asset = useMemo(
    () => (assetsData as Asset[]).find((candidate) => candidate.id === id),
    [id]
  );

  const [maxSupply, setMaxSupply] = useState<number | null>(null);
  const [mintedSoFar, setMintedSoFar] = useState<number | null>(null);
  const [remainingSupply, setRemainingSupply] = useState<number | null>(null);
  const [sharesOwned, setSharesOwned] = useState<number | null>(null);
  const [calcShares, setCalcShares] = useState<string>("");
  const [calcEarnings, setCalcEarnings] = useState<string>("");
  const [marketData, setMarketData] = useState<MarketDatum[]>([]);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!asset) {
      setMaxSupply(null);
      setMintedSoFar(null);
      setRemainingSupply(null);
      return;
    }

    const minted = Object.values(asset.buyers).reduce<number>(
      (acc, value) => acc + (value ?? 0),
      0
    );
    setMaxSupply(asset.totalShares);
    setMintedSoFar(minted);
    setRemainingSupply(Math.max(asset.totalShares - minted, 0));
  }, [asset]);

  useEffect(() => {
    if (!asset || !publicKey) {
      setSharesOwned(null);
      return;
    }
    const walletAddress = publicKey.toBase58();
    const entry = Object.entries(asset.buyers).find(
      ([holder]) => holder === walletAddress
    );
    setSharesOwned(entry ? entry[1] ?? 0 : 0);
  }, [asset, publicKey]);

  useEffect(() => {
    if (!id) return;
    const fetchMarket = async () => {
      try {
        const res = await axios.get(`/asset/market-data/${id}`);
        const data = res.data as MarketDatum;
        setMarketData((prev) => [...prev.slice(-19), data]);
        setLatestPrice(data.price);
      } catch (err) {
        console.error("Failed to load market data:", err);
      }
    };
    fetchMarket();
    const interval = setInterval(fetchMarket, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const sharePriceSol = asset?.sharePrice ?? 0;
  const sharePriceLamports = Math.round(sharePriceSol * LAMPORTS_PER_SOL);

  const handleBuyShare = async () => {
    if (!asset) return;
    if (!connected || !publicKey || !sendTransaction) {
      toast({
        title: "Connect your wallet",
        description: "Link a Solana wallet to purchase shares.",
        status: "error",
      });
      return;
    }

    if (!remainingSupply || remainingSupply <= 0) {
      toast({
        title: "Allocation complete",
        description: "All available shares have been issued.",
        status: "info",
      });
      return;
    }

    try {
      const treasury = new PublicKey(asset.treasury);
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      const transaction = new Transaction();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasury,
          lamports: sharePriceLamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      setSharesOwned((prev) => (prev ?? 0) + 1);
      setMintedSoFar((prev) => (prev ?? 0) + 1);
      setRemainingSupply((prev) => (prev !== null ? Math.max(prev - 1, 0) : prev));

      toast({
        title: "Share purchased",
        description: `Sent ${sharePriceSol.toFixed(3)} SOL to the treasury`,
        status: "success",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to send transaction:", err);
      toast({
        title: "Transaction failed",
        description: message,
        status: "error",
      });
    }
  };

  const projectedReturn = useMemo(() => {
    if (!calcShares || !calcEarnings || !maxSupply) return "0";
    const shares = Number(calcShares);
    const earningsSol = Number(calcEarnings);
    if (!Number.isFinite(shares) || !Number.isFinite(earningsSol) || shares <= 0) {
      return "0";
    }
    const shareOfPool = shares / maxSupply;
    return (shareOfPool * earningsSol).toFixed(3);
  }, [calcShares, calcEarnings, maxSupply]);

  const ownershipPercent = useMemo(() => {
    if (!calcShares || !maxSupply) return 0;
    const shares = Number(calcShares);
    if (!Number.isFinite(shares) || shares <= 0) return 0;
    return (shares / maxSupply) * 100;
  }, [calcShares, maxSupply]);

  if (!item || !asset) {
    return (
      <Box p={6}>
        <Heading>Item not found</Heading>
        <Text>No item with ID: {id}</Text>
      </Box>
    );
  }

  return (
    <Box
      maxW="960px"
      mx="auto"
      p={{ base: 6, md: 10 }}
      bg="rgba(9, 14, 30, 0.82)"
      borderRadius="3xl"
      border="1px solid rgba(148, 163, 255, 0.22)"
      boxShadow="0 28px 70px rgba(4, 9, 24, 0.75)"
    >
      <VStack align="stretch" spacing={6}>
        <HStack align={{ base: "stretch", md: "center" }} spacing={6}>
          <Image
            src={item.image}
            alt={item.name}
            boxSize={{ base: "160px", md: "200px" }}
            borderRadius="2xl"
            objectFit="cover"
          />
          <Box>
            <Heading size="lg" mb={1}>
              {item.name}
            </Heading>
            <Text color="whiteAlpha.700" fontSize="sm" mb={3}>
              {item.record}
            </Text>
            <HStack spacing={3} flexWrap="wrap">
              <Badge colorScheme="purple">Variable asset</Badge>
              <Badge colorScheme="cyan">Minted on Solana</Badge>
              <Badge colorScheme="pink">{asset.totalShares} total shares</Badge>
            </HStack>
          </Box>
        </HStack>

        <Divider />

        <Stack direction={{ base: "column", md: "row" }} spacing={6}>
          <Box
            flex="1"
            bg="rgba(12, 18, 38, 0.9)"
            borderRadius="2xl"
            border="1px solid rgba(114, 140, 255, 0.2)"
            p={4}
            minH="260px"
          >
            {marketData.length === 0 ? (
              <Text color="whiteAlpha.600">Streaming market data…</Text>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketData}>
                  <XAxis dataKey="timestamp" hide />
                  <YAxis stroke="#cbd5f5" tick={{ fill: "#cbd5f5" }} />
                  <ChartTooltip />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Box>

          <VStack
            flex="0.45"
            bg="rgba(12, 18, 38, 0.9)"
            borderRadius="2xl"
            border="1px solid rgba(114, 140, 255, 0.2)"
            p={5}
            spacing={3}
            align="stretch"
          >
            <Heading size="sm">Signal summary</Heading>
            <Text color="whiteAlpha.700">
              Latest trade price: {latestPrice ? latestPrice.toFixed(3) : "-"} SOL
            </Text>
            <Text color="whiteAlpha.700">
              Mint address: {asset.mintAddress ? formatAddress(asset.mintAddress) : "—"}
            </Text>
            <Text color="whiteAlpha.700">
              Treasury: {formatAddress(asset.treasury)}
            </Text>
            <Text color="whiteAlpha.700">
              Share price: {sharePriceSol.toFixed(3)} SOL
            </Text>
            <Text color="whiteAlpha.700">
              Shares issued: {mintedSoFar ?? 0} / {maxSupply ?? 0}
            </Text>
            {remainingSupply !== null && (
              <Text color={remainingSupply > 0 ? "green.300" : "red.300"}>
                {remainingSupply > 0
                  ? `${remainingSupply} shares remain`
                  : "All shares sold"}
              </Text>
            )}
          </VStack>
        </Stack>

        <VStack align="stretch" spacing={3}>
          <Heading size="md">Share controls</Heading>
          {sharesOwned !== null && (
            <Text color="whiteAlpha.700">
              You command {sharesOwned} share{sharesOwned === 1 ? "" : "s"} of this asset.
            </Text>
          )}
          <HStack spacing={4} wrap="wrap">
            <Button variant="grey" size="sm">
              Shares owned: {sharesOwned ?? 0}
            </Button>
            <Button variant="grey" size="sm">
              Treasury price: {sharePriceSol.toFixed(3)} SOL
            </Button>
          </HStack>
          <HStack mt={2} spacing={4} wrap="wrap">
            <Button variant="cta" onClick={handleBuyShare}>
              Acquire share for {sharePriceSol.toFixed(3)} SOL
            </Button>
            <Tooltip
              label="Allocation complete"
              isDisabled={remainingSupply !== null && remainingSupply > 0}
            >
              <Button
                variant="grey"
                size="sm"
                onClick={() =>
                  toast({
                    title: "Bulk purchase",
                    description:
                      "Treasury purchases are handled off-chain for compliance.",
                    status: "info",
                  })
                }
              >
                Buy Max
              </Button>
            </Tooltip>
          </HStack>
        </VStack>

        <Accordion allowToggle>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Projected earnings
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack spacing={3} align="stretch">
                <FormControl>
                  <FormLabel>Number of Shares</FormLabel>
                  <Input
                    type="number"
                    value={calcShares}
                    onChange={(event) => setCalcShares(event.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Projected Item Earnings (SOL)</FormLabel>
                  <Input
                    type="number"
                    value={calcEarnings}
                    onChange={(event) => setCalcEarnings(event.target.value)}
                  />
                </FormControl>
                {calcShares && calcEarnings && maxSupply !== null && (
                  <Text>
                    You would earn {projectedReturn} SOL ({ownershipPercent.toFixed(2)}%
                    ownership)
                  </Text>
                )}
                <Text fontSize="sm" color="whiteAlpha.600">
                  This projection is indicative. Live treasury actions and validator fees may
                  adjust returns.
                </Text>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Box>
          <Divider my={4} />
          <Heading size="md" mb={2}>
            On-chain references
          </Heading>
          <VStack align="start" spacing={2} fontSize="sm">
            {asset.mintAddress && (
              <Text>
                <strong>Mint:</strong>{" "}
                <Link
                  href={`https://explorer.solana.com/address/${asset.mintAddress}?cluster=devnet`}
                  color="cyan.300"
                  isExternal
                >
                  {asset.mintAddress}
                </Link>
              </Text>
            )}
            <Text>
              <strong>Treasury:</strong>{" "}
              <Link
                href={`https://explorer.solana.com/address/${asset.treasury}?cluster=devnet`}
                color="cyan.300"
                isExternal
              >
                {asset.treasury}
              </Link>
            </Text>
            <Text>
              <strong>Manager:</strong> {formatAddress(asset.owner)}
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default ItemDetail;
