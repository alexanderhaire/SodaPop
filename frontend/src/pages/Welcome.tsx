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
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionSimpleGrid = motion(SimpleGrid);

const trendingCoins = [
  {
    name: "ASTRAL STEED",
    ticker: "$ASTRAL",
    change: 312,
    liquidity: "42.8 ETH",
    holders: "1,942",
    progress: 78,
  },
  {
    name: "NOVA RUNNER",
    ticker: "$NOVA",
    change: 188,
    liquidity: "26.1 ETH",
    holders: "1,104",
    progress: 64,
  },
  {
    name: "CELESTIAL ARC",
    ticker: "$ARC",
    change: 95,
    liquidity: "18.4 ETH",
    holders: "836",
    progress: 52,
  },
  {
    name: "ORION PROTOCOL",
    ticker: "$ORION",
    change: 451,
    liquidity: "61.7 ETH",
    holders: "2,408",
    progress: 92,
  },
];

const liveActivity = [
  {
    label: "Strategic capital infusion",
    amount: "12.5 ETH",
    token: "$ASTRAL",
    user: "Atlas Syndicate",
    ago: "2m",
  },
  {
    label: "Premier treasury entry",
    amount: "$3,400",
    token: "$ORION",
    user: "Luminous Desk",
    ago: "7m",
  },
  {
    label: "New curve ignition",
    amount: "Bonding curve",
    token: "$NOVA",
    user: "Specter Labs",
    ago: "11m",
  },
  {
    label: "Creator treasury unlock",
    amount: "$1,980",
    token: "$ARC",
    user: "Equinox Guild",
    ago: "19m",
  },
];

const launchChecklist = [
  "Curate cinematic key art",
  "Model token velocity & pricing",
  "Stage the liquidity vault",
  "Publish the legend dossier",
  "Broadcast to founding members",
];

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const audioContextRef = React.useRef<AudioContext | null>(null);
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

  const playLegendaryAnthem = React.useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    type AudioContextConstructor = typeof AudioContext;
    const AudioContextClass =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    const ctx = audioContextRef.current;
    if (!ctx) {
      return;
    }

    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch (error) {
        console.warn("Unable to resume audio context", error);
        return;
      }
    }

    const now = ctx.currentTime + 0.05;
    const chordProgression = [
      { freqs: [196, 247, 311, 392], duration: 0.9 },
      { freqs: [220, 277, 349, 440], duration: 0.9 },
      { freqs: [233, 293, 370, 466], duration: 0.9 },
      { freqs: [261, 329, 415, 523], duration: 1.2 },
    ];

    chordProgression.forEach((chord, chordIndex) => {
      const startTime = now + chordIndex * 0.7;
      chord.freqs.forEach((frequency, voiceIndex) => {
        const oscillator = ctx.createOscillator();
        oscillator.type = voiceIndex === 0 ? "sine" : voiceIndex === chord.freqs.length - 1 ? "triangle" : "sawtooth";
        const gain = ctx.createGain();
        const attack = 0.05;
        const release = 0.4;

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.6 / chord.freqs.length, startTime + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + chord.duration + release);

        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(startTime);
        oscillator.stop(startTime + chord.duration + release + 0.2);
      });
    });

    const noiseSource = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const channelData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < channelData.length; i += 1) {
      const fade = Math.pow(1 - i / channelData.length, 1.8);
      channelData[i] = (Math.random() * 2 - 1) * fade * 0.35;
    }
    noiseSource.buffer = noiseBuffer;

    const shimmerFilter = ctx.createBiquadFilter();
    shimmerFilter.type = "bandpass";
    shimmerFilter.frequency.setValueAtTime(620, now);
    shimmerFilter.Q.setValueAtTime(5.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(0.18, now + 0.25);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

    noiseSource.connect(shimmerFilter);
    shimmerFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 3.5);
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Launch simulation captured",
      description:
        "Your strategy deck is archived. Visit the Launch Forge to bring it on-chain.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    void playLegendaryAnthem();
    setFormValues({ tokenName: "", ticker: "", description: "", mediaUrl: "", liquidity: "" });
  };

  React.useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => undefined);
        audioContextRef.current = null;
      }
    };
  }, []);

  const handleLaunchClick = () => {
    void playLegendaryAnthem();
    navigate("/create");
  };

  const heroVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const gridVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };

  return (
    <MotionVStack
      spacing={14}
      align="stretch"
      pb={10}
      initial="hidden"
      animate="visible"
      variants={gridVariants}
    >
      <MotionBox
        position="relative"
        overflow="hidden"
        borderRadius="3xl"
        border="1px solid rgba(114, 140, 255, 0.25)"
        boxShadow="0 28px 65px rgba(8, 15, 32, 0.55)"
        maxH={{ base: "360px", md: "420px" }}
        width="100%"
        variants={heroVariants}
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
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(120deg, rgba(3,7,18,0.7) 10%, rgba(15, 23, 42, 0.25) 60%, rgba(8, 47, 73, 0.1) 100%)"
        />
      </MotionBox>
      <Flex
        direction={{ base: "column", xl: "row" }}
        gap={{ base: 10, xl: 16 }}
        align="stretch"
      >
        <MotionBox flex="1" variants={cardVariants}>
          <Badge
            colorScheme="cyan"
            variant="solid"
            borderRadius="full"
            px={3}
            py={1}
            textTransform="none"
            mb={4}
          >
            Legendary liquidity control center
          </Badge>
          <Heading
            size="2xl"
            maxW="520px"
            lineHeight={1.05}
            letterSpacing="tight"
          >
            Orchestrate legendary racing economies with on-chain precision.
          </Heading>
          <Text mt={6} color="whiteAlpha.700" maxW="540px" fontSize="lg">
            Architect tokenized stables, deploy adaptive bonding curves, and
            invite patrons into a theatre of pure velocity. Real-time telemetry,
            verifiable ownership, and cinematic storytelling unite to crown your
            champion.
          </Text>

          <HStack spacing={8} mt={10} flexWrap="wrap">
            <VStack align="flex-start" spacing={1}>
              <Heading size="lg">24K+</Heading>
              <Text fontSize="sm" color="whiteAlpha.600">
                digital bloodlines orchestrated
              </Text>
            </VStack>
            <VStack align="flex-start" spacing={1}>
              <Heading size="lg">$18.3M</Heading>
              <Text fontSize="sm" color="whiteAlpha.600">
                liquidity ignited
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
            onClick={handleLaunchClick}
          >
            Enter the Launch Forge
          </Button>
        </MotionBox>

        <MotionBox
          flexBasis={{ base: "100%", xl: "420px" }}
          bg="rgba(12, 18, 38, 0.88)"
          borderRadius="2xl"
          border="1px solid rgba(114, 140, 255, 0.2)"
          boxShadow="0 24px 60px rgba(9, 13, 32, 0.65)"
          p={{ base: 6, md: 8 }}
          variants={cardVariants}
        >
          <Heading size="md" mb={2}>
            Launch simulation console
          </Heading>
          <Text fontSize="sm" color="whiteAlpha.700" mb={6}>
            Compose your token's legend, align the treasury, and save the plan
            for ignition.
          </Text>

          <Box as="form" onSubmit={handleSubmit}>
            <Stack spacing={5}>
              <FormControl>
                <FormLabel fontSize="sm">Token name</FormLabel>
                <Input
                  name="tokenName"
                  placeholder="Aurora Vanguard"
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
                  placeholder="$AURA"
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
                  placeholder="Define the mythology and promise behind your champion..."
                  value={formValues.description}
                  onChange={handleChange}
                  variant="glass"
                  rows={4}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Immersive media URL</FormLabel>
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
                Archive strategy draft
              </Button>
              <Text fontSize="xs" color="whiteAlpha.500">
                Launching on-chain requires a connected wallet. Use this console
                to refine positioning before stepping into the live markets.
              </Text>
            </Stack>
          </Box>
        </MotionBox>
      </Flex>

        <MotionSimpleGrid
          columns={{ base: 1, xl: 3 }}
          spacing={{ base: 8, md: 10 }}
          variants={gridVariants}
        >
        <MotionBox gridColumn={{ base: "auto", xl: "span 2" }} variants={cardVariants}>
          <HStack justify="space-between" mb={6} spacing={4} align="baseline">
            <Heading size="lg">Trending curves</Heading>
            <Button variant="grey" size="sm" onClick={() => navigate("/items")}>
              View full board
            </Button>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {trendingCoins.map((coin) => (
              <MotionBox
                key={coin.ticker}
                bg="rgba(9, 14, 30, 0.82)"
                borderRadius="xl"
                border="1px solid rgba(114, 140, 255, 0.18)"
                p={6}
                whileHover={{ y: -6, borderColor: "rgba(167, 196, 255, 0.35)", boxShadow: "0 22px 55px rgba(8, 15, 32, 0.65)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
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
              </MotionBox>
            ))}
          </SimpleGrid>
        </MotionBox>

        <MotionVStack spacing={8} align="stretch" variants={cardVariants}>
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
                  transition="all 0.2s ease"
                  _hover={{ transform: "translateX(6px)", borderColor: "rgba(165, 180, 252, 0.4)" }}
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
        </MotionVStack>
      </MotionSimpleGrid>
    </MotionVStack>
  );
};

export default Welcome;
