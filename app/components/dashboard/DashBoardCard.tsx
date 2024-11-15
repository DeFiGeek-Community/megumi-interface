import { Box, Avatar, Card, CardBody, Flex, Text } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { Row, useIsMobile } from "@/app/lib/chakra/chakraUtils";
import { DashBoardCardProps } from "@/app/interfaces/dashboard";

export default function DashBoardCard({
  creationDate,
  publicationDate,
  totalAmount,
  claimedAccounts,
  vestingEndDate,
  status,
}: DashBoardCardProps) {
  const isMobile = useIsMobile();
  return (
    <Card width="100%">
      <CardBody>
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          justifyContent="space-between"
          width="100%"
        >
          <Text fontSize="sm" textAlign="right" flex="1" paddingRight={4}>
            作成日: {creationDate}
          </Text>
          <Text fontSize="sm" textAlign="right">
            公開日: {publicationDate}
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
                  {status === "registered" ? (
                    <>
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
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </Row>
                <Text fontSize="30px" fontWeight="400">
                  YMT Early Investors Airdrop
                </Text>
                <Box
                  bg="gray.500"
                  borderRadius="md"
                  px="3"
                  py="1"
                  mt="1.5"
                  display="inline-flex"
                  alignItems="center"
                >
                  <Text fontSize="md" marginRight="1">
                    {status === "registered" ? "Linear vesting" : "Standard"}
                  </Text>
                  <Box
                    bg="white"
                    borderRadius="full"
                    width="5"
                    height="5"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="sm" fontWeight="bold" color="black">?</Text>
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
                {totalAmount}
              </Text>
            </Row>
            <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%">
              <Text flex="1" textAlign="left" fontWeight="medium">
                クレーム済みアカウント
              </Text>
              <Text flex="1" textAlign="right" fontWeight="medium" fontSize="lg">
                {claimedAccounts}
              </Text>
            </Row>
            <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%">
              <Text flex="1" textAlign="left" fontWeight="medium">
                ベスティング期限終了
              </Text>
              <Text flex="1" textAlign="right" fontWeight="medium" fontSize="lg">
                {vestingEndDate}
              </Text>
            </Row>
          </Box>
        </Row>
      </CardBody>
    </Card>
  );
};
