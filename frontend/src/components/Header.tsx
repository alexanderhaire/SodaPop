import { Box, HStack, Heading, Spacer, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <Box p={4} bg="#d9d9d9" boxShadow="md">
      <HStack spacing={4}>
  <Button as={Link} to="/create" variant="cta">Add Horse</Button>
        <Heading size="md">SodaPop</Heading>
        <Spacer />
        <Button as={Link} to="/" variant="grey">Dashboard</Button>
        <Button as={Link} to="/create" variant="cta">Add Horse</Button>
      </HStack>
    </Box>
  );
};

export default Header;
