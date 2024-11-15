"use client";
import { Box, Button, Flex, Tab, TabList, Tabs, Text, VStack } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import DashBoardCard from "./DashBoardCard";

export default function DashBoardList() {
  return (
    <Box maxWidth="1034px" margin="0 auto" padding="6">
      <Flex justifyContent="space-between" alignItems="center" marginBottom="4">
        <Tabs width="400px">
          <TabList>
            <Tab flex="1">あなたのエアドロップ</Tab>
            <Tab flex="1">対象のエアドロップ</Tab>
          </TabList>
        </Tabs>
      </Flex>
      <Flex justifyContent="flex-end" marginBottom="6">
        <Button leftIcon={<AddIcon />} bg="gray.500" _hover={{ bg: "gray.600" }}>
          エアドロップを作成
        </Button>
      </Flex>
      <VStack spacing="4">
        <DashBoardCard
          creationDate="2023-03-20"
          publicationDate="2023-03-20"
          totalAmount="500,000 YMT"
          claimedAccounts="314 / 20,214"
          vestingEndDate="2025/12/01"
          status="registered"
        />

        <DashBoardCard
          creationDate="2023-03-20"
          publicationDate="-"
          totalAmount="-"
          claimedAccounts="-"
          vestingEndDate=""
          status="unregistered"
        />
      </VStack>
    </Box>
  );
}
