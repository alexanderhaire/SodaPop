import { useState } from "react";
import {
  Box, Heading, Input, Button, VStack, FormLabel
} from "@chakra-ui/react";
import axios from "../utils/axiosConfig";
import { useNavigate } from "react-router-dom";

const CreateHorse = () => {
  const [form, setForm] = useState({ name: "", age: "", trainer: "", record: "", earnings: "" });
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post("/api/horses", form);
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
            <FormLabel htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</FormLabel>
            <Input name={field} value={(form as any)[field]} onChange={handleChange} />
          </Box>
        ))}
        <Button colorScheme="teal" onClick={handleSubmit}>Create</Button>
      </VStack>
    </Box>
  );
};

export default CreateHorse;
