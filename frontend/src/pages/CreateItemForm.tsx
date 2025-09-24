import { useMemo, useRef, useState } from "react";
import { AttachmentIcon } from "@chakra-ui/icons";
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
  GridItem,
  Heading,
  HStack,
  Image,
  Input,
  SimpleGrid,
  Stack,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  Keypair,
  SystemProgram,
  Transaction,
  TransactionSignature,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";

const DEFAULT_DECIMALS = 9;

interface DeployState {
  signature?: TransactionSignature;
  mintAddress?: string;
  tokenAccount?: string;
  error?: string;
}

const formatSignature = (signature?: string) => {
  if (!signature) return "";
  return `${signature.slice(0, 8)}…${signature.slice(-6)}`;
};

const formatFileSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${bytes} B`;
};

const parseTokenSupply = (raw: string, decimals: number): bigint => {
  const cleaned = raw.replace(/,/g, "").trim();
  if (!cleaned) {
    throw new Error("Initial supply is required");
  }

  if (!/^\d+(\.\d+)?$/.test(cleaned)) {
    throw new Error("Supply must be a positive number");
  }

  const [whole, fraction = ""] = cleaned.split(".");
  const paddedFraction = fraction.slice(0, decimals).padEnd(decimals, "0");

  const wholeUnits = BigInt(whole || "0") * 10n ** BigInt(decimals);
  const fractionUnits = paddedFraction ? BigInt(paddedFraction) : 0n;

  return wholeUnits + fractionUnits;
};

const CreateItemForm = () => {
  const toast = useToast();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("1000000");
  const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(null);
  const [documentAttachment, setDocumentAttachment] = useState<{ file: File } | null>(
    null
  );
  const [state, setState] = useState<DeployState>({});
  const [isDeploying, setIsDeploying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);

  const networkEndpoint = useMemo(() => connection.rpcEndpoint, [connection]);

  const resetStatus = () => setState({});

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setPhoto(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Unsupported file",
        description: "Select an image file (PNG, JPG, or GIF).",
        status: "error",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "Keep the upload under 5 MB for a smooth preview.",
        status: "error",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhoto({ file, preview: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoReset = () => {
    setPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setDocumentAttachment(null);
      return;
    }

    const allowedTypes = new Set([
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/rtf",
      "text/markdown",
    ]);

    const allowedByPrefix = file.type.startsWith("text/");

    if (file.type && !allowedTypes.has(file.type) && !allowedByPrefix) {
      toast({
        title: "Unsupported document",
        description: "Upload a PDF, text, or Word document.",
        status: "error",
      });
      if (documentInputRef.current) {
        documentInputRef.current.value = "";
      }
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Document too large",
        description: "Keep supporting files under 10 MB.",
        status: "error",
      });
      if (documentInputRef.current) {
        documentInputRef.current.value = "";
      }
      return;
    }

    setDocumentAttachment({ file });
  };

  const handleDocumentReset = () => {
    setDocumentAttachment(null);
    if (documentInputRef.current) {
      documentInputRef.current.value = "";
    }
  };

  const handleDeploy = async (event: React.FormEvent) => {
    event.preventDefault();
    resetStatus();

    if (!publicKey || !connected || !sendTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Connect a Solana wallet to deploy a token.",
        status: "error",
      });
      return;
    }

    const walletAddress = publicKey.toBase58();

    const trimmedName = name.trim();
    const trimmedSymbol = symbol.trim().toUpperCase();

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
      supply = parseTokenSupply(initialSupply, DEFAULT_DECIMALS);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid supply";
      toast({ title: "Invalid supply", description: message, status: "error" });
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
      const mintKeypair = Keypair.generate();
      const associatedTokenAccount = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        publicKey
      );

      const rentExemption = await getMinimumBalanceForRentExemptMint(connection);
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      const transaction = new Transaction();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports: rentExemption,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          DEFAULT_DECIMALS,
          publicKey,
          publicKey,
          TOKEN_PROGRAM_ID
        ),
        createAssociatedTokenAccountInstruction(
          publicKey,
          associatedTokenAccount,
          publicKey,
          mintKeypair.publicKey,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        ),
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedTokenAccount,
          publicKey,
          supply,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      const signature = await sendTransaction(transaction, connection, {
        signers: [mintKeypair],
      });

      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      const mintAddress = mintKeypair.publicKey.toBase58();
      const tokenAccountAddress = associatedTokenAccount.toBase58();

      setState({
        signature,
        mintAddress,
        tokenAccount: tokenAccountAddress,
      });

      let persistError: Error | null = null;
      try {
        const response = await fetch("/api/tokens/record", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            tx: signature,
            mint: mintAddress,
            ata: tokenAccountAddress,
            amount: supply.toString(),
            name: trimmedName,
            symbol: trimmedSymbol,
            imageUrl: photo?.preview ?? undefined,
            creatorWallet: walletAddress,
            decimals: DEFAULT_DECIMALS,
          }),
        });

        if (!response.ok) {
          let message = "Failed to record token launch";
          try {
            const payload = await response.json();
            if (payload && typeof payload.error === "string") {
              message = payload.error;
            }
          } catch (parseErr) {
            console.warn("Unable to parse record-token response", parseErr);
          }
          throw new Error(message);
        }

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["spotlight"] }),
          queryClient.invalidateQueries({ queryKey: ["portfolio", walletAddress] }),
        ]);
      } catch (err) {
        console.error("Failed to persist launched token", err);
        persistError = err instanceof Error ? err : new Error("Failed to persist launched token");
      }

      toast({
        title: `${trimmedSymbol} token minted`,
        description: persistError
          ? `${trimmedName} launched on-chain, but syncing with Spotlight failed: ${persistError.message}`
          : `${trimmedName} successfully launched on Solana. Spotlight and your portfolio are updating now.`,
        status: persistError ? "warning" : "success",
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
          <Heading size="lg">Spin up a Solana token</Heading>
          <Text color="whiteAlpha.700" fontSize="sm">
            Configure a name, symbol, and initial supply. Your wallet will sign a
            transaction that deploys a mint, creates your associated token
            account, and deposits the full supply to you.
          </Text>
        </Stack>

        {!connected && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Stack spacing={1}>
              <AlertTitle>Connect your wallet</AlertTitle>
              <AlertDescription>
                You need to connect a Solana wallet to deploy tokens through the
                launcher.
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
              <FormLabel>RPC endpoint</FormLabel>
              <Input value={networkEndpoint} isReadOnly />
              <FormHelperText>
                Configure <Code>VITE_SOLANA_RPC_URL</Code> to target a custom cluster.
              </FormHelperText>
            </FormControl>

            <GridItem colSpan={{ base: 1, md: 2 }}>
              <FormControl>
                <FormLabel>Profile photo</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                />
                <FormHelperText>
                  Optional hero image for your token dossier. The file never
                  leaves your browser, stays under 5 MB, and can be included in
                  off-chain metadata later.
                </FormHelperText>
              </FormControl>

              {photo?.preview && (
                <HStack
                  mt={4}
                  spacing={4}
                  align="flex-start"
                  bg="rgba(12, 18, 38, 0.7)"
                  borderRadius="xl"
                  border="1px solid rgba(114, 140, 255, 0.26)"
                  p={4}
                >
                  <Image
                    src={photo.preview}
                    alt={photo.file.name}
                    boxSize="96px"
                    borderRadius="lg"
                    objectFit="cover"
                  />
                  <Stack spacing={2} fontSize="sm">
                    <Box>
                      <Text fontWeight="semibold">{photo.file.name}</Text>
                      <Text color="whiteAlpha.700">
                        {formatFileSize(photo.file.size)}
                      </Text>
                    </Box>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="purple"
                      alignSelf="flex-start"
                      onClick={handlePhotoReset}
                    >
                      Remove photo
                    </Button>
                  </Stack>
                </HStack>
              )}
            </GridItem>

            <GridItem colSpan={{ base: 1, md: 2 }}>
              <FormControl>
                <FormLabel>Supporting document</FormLabel>
                <Input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx,.rtf,.md"
                  ref={documentInputRef}
                  onChange={handleDocumentChange}
                />
                <FormHelperText>
                  Optional launch brief or dossier. Files never leave your
                  browser and stay under 10 MB.
                </FormHelperText>
              </FormControl>

              {documentAttachment && (
                <HStack
                  mt={4}
                  spacing={4}
                  align="flex-start"
                  bg="rgba(12, 18, 38, 0.7)"
                  borderRadius="xl"
                  border="1px solid rgba(114, 140, 255, 0.26)"
                  p={4}
                >
                  <Box
                    bg="rgba(148, 163, 255, 0.16)"
                    borderRadius="lg"
                    p={3}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <AttachmentIcon boxSize={6} color="purple.200" />
                  </Box>
                  <Stack spacing={2} fontSize="sm">
                    <Box>
                      <Text fontWeight="semibold">
                        {documentAttachment.file.name}
                      </Text>
                      <Text color="whiteAlpha.700">
                        {formatFileSize(documentAttachment.file.size)}
                      </Text>
                    </Box>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="purple"
                      alignSelf="flex-start"
                      onClick={handleDocumentReset}
                    >
                      Remove document
                    </Button>
                  </Stack>
                </HStack>
              )}
            </GridItem>
          </SimpleGrid>

          <Divider my={8} borderColor="rgba(148, 163, 255, 0.24)" />

          <Button
            type="submit"
            variant="cta"
            size="lg"
            width="100%"
            isLoading={isDeploying}
            loadingText="Deploying token"
            isDisabled={!connected}
          >
            Launch token
          </Button>
        </Box>

        {(state.signature || state.mintAddress) && (
          <Stack spacing={4}>
            {state.signature && (
              <Box>
                <Text fontWeight="semibold" mb={1}>
                  Transaction signature
                </Text>
                <Code>{formatSignature(state.signature)}</Code>
              </Box>
            )}

            {state.mintAddress && (
              <Box>
                <Text fontWeight="semibold" mb={1}>
                  Mint address
                </Text>
                <Code>{state.mintAddress}</Code>
              </Box>
            )}

            {state.tokenAccount && (
              <Box>
                <Text fontWeight="semibold" mb={1}>
                  Associated token account
                </Text>
                <Code>{state.tokenAccount}</Code>
              </Box>
            )}
          </Stack>
        )}
      </VStack>
    </Box>
  );
};

export default CreateItemForm;
