"use client";
import { Center, Container, Heading, Spinner } from "@chakra-ui/react";
import { useRequireAccount } from "@/app/hooks/common/useRequireAccount";

export default function Airdrop() {
  const { address, isConnecting, isReconnecting } = useRequireAccount();

  return (
    <Container>
      <Heading>Airdrop</Heading>
    </Container>
  );
}
