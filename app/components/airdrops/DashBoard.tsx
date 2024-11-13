"use client";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  Avatar,
  Badge,
  ChakraProvider,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

export default function DashBoard() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };

  return (
    <Box maxW="3xl" mx="auto" px={4} py={6}>
      <Tabs index={tabIndex} onChange={handleTabsChange} variant="enclosed" mb={4}>
        <TabList width="400px">
          <Tab flex={1}>あなたのエアドロップ</Tab>
          <Tab flex={1}>対象のエアドロップ</Tab>
        </TabList>
      </Tabs>

      <Flex justifyContent="flex-end" mt={4}>
        <Button leftIcon={<AddIcon />} colorScheme="blue">
          エアドロップを作成
        </Button>
      </Flex>

      <VStack spacing={4} mt={6}>
        <Card width="100%">
          <CardBody>
            <Flex alignItems="center" gap={4}>
              <Avatar size="lg" name="YMT" src="/placeholder.svg" />
              <Box flex={1}>
                <Flex gap={2} mb={1}>
                  <Badge colorScheme="green">エアドロップリスト登録済</Badge>
                  <Badge colorScheme="blue">コントラクト登録済</Badge>
                </Flex>
                <Text fontWeight="medium">YMT Early Investors Airdrop</Text>
              </Box>
              <Box textAlign="right">
                <Text fontSize="sm" color="gray.500">
                  作成日: 2023.03.20
                </Text>
                <Text fontWeight="medium">500,000 YMT</Text>
                <Text fontSize="sm" color="gray.500">
                  314 POINT
                </Text>
                <Text fontSize="sm">ベスティング期限終了: 2025/12/01</Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card width="100%">
          <CardBody>
            <Flex alignItems="center" gap={4}>
              <Avatar size="lg" name="YMT" src="/placeholder.svg" />
              <Box flex={1}>
                <Flex gap={2} mb={1}>
                  <Badge colorScheme="green">エアドロップリスト登録済</Badge>
                  <Badge colorScheme="blue">コントラクト登録済</Badge>
                </Flex>
                <Text fontWeight="medium">YMT Early Investors Airdrop</Text>
              </Box>
              <Box textAlign="right">
                <Text fontSize="sm" color="gray.500">
                  作成日: 2023.03.20
                </Text>
                <Text fontSize="sm">クレーム済みアマウント</Text>
                <Text fontSize="sm">-</Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
