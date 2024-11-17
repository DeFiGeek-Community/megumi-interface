"use client";
import { Box, Button, Flex, Tab, TabList, Tabs, Text, VStack } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import DashBoardCard from "./DashBoardCard";
import { useIsMobile } from "@/app/lib/chakra/chakraUtils";

export default function DashBoardList() {
  const isMobile = useIsMobile();
  return (
    <Box margin="0 auto" py={isMobile ? "3" : "6"}>
      <Flex justifyContent="space-between" alignItems="center" marginBottom="4">
        <Tabs width={isMobile ? "387px" : "400px"}>
          <TabList>
            <Tab flex="1" fontSize={isMobile ? "sm" : "md"}>
              あなたのエアドロップ
            </Tab>
            <Tab flex="1" fontSize={isMobile ? "sm" : "md"}>
              対象のエアドロップ
            </Tab>
          </TabList>
        </Tabs>
      </Flex>
      <Flex justifyContent="flex-end" marginBottom="6">
        <Button
          leftIcon={<AddIcon />}
          bg="gray.500"
          _hover={{ bg: "gray.600" }}
          fontSize={isMobile ? "sm" : "md"}
        >
          エアドロップを作成
        </Button>
      </Flex>
      <VStack spacing="4">
        <DashBoardCard
          creationDate="2023-03-20"
          publicationDate="2023-03-20"
          airdropTitle="YMT Early Investors Airdrop"
          totalAmount="500,000 YMT"
          claimedAccounts="314 / 20,214"
          vestingEndDate="2025/12/01"
          resisteredStatus={true}
        />

        <DashBoardCard
          creationDate="2023-03-20"
          publicationDate="-"
          airdropTitle="YMT Early Investors Airdrop"
          totalAmount="-"
          claimedAccounts="-"
          vestingEndDate=""
          resisteredStatus={false}
        />
      </VStack>
    </Box>
  );
}
