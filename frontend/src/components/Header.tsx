import { Box, HStack, Heading, Spacer, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <Box p={4} bg="gray.100" boxShadow="md">
      <HStack spacing={4}>
  <Button as={Link} to="/create" colorScheme="purple" variant="outline">Add Horse</Button>
        <Heading size="md">SodaPop</Heading>
        <Spacer />
        <Button as={Link} to="/" colorScheme="teal" variant="ghost">Dashboard</Button>
        <Button as={Link} to="/create" colorScheme="purple" variant="outline">Add Horse</Button>
      </HStack>
    </Box>
  );
};

export default Header;
