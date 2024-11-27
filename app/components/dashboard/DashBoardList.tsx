"use client";
import { Box, Button, Flex, Tab, TabList, Tabs, VStack } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import DashBoardCard from "./DashBoardCard";
import { useTranslation } from "react-i18next";

export default function DashBoardList() {
  const { t } = useTranslation();
  return (
    <Box margin="0 auto" py={{ base: "3", sm: "6" }}>
      <Flex justifyContent="space-between" alignItems="center" marginBottom="4">
        <Tabs width={{ base: "387px", sm: "400px" }}>
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
