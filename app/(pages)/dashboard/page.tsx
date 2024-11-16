"use client";
import styles from "./page.module.css";
import { Center, Container, Heading, Spinner } from "@chakra-ui/react";
import { useRequireAccount } from "@/app/hooks/common/useRequireAccount";
import DashBoardList from "@/app/components/dashboard/DashBoardList";
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
    <Container maxW="1034px" height="100%">
      <Heading>Dashboard</Heading>
      {/* <Test /> */}
      <DashBoardList />
    </Container>
  );
}
