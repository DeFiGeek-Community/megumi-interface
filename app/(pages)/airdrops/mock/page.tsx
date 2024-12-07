"use client";
import { Center, Container, Heading, Spinner } from "@chakra-ui/react";
import { useRequireAccount } from "@/app/hooks/common/useRequireAccount";
import AirdropDetails from "@/app/components/airdrops/cards/AirdropDetails";

export default function Airdrop() {
  const { address, isConnecting, isReconnecting } = useRequireAccount();

  return (
    <Container maxW={"container.xl"}>
      <Heading fontSize={{ base: "xl", md: "3xl" }}>Airdrop</Heading>
      <AirdropDetails/>
    </Container>
  );
}
