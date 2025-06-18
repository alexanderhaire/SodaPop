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
import { uploadToNftStorageV2 } from "../utils/nftStorage";
import { ethers } from "ethers";
import {
  HORSE_TOKEN_ADDRESS,
  horseTokenABI,
  FIXED_TOKEN_ADDRESS,
  fixedTokenABI,
} from "../utils/contractConfig";

const CreateItem = () => {
  const [form, setForm] = useState({
    sharePrice: "",
    totalShares: ""
  });
  const [itemType, setItemType] = useState<string>("");
  const [pricingMode, setPricingMode] = useState<'fixed' | 'variable'>('fixed');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");

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
    try {
      const cid = await uploadToNftStorageV2(imageFile);
      return `ipfs://${cid}`;
    } catch (err) {
      console.error("Failed to upload to IPFS:", err);
      return "";
    }
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

      let finalType = itemType;
      let finalDesc = description;
      if ((!finalType || !finalDesc) && imagePreview) {
        try {
          const res = await axios.post("/items/describe", { image: imagePreview });
          if (!finalType) {
            finalType = res.data.title;
            setItemType(res.data.title);
          }
          if (!finalDesc) {
            finalDesc = res.data.description;
            setDescription(res.data.description);
          }
        } catch (err) {
          console.error("Failed to generate defaults:", err);
        }
      }

      const metadataURI = await uploadToIPFS();
      const sharePriceWei = ethers.parseEther(form.sharePrice || "0");

      await axios.post("/items", {
        pricingMode,
        itemType: finalType,
        sharePrice: sharePriceWei.toString(),
        totalShares,
        description: finalDesc,
        image: metadataURI,
      });

      const provider = typeof window !== "undefined" && (window as any).ethereum
        ? new ethers.BrowserProvider((window as any).ethereum)
        : undefined;
      if (!provider) throw new Error("Ethereum provider not found");
      const signer = await provider.getSigner();
      let tx;

      if (pricingMode === "variable") {
        const variableToken = new ethers.Contract(
          HORSE_TOKEN_ADDRESS,
          horseTokenABI,
          signer
        );
        tx = await variableToken.createHorse(totalShares, sharePriceWei, metadataURI);
      } else {
        const fixedToken = new ethers.Contract(
          FIXED_TOKEN_ADDRESS,
          fixedTokenABI,
          signer
        );
        tx = await fixedToken.mintFixed(await signer.getAddress(), metadataURI);
      }
      await tx.wait();
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to create item:", err);
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
          <FormLabel htmlFor="description">Description</FormLabel>
          <Input
            name="description"
            placeholder="Describe your item"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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

        <Button variant="cta" onClick={handleSubmit}>
          Create
        </Button>
      </VStack>
    </Box>
  );
};

export default CreateItem;
