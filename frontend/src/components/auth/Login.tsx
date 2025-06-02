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
import { setToken } from "../../utils/authToken";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Both username and password are required.");
      return;
    }
    setLoading(true);
    try {
      const resp = await axios.post("/auth/login", { username, password });
      setToken(resp.data.token);
      navigate("/app");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={16} p={6} shadow="md" borderRadius="md">
      <VStack spacing={4} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">
          Login
        </Text>
        <FormControl id="username">
          <FormLabel>Username</FormLabel>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </FormControl>
        <FormControl id="password">
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </FormControl>
        {error && (
          <Text color="red.500" fontSize="sm">
            {error}
          </Text>
        )}
        <Button colorScheme="blue" onClick={handleLogin} isLoading={loading}>
          Login
        </Button>
        <Text fontSize="sm">
          Don’t have an account?{" "}
          <Link as={RouterLink} to="/register" color="blue.500">
            Register
          </Link>
        </Text>
      </VStack>
    </Box>
  );
};

export default Login;
