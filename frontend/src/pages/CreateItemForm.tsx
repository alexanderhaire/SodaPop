import { useMemo, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Code,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { Hex, parseUnits } from "viem";
import {
  getTokenFactoryAddress,
  tokenFactoryAbi,
  tryDecodeTokenCreatedLog,
} from "../utils/tokenFactory";

const DEFAULT_DECIMALS = 18;

interface DeployState {
  txHash?: `0x${string}`;
  tokenAddress?: `0x${string}`;
  error?: string;
}

const formatHash = (hash?: `0x${string}`) => {
  if (!hash) return "";
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
};

const CreateItemForm = () => {
  const toast = useToast();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("1000000");
  const [state, setState] = useState<DeployState>({});
  const [isDeploying, setIsDeploying] = useState(false);

  const factoryAddress = useMemo(() => {
    try {
      return getTokenFactoryAddress();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Token factory address missing";
      setState((prev) => ({ ...prev, error: message }));
      return undefined;
    }
  }, []);

  const resetStatus = () => setState({});

  const handleDeploy = async (event: React.FormEvent) => {
    event.preventDefault();
    resetStatus();

    if (!walletClient || !publicClient || !factoryAddress) {
      toast({
        title: "Wallet not connected",
        description: "Connect your wallet to deploy a token.",
        status: "error",
      });
      return;
    }

    const trimmedName = name.trim();
    const trimmedSymbol = symbol.trim();

    if (!trimmedName || !trimmedSymbol) {
      toast({
        title: "Missing token metadata",
        description: "Provide both a token name and symbol.",
        status: "error",
      });
      return;
    }

    let supply: bigint;
    try {
      supply = parseUnits(initialSupply, DEFAULT_DECIMALS);
    } catch (err) {
      toast({
        title: "Invalid supply",
        description: "Enter a numeric initial supply.",
        status: "error",
      });
      return;
    }

    if (supply <= 0n) {
      toast({
        title: "Invalid supply",
        description: "Initial supply must be greater than zero.",
        status: "error",
      });
      return;
    }

    setIsDeploying(true);

    try {
      const hash = await walletClient.writeContract({
        address: factoryAddress,
        abi: tokenFactoryAbi,
        functionName: "createToken",
        args: [trimmedName, trimmedSymbol.toUpperCase(), supply],
        account: walletClient.account,
      });

      setState({ txHash: hash });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      let createdToken: `0x${string}` | undefined;

      for (const log of receipt.logs) {
        const decoded = tryDecodeTokenCreatedLog(log);
        if (decoded && decoded.owner.toLowerCase() === address?.toLowerCase()) {
          createdToken = decoded.token;
          break;
        }
      }

      setState({ txHash: hash, tokenAddress: createdToken });

      toast({
        title: "Token deployed",
        description: createdToken
          ? `Token contract deployed at ${createdToken}`
          : "Transaction confirmed.",
        status: "success",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to deploy token";
      console.error("Token deployment failed", err);
      setState({ error: message });
      toast({ title: "Deployment failed", description: message, status: "error" });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Box
      maxW="720px"
      mx="auto"
      p={{ base: 6, md: 10 }}
      bg="rgba(9, 14, 30, 0.82)"
      borderRadius="3xl"
      border="1px solid rgba(148, 163, 255, 0.22)"
      boxShadow="0 28px 70px rgba(4, 9, 24, 0.75)"
    >
      <VStack spacing={8} align="stretch">
        <Stack spacing={2}>
          <Heading size="lg">Spin up a token</Heading>
          <Text color="whiteAlpha.700" fontSize="sm">
            Configure a name, symbol, and initial supply. Your wallet will sign a
            single transaction that deploys a minimal ERC-20 and mints the full
            supply to you.
          </Text>
        </Stack>

        {!isConnected && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Stack spacing={1}>
              <AlertTitle>Connect your wallet</AlertTitle>
              <AlertDescription>
                You need to connect a wallet to deploy tokens through the
                factory.
              </AlertDescription>
            </Stack>
          </Alert>
        )}

        {state.error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Unable to deploy token</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <Box as="form" onSubmit={handleDeploy}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl isRequired>
              <FormLabel>Token name</FormLabel>
              <Input
                placeholder="SodaPop"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Symbol</FormLabel>
              <Input
                placeholder="SODA"
                value={symbol}
                textTransform="uppercase"
                onChange={(event) => setSymbol(event.target.value.toUpperCase())}
              />
              <FormHelperText>3-8 characters works best.</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Initial supply</FormLabel>
              <Input
                placeholder="1000000"
                value={initialSupply}
                onChange={(event) => setInitialSupply(event.target.value)}
              />
              <FormHelperText>
                Minted with {DEFAULT_DECIMALS} decimals directly to your wallet.
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Factory contract</FormLabel>
              <Input value={factoryAddress ?? "Not configured"} isReadOnly />
              <FormHelperText>
                Update <Code>VITE_TOKEN_FACTORY_ADDRESS</Code> to point at your
                deployment.
              </FormHelperText>
            </FormControl>
          </SimpleGrid>

          <Divider my={8} borderColor="rgba(148, 163, 255, 0.24)" />

          <Button
            type="submit"
            variant="cta"
            size="lg"
            width="100%"
            isLoading={isDeploying}
            loadingText="Deploying token"
            isDisabled={!isConnected || !factoryAddress}
          >
            Launch token
          </Button>
        </Box>

        {(state.txHash || state.tokenAddress) && (
          <Stack spacing={4}>
            {state.txHash && (
              <Box>
                <Text fontWeight="semibold" mb={1}>
                  Transaction hash
                </Text>
                <Code>{formatHash(state.txHash)}</Code>
              </Box>
            )}

            {state.tokenAddress && (
              <Box>
                <Text fontWeight="semibold" mb={1}>
                  Token address
                </Text>
                <Code>{state.tokenAddress}</Code>
              </Box>
            )}
          </Stack>
        )}
      </VStack>
    </Box>
  );
};

export default CreateItemForm;
