"use client";
import { Box, Button, Flex, Tab, TabList, Tabs, VStack } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import DashBoardCard from "./DashBoardCard";
import { useTranslation } from "react-i18next";
import { TemplateType } from "@/app/interfaces/dashboard";
import { Airdrop } from "@/app/interfaces/dashboard";

function RenderAirdrop () {
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
      totalAirdropAmount: BigInt(50 * 1e18),
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
      merkleTreeUploadedAt: 1731897560,
      contractAddress: "0x",
      totalAirdropAmount: BigInt(50 * 1e18),
      eligibleUsersNum: 1000,
      claimedUsersNum: 40,
      contractDeployedAt: 1731897560,
    },
  ];
  // return airdrops.map((airdrop) => {
  //   <DashBoardCard key={airdrop.id} airdrop={airdrop} />;
  // });
}

export default function DashBoardList() {
  const { t } = useTranslation();
  return (
    <Box margin="0 auto" py={{ base: "3",md: "6" }}>
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
        <DashBoardCard
          creationDate="2023-03-20"
          publicationDate="2023-03-20"
          airdropTitle="YMT Early Investors Airdrop"
          vestingType="Linear vesting"
          totalAmount="500,000 YMT"
          claimedAccounts="314 / 20,214"
          vestingEndDate="2025/12/01"
          resisteredStatus={true}
        />

        <DashBoardCard
          creationDate="2023-03-20"
          publicationDate="-"
          airdropTitle="YMT Early Investors Airdrop"
          vestingType="Standard"
          totalAmount="-"
          claimedAccounts="-"
          vestingEndDate=""
          resisteredStatus={false}
        />
      </VStack>
    </Box>
  );
}
