import React from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { TriangleUpIcon, TimeIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

const trendingCoins = [
  {
    name: "SODA",
    ticker: "$SODA",
    change: 312,
    liquidity: "42.8 ETH",
    holders: "1,942",
    progress: 78,
  },
  {
    name: "FIZZ",
    ticker: "$FIZZ",
    change: 188,
    liquidity: "26.1 ETH",
    holders: "1,104",
    progress: 64,
  },
  {
    name: "BUBBLES",
    ticker: "$BUBS",
    change: 95,
    liquidity: "18.4 ETH",
    holders: "836",
    progress: 52,
  },
  {
    name: "HYPERPOP",
    ticker: "$HYPE",
    change: 451,
    liquidity: "61.7 ETH",
    holders: "2,408",
    progress: 92,
  },
];

const liveActivity = [
  {
    label: "Liquidity added",
    amount: "12.5 ETH",
    token: "$SODA",
    user: "0x3f...d2",
    ago: "2m",
  },
  {
    label: "Top buy",
    amount: "$3,400",
    token: "$HYPE",
    user: "0xa1...44",
    ago: "7m",
  },
  {
    label: "New deploy",
    amount: "Bonding curve",
    token: "$FIZZ",
    user: "0xbd...9c",
    ago: "11m",
  },
  {
    label: "Creator cashout",
    amount: "$1,980",
    token: "$BUBS",
    user: "0x5c...bf",
    ago: "19m",
  },
];

const launchChecklist = [
  "Upload viral artwork",
  "Set fair launch price",
  "Seed initial liquidity",
  "Publish meme lore",
  "Ping the community",
];

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formValues, setFormValues] = React.useState({
    tokenName: "",
    ticker: "",
    description: "",
    mediaUrl: "",
    liquidity: "",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Launch sequence primed",
      description:
        "Your bonding curve configuration is saved. Head to Launch to deploy for real.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    setFormValues({ tokenName: "", ticker: "", description: "", mediaUrl: "", liquidity: "" });
  };

  return (
    <VStack spacing={14} align="stretch" pb={10}>
      <Box
        position="relative"
        overflow="hidden"
        borderRadius="3xl"
        border="1px solid rgba(114, 140, 255, 0.25)"
        boxShadow="0 28px 65px rgba(8, 15, 32, 0.55)"
        maxH={{ base: "360px", md: "420px" }}
        width="100%"
      >
        <Box
          as="video"
          src="/videos/launch-loop.mp4"
          autoPlay
          muted
          loop
          playsInline
          display="block"
          objectFit="cover"
          width="100%"
          height="100%"
          aria-label="SodaPop hero preview"
        />
      </Box>
      <Flex
        direction={{ base: "column", xl: "row" }}
        gap={{ base: 10, xl: 16 }}
        align="stretch"
      >
        <Box flex="1">
          <Badge
            colorScheme="cyan"
            variant="solid"
            borderRadius="full"
            px={3}
            py={1}
            textTransform="none"
            mb={4}
          >
            The internet's liquidity hub for champion horses
          </Badge>
          <Heading
            size="2xl"
            maxW="520px"
            lineHeight={1.05}
            letterSpacing="tight"
          >
            Win the next Derby by fueling your stable's liquidity.
          </Heading>
          <Text mt={6} color="whiteAlpha.700" maxW="540px" fontSize="lg">
            Spin up a bonding curve, seed liquidity and let the community ape in.
            Transparent pricing, creator safety nets and live market telemetry
            straight from the chain.
          </Text>

          <HStack spacing={8} mt={10} flexWrap="wrap">
            <VStack align="flex-start" spacing={1}>
              <Heading size="lg">24K+</Heading>
              <Text fontSize="sm" color="whiteAlpha.600">
                coins deployed
              </Text>
            </VStack>
            <VStack align="flex-start" spacing={1}>
              <Heading size="lg">$18.3M</Heading>
              <Text fontSize="sm" color="whiteAlpha.600">
                liquidity launched
              </Text>
            </VStack>
            <VStack align="flex-start" spacing={1}>
              <Heading size="lg">98%</Heading>
              <Text fontSize="sm" color="whiteAlpha.600">
                creator retention
              </Text>
            </VStack>
          </HStack>

          <Button
            variant="cta"
            size="lg"
            mt={12}
            onClick={() => navigate("/create")}
          >
            Open Launch Console
          </Button>
        </Box>

        <Box
          flexBasis={{ base: "100%", xl: "420px" }}
          bg="rgba(12, 18, 38, 0.88)"
          borderRadius="2xl"
          border="1px solid rgba(114, 140, 255, 0.2)"
          boxShadow="0 24px 60px rgba(9, 13, 32, 0.65)"
          p={{ base: 6, md: 8 }}
        >
          <Heading size="md" mb={2}>
            Quick launch mockup
          </Heading>
          <Text fontSize="sm" color="whiteAlpha.700" mb={6}>
            Preview your coin profile before you deploy on-chain.
          </Text>

          <Box as="form" onSubmit={handleSubmit}>
            <Stack spacing={5}>
              <FormControl>
                <FormLabel fontSize="sm">Token name</FormLabel>
                <Input
                  name="tokenName"
                  placeholder="Soda Pop Inu"
                  value={formValues.tokenName}
                  onChange={handleChange}
                  variant="glass"
                  size="lg"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Ticker</FormLabel>
                <Input
                  name="ticker"
                  placeholder="$SODA"
                  value={formValues.ticker}
                  onChange={handleChange}
                  variant="glass"
                  size="lg"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Launch lore</FormLabel>
                <Textarea
                  name="description"
                  placeholder="Tell degen Twitter why this one hits different..."
                  value={formValues.description}
                  onChange={handleChange}
                  variant="glass"
                  rows={4}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Media or meme URL</FormLabel>
                <Input
                  name="mediaUrl"
                  placeholder="https://"
                  value={formValues.mediaUrl}
                  onChange={handleChange}
                  variant="glass"
                  size="lg"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Seed liquidity (ETH)</FormLabel>
                <Input
                  name="liquidity"
                  placeholder="5"
                  value={formValues.liquidity}
                  onChange={handleChange}
                  variant="glass"
                  size="lg"
                />
              </FormControl>

              <Button type="submit" variant="cta" size="lg">
                Stage launch plan
              </Button>
              <Text fontSize="xs" color="whiteAlpha.500">
                Launching on-chain requires a connected wallet. This mock console
                helps you prepare assets and messaging before going live.
              </Text>
            </Stack>
          </Box>
        </Box>
      </Flex>

      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={{ base: 8, md: 10 }}>
        <Box gridColumn={{ base: "auto", xl: "span 2" }}>
          <HStack justify="space-between" mb={6} spacing={4} align="baseline">
            <Heading size="lg">Trending curves</Heading>
            <Button variant="grey" size="sm" onClick={() => navigate("/items")}>
              View full board
            </Button>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {trendingCoins.map((coin) => (
              <Box
                key={coin.ticker}
                bg="rgba(9, 14, 30, 0.82)"
                borderRadius="xl"
                border="1px solid rgba(114, 140, 255, 0.18)"
                p={6}
                transition="all 0.2s ease"
                _hover={{
                  transform: "translateY(-4px)",
                  borderColor: "rgba(167, 196, 255, 0.35)",
                  boxShadow: "0 18px 45px rgba(8, 15, 32, 0.6)",
                }}
              >
                <HStack justify="space-between" mb={4}>
                  <VStack align="flex-start" spacing={0}>
                    <Heading size="md">{coin.name}</Heading>
                    <Text fontSize="sm" color="whiteAlpha.600">
                      {coin.ticker}
                    </Text>
                  </VStack>
                  <Badge
                    colorScheme="green"
                    variant="subtle"
                    display="flex"
                    alignItems="center"
                    gap={1}
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    <TriangleUpIcon /> {coin.change}%
                  </Badge>
                </HStack>
                <Progress
                  value={coin.progress}
                  colorScheme="cyan"
                  size="sm"
                  borderRadius="full"
                  mb={4}
                  bg="rgba(255, 255, 255, 0.08)"
                />
                <HStack spacing={8} fontSize="sm" color="whiteAlpha.700">
                  <Text>{coin.liquidity} liquidity</Text>
                  <Text>{coin.holders} holders</Text>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        <VStack spacing={8} align="stretch">
          <Box
            bg="rgba(9, 14, 30, 0.82)"
            borderRadius="xl"
            border="1px solid rgba(114, 140, 255, 0.18)"
            p={6}
          >
            <HStack justify="space-between" mb={4}>
              <Heading size="md">Live activity</Heading>
              <Badge
                colorScheme="purple"
                display="flex"
                alignItems="center"
                gap={1}
                borderRadius="full"
                px={3}
                py={1}
              >
                <TimeIcon /> real-time
              </Badge>
            </HStack>
            <VStack spacing={4} align="stretch">
              {liveActivity.map((item) => (
                <Box
                  key={`${item.user}-${item.token}`}
                  borderRadius="lg"
                  border="1px solid rgba(114, 140, 255, 0.14)"
                  p={4}
                  bg="rgba(14, 20, 40, 0.6)"
                >
                  <HStack justify="space-between" fontSize="sm" mb={1}>
                    <Text color="whiteAlpha.700">{item.label}</Text>
                    <Badge colorScheme="cyan" borderRadius="full">
                      {item.ago} ago
                    </Badge>
                  </HStack>
                  <Text fontWeight="semibold">{item.amount}</Text>
                  <Text fontSize="sm" color="whiteAlpha.600">
                    {item.user} • {item.token}
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>

          <Box
            bg="rgba(9, 14, 30, 0.82)"
            borderRadius="xl"
            border="1px solid rgba(114, 140, 255, 0.18)"
            p={6}
          >
            <Heading size="md" mb={4}>
              Launch checklist
            </Heading>
            <VStack spacing={3} align="stretch">
              {launchChecklist.map((item) => (
                <HStack
                  key={item}
                  borderRadius="lg"
                  border="1px solid rgba(114, 140, 255, 0.14)"
                  px={4}
                  py={3}
                  bg="rgba(14, 20, 40, 0.6)"
                  justify="space-between"
                >
                  <Text fontSize="sm" color="whiteAlpha.800">
                    {item}
                  </Text>
                  <Badge colorScheme="cyan" variant="subtle" borderRadius="full">
                    Ready
                  </Badge>
                </HStack>
              ))}
            </VStack>
            <Divider my={6} borderColor="rgba(114, 140, 255, 0.2)" />
            <Button variant="cta" width="full" size="md" onClick={() => navigate("/create")}>
              Go to Launch Console
            </Button>
          </Box>
        </VStack>
      </SimpleGrid>
    </VStack>
  );
};

export default Welcome;
