import { useState } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  VStack,
  FormLabel,
  useToast,
  Flex,
  Switch,
  HStack
} from "@chakra-ui/react";
import axios from "../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import { NFTStorage, File as NFTFile } from "nft.storage";
import { ethers } from "ethers";
import { HORSE_TOKEN_ADDRESS, horseTokenABI } from "../utils/contractConfig";

const CreateItem = () => {
  const [form, setForm] = useState({
    sharePrice: "",
    totalShares: ""
  });
  const [itemType, setItemType] = useState<string>("");
  const [pricingMode, setPricingMode] = useState<'fixed' | 'variable'>('fixed');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToIPFS = async () => {
    if (!imageFile) return "";

    const nftClient = new NFTStorage({
      token: import.meta.env.VITE_NFT_STORAGE_KEY || "",
    });

    const metadata = await nftClient.store({
      name: imageFile.name || "Uploaded Image",
      image: new NFTFile([imageFile], imageFile.name, { type: imageFile.type }),
      itemType,
      sharePrice: form.sharePrice,
      totalShares: form.totalShares,
      pricingMode,
    });

    return metadata.url;
  };

  const handleSubmit = async () => {
    try {
      if (!imageFile) {
        alert("Please upload an image before submitting.");
        return;
      }

      const sharePrice = Number(form.sharePrice);
      const totalShares = Number(form.totalShares);

      if (sharePrice <= 0 || totalShares <= 0) {
        toast({
          status: "error",
          title: "Invalid input",
          description: "Share price and total shares must be greater than 0",
        });
        return;
      }

      const metadataURI = await uploadToIPFS();
      const sharePriceWei = ethers.parseEther(form.sharePrice || "0");

      await axios.post("/items", {
        pricingMode,
        itemType,
        sharePrice: sharePriceWei.toString(),
        totalShares,
        image: metadataURI,
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const horseToken = new ethers.Contract(
        HORSE_TOKEN_ADDRESS,
        horseTokenABI,
        signer
      );

      const tx = await horseToken.createHorse(totalShares, sharePriceWei, metadataURI);
      await tx.wait();

      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to create item", err);
    }
  };

  return (
    <Box p={6} maxW="600px" mx="auto" bg="whiteAlpha.800" borderRadius="lg" boxShadow="lg">
      <VStack spacing={4} align="stretch">
        <Box>
          <FormLabel>Item Type</FormLabel>
          <Input
            placeholder="e.g., Racehorse, Art, Collectible"
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
          />
        </Box>

        <Box>
          <FormLabel htmlFor="sharePrice">Share Price (ETH)</FormLabel>
          <Input
            name="sharePrice"
            type="number"
            step="any"
            value={form.sharePrice}
            onChange={handleChange}
          />
        </Box>

        <Box>
          <FormLabel htmlFor="totalShares">Total Shares</FormLabel>
          <Input
            name="totalShares"
            type="number"
            value={form.totalShares}
            onChange={handleChange}
          />
        </Box>

        <Box>
          <FormLabel>Image</FormLabel>
          <Input type="file" accept="image/*" onChange={handleImageUpload} />
          {imagePreview && (
            <Box mt={2}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: "200px", borderRadius: "8px" }}
              />
            </Box>
          )}
        </Box>

        <Flex justify="flex-end" mb={2}>
          <HStack>
            <FormLabel htmlFor="pricingMode" mb="0">Fixed</FormLabel>
            <Switch
              id="pricingMode"
              isChecked={pricingMode === "variable"}
              onChange={() =>
                setPricingMode(pricingMode === "fixed" ? "variable" : "fixed")
              }
            />
            <FormLabel htmlFor="pricingMode" mb="0">Variable</FormLabel>
          </HStack>
        </Flex>

        <Button colorScheme="purple" onClick={handleSubmit}>
          Create
        </Button>
      </VStack>
    </Box>
  );
};

export default CreateItem;
