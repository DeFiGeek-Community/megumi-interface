"use client";
import styles from "./page.module.css";
import { Center, Container, Heading, Spinner } from "@chakra-ui/react";
import { useRequireAccount } from "@/app/hooks/common/useRequireAccount";
import DashBoardList from "@/app/components/dashboard/DashBoardList";
import Test from "./test";
import { useIsMobile } from "@/app/lib/chakra/chakraUtils";

export default function Dashboard() {
  const { address, isConnecting, isReconnecting } = useRequireAccount();
  const isMobile = useIsMobile();

  if (!address)
    return (
      <Center>
        <Spinner />
      </Center>
    );

  return (
    <Container maxWidth={isMobile ? "387px" : "1034px"} >
      <Heading fontSize={isMobile ? "xl" : "3xl"}>Dashboard</Heading>
      {/* <Test /> */}
      <DashBoardList />
    </Container>
  );
}
