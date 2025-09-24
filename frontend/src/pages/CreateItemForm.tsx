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
  Heading,
  Stack,
  Divider,
  VStack,
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
    <Box
      maxW="960px"
      mx="auto"
      p={{ base: 6, md: 10 }}
      bg="rgba(9, 14, 30, 0.82)"
      borderRadius="3xl"
      border="1px solid rgba(148, 163, 255, 0.22)"
      boxShadow="0 28px 70px rgba(4, 9, 24, 0.75)"
    >
      <Heading size="lg" mb={2}>
        Launch Forge blueprint
      </Heading>
      <Text color="whiteAlpha.700" mb={8} fontSize="sm">
        Define the parameters of your next legendary drop. Precision here powers
        every on-chain move that follows.
      </Text>
      <form onSubmit={handleSubmit}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl isInvalid={!!errors.itemType}>
            <FormLabel>Item Type</FormLabel>
            <Input
              name="itemType"
              value={form.itemType}
              onChange={handleChange}
              variant="glass"
            />
            <FormHelperText color="whiteAlpha.600">
              e.g. Thoroughbred, Champion Art, Breeding Rights
            </FormHelperText>
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
              variant="glass"
            />
            <FormHelperText color="whiteAlpha.600">
              Base price for each ownership shard
            </FormHelperText>
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
              variant="glass"
            />
            <FormHelperText color="whiteAlpha.600">
              Total supply available for collectors
            </FormHelperText>
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
              variant="glass"
              rows={5}
            />
            <FormHelperText color="whiteAlpha.600">
              Craft the mythos and strategic positioning for this asset
            </FormHelperText>
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
              variant="filled"
            >
              <option value="Fixed">Fixed</option>
              <option value="Variable">Variable</option>
            </Select>
            <FormHelperText color="whiteAlpha.600">
              Configure whether your curve is static or reactive
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>Image</FormLabel>
            <Box
              border="2px dashed"
              borderColor={dragging ? "cyan.300" : "rgba(148, 163, 255, 0.35)"}
              p={6}
              textAlign="center"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              cursor="pointer"
              onClick={() => fileInputRef.current?.click()}
              bg="rgba(8, 14, 32, 0.6)"
              borderRadius="xl"
              transition="border-color 0.2s ease"
            >
              {ipfsUrl ? (
                <Image src={ipfsUrl} alt="preview" maxH="200px" mx="auto" borderRadius="lg" />
              ) : (
                <Text color="whiteAlpha.600">Drag & drop or click to upload</Text>
              )}
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </Box>
            <FormHelperText color="whiteAlpha.600">
              Supported formats: high-resolution imagery (PNG, JPG)
            </FormHelperText>
          </FormControl>
        </SimpleGrid>

        <Divider my={8} borderColor="rgba(148, 163, 255, 0.25)" />
        {ipfsUrl && (
          <Box
            mt={4}
            p={6}
            borderRadius="2xl"
            bg="rgba(8, 14, 32, 0.85)"
            border="1px solid rgba(114, 140, 255, 0.2)"
            boxShadow="0 16px 45px rgba(4, 9, 24, 0.6)"
          >
            <Heading size="md" mb={4}>
              Vision preview
            </Heading>
            <Stack direction={{ base: "column", md: "row" }} spacing={6} align="center">
              <Image src={ipfsUrl} alt="Preview" maxH="180px" borderRadius="xl" />
              <VStack align="stretch" spacing={2} color="whiteAlpha.700">
                <Text>
                  <strong>Type:</strong> {form.itemType}
                </Text>
                <Text>
                  <strong>Share Price:</strong> {form.sharePrice} ETH
                </Text>
                <Text>
                  <strong>Total Shares:</strong> {form.totalShares}
                </Text>
                <Text>
                  <strong>Share Type:</strong> {form.shareType}
                </Text>
                <Text>
                  <strong>Description:</strong> {form.description}
                </Text>
              </VStack>
            </Stack>
          </Box>
        )}

        <Button
          type="submit"
          mt={4}
          isLoading={isSubmitting}
          variant="cta"
        >
          Stage verification
        </Button>
      </form>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm launch blueprint</ModalHeader>
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
              variant="cta"
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
