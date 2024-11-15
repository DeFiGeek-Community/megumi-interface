"use client";
import {
  Box,
  Button,
  Avatar,
  Card,
  CardBody,
  Flex,
  Tab,
  TabList,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { AddIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { Center, Column, Row, RowOrColumn, useIsMobile } from "@/app/lib/chakra/chakraUtils";

export default function DashBoardCard() {
  const isMobile = useIsMobile();
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
        <Card width="100%">
          <CardBody>
            <Row
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-start"
              justifyContent="space-between"
              width="100%"
            >
              <Text fontSize="sm" textAlign="right" flex="1" paddingRight={4}>
                作成日: 2023-03-20
              </Text>
              <Text fontSize="sm" textAlign="right">
                公開日: 2023-03-20
              </Text>
            </Row>
            <Row mainAxisAlignment="center" crossAxisAlignment="center" gap="4">
              <Box width="60%">
                <Row mainAxisAlignment="center" crossAxisAlignment="center" gap="4">
                  <Avatar size="lg" name="YMT" src="/placeholder.svg" bg="gray.500" />
                  <Box flex="1">
                    <Row
                      mainAxisAlignment="flex-start"
                      crossAxisAlignment="center"
                      gap="2"
                      marginBottom="1"
                    >
                      <Flex
                        alignItems="center"
                        bg="green.100"
                        color="green.800"
                        fontSize="xs"
                        fontWeight="medium"
                        px="2.5"
                        py="0.5"
                        borderRadius="full"
                      >
                        <CheckCircleIcon boxSize="3" marginRight="1" />
                        エアドロップリスト登録済
                      </Flex>
                      <Flex
                        alignItems="center"
                        bg="blue.100"
                        color="blue.800"
                        fontSize="xs"
                        fontWeight="medium"
                        px="2.5"
                        py="0.5"
                        borderRadius="full"
                      >
                        <CheckCircleIcon boxSize="3" marginRight="1" />
                        コントラクト登録済
                      </Flex>
                    </Row>
                    <Text fontSize="30px" fontWeight="400">
                      YMT Early Investors Airdrop
                    </Text>
                    <Box
                      bg="gray.500"
                      borderRadius="md"
                      padding="1"
                      display="inline-flex"
                      alignItems="center"
                    >
                      <Text fontSize="md" marginRight="1">
                        Linear vesting
                      </Text>
                      <Box
                        bg="white"
                        borderRadius="full"
                        width="6"
                        height="6"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="sm">?</Text>
                      </Box>
                    </Box>
                  </Box>
                </Row>
              </Box>
              <Box textAlign="right" width="40%">
                <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%">
                  <Text flex="1" textAlign="left" fontWeight="medium">
                    エアドロップ総額
                  </Text>
                  <Text flex="1" textAlign="right" fontWeight="medium" fontSize="lg">
                    500,000 YMT
                  </Text>
                </Row>
                <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%">
                  <Text flex="1" textAlign="left" fontWeight="medium">
                    クレーム済みアカウント
                  </Text>
                  <Text flex="1" textAlign="right" fontWeight="medium" fontSize="lg">
                    314 / 20,214
                  </Text>
                </Row>
                <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%">
                  <Text flex="1" textAlign="left" fontWeight="medium">
                    ベスティング期限終了
                  </Text>
                  <Text flex="1" textAlign="right" fontWeight="medium" fontSize="lg">
                    2025/12/01
                  </Text>
                </Row>
              </Box>
            </Row>
          </CardBody>
        </Card>

        <Card width="100%">
          <CardBody>
            <Row
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-start"
              justifyContent="space-between"
              width="100%"
            >
              <Text fontSize="sm" textAlign="right" flex="1" paddingRight={4}>
                作成日: 2023-03-20
              </Text>
              <Text fontSize="sm" textAlign="right">
                公開日: -
              </Text>
            </Row>
            <Row mainAxisAlignment="center" crossAxisAlignment="center" gap="4">
              <Box width="60%">
                <Row mainAxisAlignment="center" crossAxisAlignment="center" gap="4">
                  <Avatar size="lg" name="YMT" src="/placeholder.svg" bg="gray.500" />
                  <Box flex="1">
                    <Row
                      mainAxisAlignment="flex-start"
                      crossAxisAlignment="center"
                      gap="2"
                      marginBottom="1"
                    >
                      <Flex
                        alignItems="center"
                        color="gray.400"
                        fontSize="xs"
                        fontWeight="medium"
                        px="2.5"
                        py="0.5"
                        borderRadius="full"
                      >
                        <CheckCircleIcon boxSize="3" marginRight="1" color="gray.400" />
                        エアドロップリスト未登録
                      </Flex>
                      <Flex
                        alignItems="center"
                        color="gray.400"
                        fontSize="xs"
                        fontWeight="medium"
                        px="2.5"
                        py="0.5"
                        borderRadius="full"
                      >
                        <CheckCircleIcon boxSize="3" marginRight="1" color="gray.400" />
                        コントラクト未登録
                      </Flex>
                    </Row>
                    <Text fontSize="30px" fontWeight="400">
                      YMT Early Investors Airdrop
                    </Text>
                    <Box
                      bg="gray.500"
                      borderRadius="md"
                      padding="1"
                      display="inline-flex"
                      alignItems="center"
                    >
                      <Text fontSize="md" marginRight="1">
                        Standard
                      </Text>
                      <Box
                        bg="white"
                        borderRadius="full"
                        width="6"
                        height="6"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="sm">?</Text>
                      </Box>
                    </Box>
                  </Box>
                </Row>
              </Box>
              <Box textAlign="right" width="40%">
                <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%">
                  <Text flex="1" textAlign="left" fontWeight="medium">
                    エアドロップ総額
                  </Text>
                  <Text flex="1" textAlign="right" fontWeight="medium" fontSize="lg">
                    -
                  </Text>
                </Row>
                <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%">
                  <Text flex="1" textAlign="left" fontWeight="medium">
                    クレーム済みアカウント
                  </Text>
                  <Text flex="1" textAlign="right" fontWeight="medium" fontSize="lg">
                    -
                  </Text>
                </Row>
                <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%">
                  <Text flex="1" textAlign="left" fontWeight="medium"></Text>
                  <Text flex="1" textAlign="right" fontWeight="medium" fontSize="lg"></Text>
                </Row>
              </Box>
            </Row>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
