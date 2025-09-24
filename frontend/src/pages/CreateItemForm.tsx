import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Image,
  Input,
  Select,
  Textarea,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import axios from "../utils/axiosConfig";
import { uploadImage } from "../utils/uploadImage";
import { getToken } from "../utils/authToken";

export default function CreateItemForm() {
  const [form, setForm] = useState({
    itemType: "",
    sharePrice: "",
    totalShares: "",
    description: "",
    shareType: "Fixed",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "itemType":
      case "description":
        return value.trim() ? "" : "Required";
      case "sharePrice":
        return parseFloat(value) > 0 ? "" : "Must be > 0";
      case "totalShares":
        return parseInt(value) > 0 ? "" : "Must be > 0";
      default:
        return "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const uploadFile = async (file: File) => {
    setImageFile(file);
    try {
      const token = getToken() || "";
      const imageUrl = await uploadImage(file, token);
      setIpfsUrl(imageUrl);
    } catch (err) {
      console.error("Image upload error:", err);
      toast({ title: "Failed to upload image", status: "error" });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const createItem = async () => {
    if (!ipfsUrl) {
      toast({ title: "Image not uploaded", status: "error" });
      return;
    }

    const payload = {
      ...form,
      sharePrice: parseFloat(form.sharePrice),
      totalShares: parseInt(form.totalShares),
      shareType: form.shareType,
      image: ipfsUrl,
    };

    try {
      await axios.post("/items", payload);
      toast({ title: "Item created", status: "success" });
      onClose();
    } catch (err) {
      console.error("Item creation error:", err);
      toast({ title: "Failed to create item", status: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {
      itemType: validateField("itemType", form.itemType),
      sharePrice: validateField("sharePrice", form.sharePrice),
      totalShares: validateField("totalShares", form.totalShares),
      description: validateField("description", form.description),
    };
    setErrors(errs);
    const hasError = Object.values(errs).some((msg) => msg);
    if (hasError || !ipfsUrl) {
      toast({ title: "Please fix form errors", status: "error" });
      return;
    }
    onOpen();
  };

  return (
    <Box maxW="700px" mx="auto" p={6}>
      <form onSubmit={handleSubmit}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isInvalid={!!errors.itemType}>
            <FormLabel>Item Type</FormLabel>
            <Input
              name="itemType"
              value={form.itemType}
              onChange={handleChange}
            />
            <FormHelperText>e.g. Artwork, Horse</FormHelperText>
            {errors.itemType && (
              <FormErrorMessage>{errors.itemType}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.sharePrice}>
            <FormLabel>Share Price (ETH)</FormLabel>
            <Input
              name="sharePrice"
              type="number"
              step="0.01"
              value={form.sharePrice}
              onChange={handleChange}
            />
            <FormHelperText>Price per share in ETH</FormHelperText>
            {errors.sharePrice && (
              <FormErrorMessage>{errors.sharePrice}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.totalShares}>
            <FormLabel>Total Shares</FormLabel>
            <Input
              name="totalShares"
              type="number"
              value={form.totalShares}
              onChange={handleChange}
            />
            <FormHelperText>Number of shares available</FormHelperText>
            {errors.totalShares && (
              <FormErrorMessage>{errors.totalShares}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.description}>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />
            <FormHelperText>Brief description of the item</FormHelperText>
            {errors.description && (
              <FormErrorMessage>{errors.description}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>Share Type</FormLabel>
            <Select
              name="shareType"
              value={form.shareType}
              onChange={handleChange}
            >
              <option value="Fixed">Fixed</option>
              <option value="Variable">Variable</option>
            </Select>
            <FormHelperText>Choose how shares behave</FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>Image</FormLabel>
            <Box
              border="2px dashed"
              borderColor={dragging ? "purple.400" : "gray.300"}
              p={6}
              textAlign="center"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              cursor="pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {ipfsUrl ? (
                <Image src={ipfsUrl} alt="preview" maxH="200px" mx="auto" />
              ) : (
                <Text>Drag & drop or click to upload</Text>
              )}
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </Box>
            <FormHelperText>Supported: images only</FormHelperText>
          </FormControl>
        </SimpleGrid>

        {ipfsUrl && (
          <Box mt={4} p={4} borderWidth="1px" borderRadius="md">
            <Text fontWeight="bold" mb={2}>
              Preview
            </Text>
            <Image src={ipfsUrl} alt="Preview" maxH="150px" mb={2} mx="auto" />
            <Text>Type: {form.itemType}</Text>
            <Text>Share Price: {form.sharePrice} ETH</Text>
            <Text>Total Shares: {form.totalShares}</Text>
            <Text>Description: {form.description}</Text>
            <Text>Share Type: {form.shareType}</Text>
          </Box>
        )}

        <Button
          type="submit"
          mt={4}
          isLoading={isSubmitting}
          colorScheme="purple"
        >
          Create Item
        </Button>
      </form>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Item Creation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2}>Item Type: {form.itemType}</Text>
            <Text mb={2}>Share Price: {form.sharePrice} ETH</Text>
            <Text mb={2}>Total Shares: {form.totalShares}</Text>
            <Text mb={2}>Share Type: {form.shareType}</Text>
            <Text>Description: {form.description}</Text>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose} variant="ghost">
              Edit
            </Button>
            <Button
              colorScheme="purple"
              onClick={() => {
                setIsSubmitting(true);
                createItem();
              }}
              isLoading={isSubmitting}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
