import React from "react";
import { Box, Container } from "@chakra-ui/react";
import Dashboard from "../components/Dashboard";

const DashboardPage: React.FC = () => {
  return (
    <Container maxW="5xl" py={10}>
      <Box
        bg="rgba(9, 14, 30, 0.82)"
        p={{ base: 6, md: 10 }}
        borderRadius="3xl"
        border="1px solid rgba(148, 163, 255, 0.22)"
        boxShadow="0 28px 70px rgba(4, 9, 24, 0.75)"
      >
        <Dashboard userAddress="0x1462...DBee" />
      </Box>
    </Container>
  );
};

export default DashboardPage;
