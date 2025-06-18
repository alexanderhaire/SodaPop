import React from "react";
import { Box, Container } from "@chakra-ui/react";
import Dashboard from "../components/Dashboard";

const DashboardPage: React.FC = () => {
  return (
    <Container maxW="4xl" py={10}>
      <Box bg="whiteAlpha.800" p={6} borderRadius="xl" boxShadow="lg">
        <Dashboard userAddress="0x1462...DBee" />
      </Box>
    </Container>
  );
};

export default DashboardPage;
