"use client";
import styles from "./page.module.css";
import { Center, Container, Heading, Spinner } from "@chakra-ui/react";
import { useRequireAccount } from "@/app/hooks/common/useRequireAccount";
import Test from "./test";
import { useIsMounted } from "@/app/hooks/common/useIsMounted";
import { Box, Button, Flex, Tab, TabList, Tabs, VStack } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import DashBoardCard from "@/app/components/airdrops/cards/DashBoardCard";
import { TemplateType, Airdrop } from "@/app/interfaces/dashboard";

export default function Dashboard() {
  const { address, isConnecting, isReconnecting } = useRequireAccount();
  const isMounted = useIsMounted();
  const { t } = useTranslation();
  const airdrops: Airdrop[] = [
    {
      id: "asdf",
      title: "Vesting",
      templateName: TemplateType.LINEAR_VESTING,
      owner: "0x",
      tokenAddress: "0x",
      createdAt: 1731897560,
      merkleTreeUploadedAt: 1731897560,
      contractAddress: "0x",
      totalAirdropAmount: BigInt(0.005 * 1e18),
      eligibleUsersNum: 1000,
      claimedUsersNum: 40,
      contractDeployedAt: 1731897560,
      vestingEndsAt: 1731897560,
    },
    {
      id: "zxcv",
      title: "Standard",
      templateName: TemplateType.STANDARD,
      owner: "0x",
      tokenAddress: "0x",
      createdAt: 1731897560,
      merkleTreeUploadedAt: undefined,
      contractAddress: undefined,
      totalAirdropAmount: BigInt(0.005 * 1e18),
      eligibleUsersNum: 1000,
      claimedUsersNum: 40,
      contractDeployedAt: 1731897560,
    },
  ];
  if (!isMounted || !address)
    return (
      <Center>
        <Spinner />
      </Center>
    );

  return (
    <Container maxW={"container.xl"}>
      <Heading fontSize={{ base: "xl", md: "3xl" }}>Dashboard</Heading>
      <Box margin="0 auto" py={{ base: "3", md: "6" }}>
        <Flex justifyContent="space-between" alignItems="center" marginBottom="4">
          <Tabs width={{ base: "387px", md: "400px" }}>
            <TabList>
              <Tab flex="1" fontSize={{ base: "sm", sm: "md" }}>
                {t("dashboard.yourAirdrops")}
              </Tab>
              <Tab flex="1" fontSize={{ base: "sm", sm: "md" }}>
                {t("dashboard.targetAirdrops")}
              </Tab>
            </TabList>
          </Tabs>
        </Flex>
        <Flex justifyContent="flex-end" marginBottom="6">
          <Button
            leftIcon={<AddIcon />}
            bg="gray.500"
            _hover={{ bg: "gray.600" }}
            fontSize={{ base: "sm", sm: "md" }}
          >
            {t("dashboard.createAirdrop")}
          </Button>
        </Flex>
        <VStack spacing="4">
          {airdrops.map((airdrop) => (
            <DashBoardCard key={airdrop.id} airdrop={airdrop} />
          ))}
        </VStack>
      </Box>
    </Container>
  );
}
