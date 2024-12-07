"use client";
import { Center, Container, Heading, Spinner, VStack, Box } from "@chakra-ui/react";
import { useRequireAccount } from "@/app/hooks/common/useRequireAccount";
import AirdropDetails from "@/app/components/airdrops/cards/AirdropDetails";

export default function Airdrop() {
  const { address, isConnecting, isReconnecting } = useRequireAccount();

  return (
    <Container maxW={"container.xl"} mb={4}>
      <VStack spacing="4">
        <Box width="50%" ml={4}>
          <Heading fontSize={{ base: "xl", md: "3xl" }}>Airdrop</Heading>
        </Box>
        <AirdropDetails />
      </VStack>
    </Container>
  );
}
