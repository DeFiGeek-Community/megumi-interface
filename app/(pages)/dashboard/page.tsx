"use client";
import styles from "./page.module.css";
import { Center, Container, Heading, Spinner } from "@chakra-ui/react";
import { useRequireAccount } from "@/app/hooks/common/useRequireAccount";
import Test from "./test";

export default function Dashboard() {
  const { address, isConnecting, isReconnecting } = useRequireAccount();

  if (!address)
    return (
      <Center>
        <Spinner />
      </Center>
    );

  return (
    <Container>
      <Heading>Dashboard</Heading>
      {/* <Test /> */}
    </Container>
  );
}
