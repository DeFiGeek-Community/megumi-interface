"use client";
import { Center, Container, Heading, Spinner, VStack, Box } from "@chakra-ui/react";
import { useRequireAccount } from "@/app/hooks/common/useRequireAccount";
import AirdropDetails from "@/app/components/airdrops/cards/AirdropDetails";
import { useIsMounted } from "@/app/hooks/common/useIsMounted";
import { useTranslation } from "react-i18next";
import { TemplateType, Airdrop } from "@/app/interfaces/dashboard";
import { Stack, HStack, Text, Button, Avatar, Divider, Flex, Icon } from "@chakra-ui/react";
import { ExternalLinkIcon, WarningTwoIcon } from "@chakra-ui/icons";
import {
  formatDate,
  formatTotalAirdropAmount,
  formatClaimedAccounts,
  formatVestingEndsAt,
  formatTemplateType,
} from "@/app/lib/airdrop/airdropUtils";

export default function AirdropPage() {
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
  const standardClaim = {
    amount: BigInt(2351),
    isClaimed: false,
  };
  const linearVestingClaim = {
    claimedAmount: BigInt(1021),
    claimable: BigInt(325),
  };
  if (!isMounted || !address)
    return (
      <Center>
        <Spinner />
      </Center>
    );
  const isOwner = false;

  let airdropContractDeployedAt = "-",
    airdropCreatedAt = "-",
    currentTotalAirdropAmount = "0",
    currentClaimedAccounts = "0 / 0",
    currentVestingEndsAt = "-",
    isRegisteredAirdrop = false,
    isRegisteredContract = false,
    isLinearVesting = false;

  airdropContractDeployedAt = formatDate(airdrops[0].contractDeployedAt);
  airdropCreatedAt = formatDate(airdrops[0].createdAt);
  currentTotalAirdropAmount = formatTotalAirdropAmount(airdrops[0].totalAirdropAmount);
  currentClaimedAccounts = formatClaimedAccounts(
    airdrops[0].eligibleUsersNum,
    airdrops[0].claimedUsersNum,
  );
  if ("vestingEndsAt" in airdrops[0]) {
    currentVestingEndsAt = formatVestingEndsAt(airdrops[0].vestingEndsAt);
  }
  isRegisteredAirdrop = !!airdrops[0].merkleTreeUploadedAt;
  isRegisteredContract = !!airdrops[0].contractAddress;
  isLinearVesting = airdrops[0].templateName === TemplateType.LINEAR_VESTING;

  return (
    <Container maxW={"container.xl"} mb={4}>
      <VStack spacing="4">
        <Box width={{ base: "100%", lg: "50%" }} ml={4}>
          <Heading fontSize="3xl">Airdrop</Heading>
        </Box>
        <Box width={{ base: "100%", lg: "50%" }}>
          {/* Header Section */}
          <Box borderRadius="md" boxShadow="md" p={{ base: "0", lg: "4" }} mb={4}>
            <HStack spacing={3} mb={4}>
              <Avatar size="xl" name="YMT" bg="gray.500" />
              <Box>
                <Box
                  bg="gray.500"
                  borderRadius="md"
                  px={{ base: "1", sm: "3" }}
                  py={{ base: "0.5", sm: "1" }}
                  mt="1.5"
                  display="inline-flex"
                  alignItems="center"
                >
                  <Text fontSize={{ base: "sm", sm: "md" }} marginRight="1">
                    {t(`dashboard.${formatTemplateType(airdrops[0].templateName)}`)}
                  </Text>
                  <Box
                    bg="white"
                    borderRadius="full"
                    width={{ base: "4", sm: "5" }}
                    height={{ base: "4", sm: "5" }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="sm" fontWeight="bold" color="black">
                      ?
                    </Text>
                  </Box>
                </Box>
                <Text fontSize="3xl" fontWeight="bold">
                  {airdrops[0].title}
                </Text>
                <Flex alignItems="baseline" direction={{ base: "column", md: "row" }}>
                  <Flex alignItems="baseline" direction="row">
                    <Text fontSize="md" fontWeight="bold" mr={4}>
                      {currentTotalAirdropAmount}
                    </Text>
                  </Flex>
                  <Flex alignItems="baseline" direction="row">
                    <Text fontSize="md" fontWeight="bold" mr={1}>
                      {currentClaimedAccounts}
                    </Text>
                    <Text fontSize="sm">{t("dashboard.claimedAccount")}</Text>
                  </Flex>
                </Flex>
              </Box>
            </HStack>
            <HStack spacing={2}>
              <Box
                bg="gray.500"
                borderRadius="md"
                px={{ base: "1", sm: "3" }}
                py={{ base: "0.5", sm: "1" }}
                mt="1.5"
                display="inline-flex"
                alignItems="center"
              >
                <Text fontSize={{ base: "sm" }} marginRight="1">
                  {t("airdrop.tokenAddress")}
                </Text>
              </Box>
              <Text
                fontSize="sm"
                fontWeight={{ sm: "bold" }}
                py={{ base: "0.5", sm: "1" }}
                mt="1.5"
                mr={{ base: "0", lg: "4" }}
              >
                {airdrops[0].tokenAddress}
                <Icon as={ExternalLinkIcon} ml={1} mb={1} />
              </Text>
              <Box
                bg="gray.500"
                borderRadius="md"
                px={{ base: "1", sm: "3" }}
                py={{ base: "0.5", sm: "1" }}
                mt="1.5"
                display="inline-flex"
                alignItems="center"
              >
                <Text fontSize={{ base: "sm" }} marginRight="1">
                  {t("airdrop.airdropContract")}
                </Text>
              </Box>
              <Text
                fontSize="sm"
                fontWeight={{ sm: "bold" }}
                py={{ base: "0.5", sm: "1" }}
                mt="1.5"
              >
                {airdrops[0].contractAddress}
                <Icon as={ExternalLinkIcon} ml={1} mb={1} />
              </Text>
            </HStack>
          </Box>

          {/* Status Section */}

          <Box bg="#2E3748" borderRadius="md" boxShadow="md" p={4} mb={4}>
            <VStack spacing={0.5} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="md" fontWeight="900">
                  {t("airdrop.yourAllocatedAmount")}
                </Text>
                {!isLinearVesting && !standardClaim.isClaimed && (
                  <HStack justify="flex-start">
                    <Text fontSize="3xl" fontWeight="medium">
                      {`${standardClaim.amount}`}
                    </Text>
                    <Text fontSize="md" fontWeight="medium">
                      YMT
                    </Text>
                  </HStack>
                )}
              </HStack>
              {isLinearVesting && (
                <>
                  <HStack justify="space-between">
                    <Text fontSize="sm">{t("airdrop.totalAmount")}</Text>
                    <HStack justify="flex-start">
                      <Text fontSize="3xl" fontWeight="medium">
                        {`${linearVestingClaim.claimedAmount + linearVestingClaim.claimable}`}
                      </Text>
                      <Text fontSize="md" fontWeight="medium">
                        YMT
                      </Text>
                    </HStack>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">{t("dashboard.vestingDeadline")}</Text>
                    <Text fontSize="3xl" fontWeight="medium">
                      {currentVestingEndsAt}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">{t("airdrop.claimed")}</Text>
                    <HStack justify="flex-start">
                      <Text fontSize="3xl" fontWeight="medium">
                        {`${linearVestingClaim.claimedAmount}`}
                      </Text>
                      <Text fontSize="md" fontWeight="medium">
                        YMT
                      </Text>
                    </HStack>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">{t("airdrop.claimable")}</Text>
                    <HStack justify="flex-start">
                      <Text fontSize="3xl" fontWeight="medium">
                        {`${linearVestingClaim.claimable}`}
                      </Text>
                      <Text fontSize="md" fontWeight="medium">
                        YMT
                      </Text>
                    </HStack>
                  </HStack>
                </>
              )}
              <Button size="sm" colorScheme="blue" width="full" mt={4}>
                {t("airdrop.claim")}
              </Button>
            </VStack>
          </Box>

          {/* Menu Section */}
          {isOwner && (
            <Box bg="#2E3748" borderRadius="md" boxShadow="md" p={4}>
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="md" fontWeight="900">
                    オーナーメニュー
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="medium">基本情報</Text>
                  <Button size="sm" width="20" colorScheme="blue">
                    編集する
                  </Button>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Stack>
                    <Text fontWeight="medium">エアドロップリスト</Text>
                    <Text fontWeight="medium" textAlign="left">
                      <Icon as={WarningTwoIcon} mr={1} mb={1} color="yellow.500" />
                      未登録
                    </Text>
                  </Stack>
                  <Button size="sm" width="20" colorScheme="blue">
                    登録する
                  </Button>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Stack>
                    <Text fontWeight="medium">コントラクト</Text>
                    <Text fontWeight="medium" textAlign="left">
                      <Icon as={WarningTwoIcon} mr={1} mb={1} color="yellow.500" />
                      未登録
                    </Text>
                  </Stack>
                  <Button size="sm" width="20" colorScheme="blue">
                    登録する
                  </Button>
                </HStack>
              </VStack>
            </Box>
          )}
        </Box>
      </VStack>
    </Container>
  );
}
