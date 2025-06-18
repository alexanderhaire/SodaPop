import { useState } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  VStack,
  FormLabel
} from "@chakra-ui/react";
import axios from "../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import { NFTStorage, File as NFTFile } from "nft.storage";
import { ethers } from "ethers";
import HorseFactoryABI from "../abi/HorseFactory.json"; // ✅ adjust this if path differs

const CreateHorse = () => {
  const [form, setForm] = useState({
    name: "",
    age: "",
    trainer: "",
    record: "",
    earnings: "",
    sharePrice: "",
    totalShares: ""
  });

  const navigate = useNavigate();

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
      token: import.meta.env.VITE_NFT_STORAGE_KEY || ""
    });

    const metadata = await nftClient.store({
      name: form.name,
      description: `Fractional ownership of racehorse ${form.name}`,
      image: new NFTFile([imageFile], imageFile.name, { type: imageFile.type }),
      properties: {
        trainer: form.trainer,
        record: form.record,
        earnings: form.earnings
      }
    });

    return metadata.url;
  };

  const handleSubmit = async () => {
    try {
      const metadataURI = await uploadToIPFS();

      const sharePriceWei = ethers.parseEther(form.sharePrice || "0");
      const totalShares = Number(form.totalShares);

      await axios.post("/horses", {
        name: form.name,
        age: form.age,
        trainer: form.trainer,
        record: form.record,
        earnings: form.earnings,
        sharePrice: sharePriceWei.toString(),
        totalShares,
        image: metadataURI,
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const horseFactory = new ethers.Contract(
        import.meta.env.VITE_HORSE_FACTORY_ADDRESS,
        HorseFactoryABI.abi,
        signer
      );

      const tx = await horseFactory.createHorse(totalShares, sharePriceWei, metadataURI);
      await tx.wait();

      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to create horse", err);
    }
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>Create New Racehorse</Heading>
      <VStack spacing={4} align="stretch">
        {["name", "age", "trainer", "record", "earnings"].map((field) => (
          <Box key={field}>
            <FormLabel htmlFor={field}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </FormLabel>
            <Input
              name={field}
              value={(form as any)[field]}
              onChange={handleChange}
            />
          </Box>
        ))}

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

        <Button colorScheme="teal" onClick={handleSubmit}>
          Create
        </Button>
      </VStack>
    </Box>
  );
};

export default CreateHorse;
