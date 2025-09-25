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
  FormControl,
  FormLabel,
  Input,
  Badge,
  Stack,
  Link,
  Grid,
  GridItem,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
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
  const [buyQuantity, setBuyQuantity] = useState<number>(1);

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
    const quantity =
      Number.isFinite(buyQuantity) && buyQuantity > 0 ? Math.floor(buyQuantity) : 1;

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

    if (remainingSupply !== null && quantity > remainingSupply) {
      toast({
        title: "Not enough supply",
        description: `Only ${remainingSupply} share${remainingSupply === 1 ? "" : "s"} remain.`,
        status: "warning",
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
          lamports: sharePriceLamports * quantity,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      setSharesOwned((prev) => (prev ?? 0) + quantity);
      setMintedSoFar((prev) => (prev ?? 0) + quantity);
      setRemainingSupply((prev) =>
        prev !== null ? Math.max(prev - quantity, 0) : prev
      );

      toast({
        title: "Share purchased",
        description: `Sent ${(sharePriceSol * quantity).toFixed(3)} SOL to the treasury`,
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

  const priceChangePercent = useMemo(() => {
    if (marketData.length < 2) return null;
    const firstPrice = marketData[0].price;
    const lastPrice = marketData[marketData.length - 1].price;
    if (!Number.isFinite(firstPrice) || firstPrice === 0) return null;
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  }, [marketData]);

  const marketCapSol = useMemo(() => {
    if (!mintedSoFar || !Number.isFinite(sharePriceSol)) return 0;
    return mintedSoFar * sharePriceSol;
  }, [mintedSoFar, sharePriceSol]);

  const mintedProgress = useMemo(() => {
    if (!maxSupply || maxSupply <= 0 || mintedSoFar === null) return 0;
    return Math.min((mintedSoFar / maxSupply) * 100, 100);
  }, [maxSupply, mintedSoFar]);

  const estimatedCost = useMemo(() => {
    const quantity = Number.isFinite(buyQuantity) && buyQuantity > 0 ? buyQuantity : 1;
    return sharePriceSol * quantity;
  }, [buyQuantity, sharePriceSol]);

  const normalizedBuyQuantity = Math.max(
    1,
    Math.floor(Number.isFinite(buyQuantity) && buyQuantity > 0 ? buyQuantity : 1)
  );
  const remainingShares = remainingSupply ?? 0;
  const remainingSharesLabel = remainingShares === 1 ? "" : "s";

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
      maxW="1200px"
      mx="auto"
      p={{ base: 4, md: 10 }}
      bg="rgba(9, 14, 30, 0.82)"
      borderRadius="3xl"
      border="1px solid rgba(148, 163, 255, 0.22)"
      boxShadow="0 28px 70px rgba(4, 9, 24, 0.75)"
    >
      <Grid templateColumns={{ base: "1fr", xl: "1.7fr 1fr" }} gap={{ base: 8, md: 10 }}>
        <GridItem>
          <VStack spacing={6} align="stretch">
            <Box
              p={{ base: 5, md: 7 }}
              borderRadius="2xl"
              border="1px solid rgba(114, 140, 255, 0.2)"
              bg="rgba(15, 19, 40, 0.8)"
            >
              <Stack
                direction={{ base: "column", md: "row" }}
                spacing={{ base: 4, md: 6 }}
                align={{ base: "flex-start", md: "center" }}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  boxSize={{ base: "140px", md: "180px" }}
                  borderRadius="2xl"
                  objectFit="cover"
                />
                <VStack align="stretch" spacing={3} flex={1}>
                  <HStack spacing={3} flexWrap="wrap">
                    <Badge colorScheme="purple" borderRadius="full">
                      Variable asset
                    </Badge>
                    <Badge colorScheme="cyan" borderRadius="full">
                      Minted on Solana
                    </Badge>
                    <Badge colorScheme="pink" borderRadius="full">
                      {asset.totalShares} total shares
                    </Badge>
                  </HStack>
                  <Heading size="lg">{item.name}</Heading>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    {item.record}
                  </Text>
                  <SimpleGrid
                    columns={{ base: 1, sm: 2 }}
                    spacing={{ base: 3, md: 5 }}
                    pt={2}
                  >
                    <Stat>
                      <StatLabel>Latest price</StatLabel>
                      <StatNumber>
                        {latestPrice ? `${latestPrice.toFixed(3)} SOL` : "—"}
                      </StatNumber>
                      <StatHelpText>
                        {priceChangePercent !== null ? (
                          <>
                            <StatArrow
                              type={priceChangePercent >= 0 ? "increase" : "decrease"}
                            />
                            {Math.abs(priceChangePercent).toFixed(2)}%
                          </>
                        ) : (
                          "Awaiting data"
                        )}
                      </StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Market cap (SOL)</StatLabel>
                      <StatNumber>{marketCapSol.toFixed(2)}</StatNumber>
                      <StatHelpText>
                        {mintedSoFar ?? 0} of {maxSupply ?? 0} shares issued
                      </StatHelpText>
                    </Stat>
                  </SimpleGrid>
                </VStack>
              </Stack>
            </Box>

            <Box
              p={{ base: 4, md: 6 }}
              borderRadius="2xl"
              border="1px solid rgba(114, 140, 255, 0.2)"
              bg="rgba(15, 19, 40, 0.8)"
              minH="280px"
            >
              <Heading size="sm" mb={4}>
                CRABFURIE/SOL live feed
              </Heading>
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

            <Box
              p={{ base: 4, md: 6 }}
              borderRadius="2xl"
              border="1px solid rgba(114, 140, 255, 0.2)"
              bg="rgba(15, 19, 40, 0.8)"
            >
              <Heading size="sm" mb={3}>
                Signal summary
              </Heading>
              <VStack align="stretch" spacing={2} color="whiteAlpha.700" fontSize="sm">
                <Text>
                  Latest trade price: {latestPrice ? latestPrice.toFixed(3) : "-"} SOL
                </Text>
                <Text>
                  Mint address: {asset.mintAddress ? formatAddress(asset.mintAddress) : "—"}
                </Text>
                <Text>Treasury: {formatAddress(asset.treasury)}</Text>
                <Text>Share price: {sharePriceSol.toFixed(3)} SOL</Text>
                <Text>
                  Shares issued: {mintedSoFar ?? 0} / {maxSupply ?? 0}
                </Text>
                {remainingSupply !== null && (
                  <Text color={remainingSupply > 0 ? "green.300" : "red.300"}>
                    {remainingSupply > 0
                      ? `${remainingShares} share${remainingSharesLabel} remain`
                      : "All shares sold"}
                  </Text>
                )}
              </VStack>
            </Box>
          </VStack>
        </GridItem>

        <GridItem>
          <Stack spacing={6}>
            <Box
              p={{ base: 4, md: 6 }}
              borderRadius="2xl"
              border="1px solid rgba(114, 140, 255, 0.2)"
              bg="rgba(15, 19, 40, 0.85)"
            >
              <Heading size="sm" mb={2}>
                Trade desk
              </Heading>
              <Text fontSize="sm" color="whiteAlpha.700" mb={4}>
                Configure quantity and route directly to the bonding curve treasury.
              </Text>
              <FormControl mb={3}>
                <FormLabel fontSize="sm">Shares to acquire</FormLabel>
                <NumberInput
                  min={1}
                  max={remainingSupply ?? undefined}
                  value={buyQuantity}
                  onChange={(_, valueNumber) =>
                    setBuyQuantity(
                      Number.isFinite(valueNumber) && valueNumber > 0 ? valueNumber : 1
                    )
                  }
                  clampValueOnBlur={false}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <Text fontSize="sm" color="whiteAlpha.700" mb={4}>
                Estimated cost: {estimatedCost.toFixed(3)} SOL
              </Text>
              <HStack spacing={3} flexWrap="wrap">
                <Button variant="cta" onClick={handleBuyShare}>
                  Buy {normalizedBuyQuantity} share
                  {normalizedBuyQuantity === 1 ? "" : "s"}
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
              <Divider my={4} />
              <Text fontSize="sm" color="whiteAlpha.600">
                Remaining supply: {remainingShares} share{remainingSharesLabel}
              </Text>
            </Box>

            <Box
              p={{ base: 4, md: 6 }}
              borderRadius="2xl"
              border="1px solid rgba(114, 140, 255, 0.2)"
              bg="rgba(15, 19, 40, 0.85)"
            >
              <Heading size="sm" mb={3}>
                Portfolio snapshot
              </Heading>
              {sharesOwned !== null && (
                <Text color="whiteAlpha.700" mb={3}>
                  You command {sharesOwned} share{sharesOwned === 1 ? "" : "s"} of this asset.
                </Text>
              )}
              <HStack spacing={3} flexWrap="wrap" mb={4}>
                <Button variant="grey" size="sm">
                  Shares owned: {sharesOwned ?? 0}
                </Button>
                <Button variant="grey" size="sm">
                  Treasury price: {sharePriceSol.toFixed(3)} SOL
                </Button>
              </HStack>
              <Text fontSize="sm" color="whiteAlpha.700" mb={2}>
                Bonding curve progress
              </Text>
              <Progress
                value={mintedProgress}
                colorScheme="purple"
                bg="rgba(56, 65, 105, 0.6)"
                borderRadius="full"
                h={2}
                mb={2}
              />
              <Text fontSize="xs" color="whiteAlpha.600">
                {mintedSoFar ?? 0} minted / {maxSupply ?? 0} total · {remainingShares} left
              </Text>
            </Box>

            <Box
              p={{ base: 4, md: 6 }}
              borderRadius="2xl"
              border="1px solid rgba(114, 140, 255, 0.2)"
              bg="rgba(15, 19, 40, 0.85)"
            >
              <Heading size="sm" mb={3}>
                Projected earnings calculator
              </Heading>
              <VStack spacing={3} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm">Number of shares</FormLabel>
                  <Input
                    type="number"
                    value={calcShares}
                    onChange={(event) => setCalcShares(event.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Projected item earnings (SOL)</FormLabel>
                  <Input
                    type="number"
                    value={calcEarnings}
                    onChange={(event) => setCalcEarnings(event.target.value)}
                  />
                </FormControl>
                {calcShares && calcEarnings && maxSupply !== null && (
                  <Box
                    p={3}
                    borderRadius="lg"
                    bg="rgba(124, 58, 237, 0.16)"
                    border="1px solid rgba(124, 58, 237, 0.4)"
                  >
                    <Text fontWeight="semibold">
                      You would earn {projectedReturn} SOL
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.700">
                      ({ownershipPercent.toFixed(2)}% ownership of the pool)
                    </Text>
                  </Box>
                )}
                <Text fontSize="xs" color="whiteAlpha.600">
                  Estimates assume validator fees remain stable. Actual returns vary with
                  live treasury actions.
                </Text>
              </VStack>
            </Box>

            <Box
              p={{ base: 4, md: 6 }}
              borderRadius="2xl"
              border="1px solid rgba(114, 140, 255, 0.2)"
              bg="rgba(15, 19, 40, 0.85)"
            >
              <Heading size="sm" mb={3}>
                On-chain references
              </Heading>
              <VStack align="stretch" spacing={2} fontSize="sm">
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
          </Stack>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default ItemDetail;
