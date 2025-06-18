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
import { HORSE_TOKEN_ADDRESS, horseTokenABI } from "../utils/contractConfig";

const CreateHorse = () => {
  const [form, setForm] = useState({
    name: "",
    age: "",
    trainer: "",
    record: "",
    earnings: ""
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
      await axios.post("/horses", form);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const horseToken = new ethers.Contract(
        HORSE_TOKEN_ADDRESS,
        horseTokenABI,
        signer
      );

      const totalShares = 10000;
      const sharePrice = 100;
      const tokenId = Math.floor(Date.now() / 1000);

      const tx = await horseToken.createHorseOffering(tokenId, sharePrice, totalShares);
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
          <FormLabel>Horse Image</FormLabel>
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
