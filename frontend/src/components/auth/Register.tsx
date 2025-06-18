import React, { useState } from "react";
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Link,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosConfig";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Both username and password are required.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:4000/api/auth/register", {
        username,
        password,
      });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={16} p={6} shadow="md" borderRadius="md">
      <VStack spacing={4} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">
          Register
        </Text>

        <FormControl id="username">
          <FormLabel>Username</FormLabel>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
          />
        </FormControl>

        <FormControl id="password">
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password"
          />
        </FormControl>

        {error && (
          <Text color="red.500" fontSize="sm">
            {error}
          </Text>
        )}

        <Button variant="cta" onClick={handleRegister} isLoading={loading}>
          Register
        </Button>

        <Text fontSize="sm">
          Already have an account?{" "}
          <Link as={RouterLink} to="/login" color="#000">
            Login
          </Link>
        </Text>
      </VStack>
    </Box>
  );
};

export default Register;
