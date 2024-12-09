"use client";
import {
  Center,
  Container,
  Heading,
  Spinner,
  VStack,
  Box,
  HStack,
  Text,
  Avatar,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { useRequireAccount } from "@/app/hooks/common/useRequireAccount";
import { useIsMounted } from "@/app/hooks/common/useIsMounted";
import { useTranslation } from "react-i18next";
import { TemplateType, Airdrop } from "@/app/interfaces/dashboard";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  formatTotalAirdropAmount,
  formatClaimedAccounts,
  formatVestingEndsAt,
  formatTemplateType,
} from "@/app/lib/airdrop/airdropUtils";
import Claim from "@/app/components/airdrops/Claim";
import OwnerMenu from "@/app/components/airdrops/OwnerMenu";

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

  if (!isMounted || !address)
    return (
      <Center>
        <Spinner />
      </Center>
    );
  const isOwner = true;

  let currentTotalAirdropAmount = "0",
    currentClaimedAccounts = "0 / 0",
    currentVestingEndsAt = "-",
    isLinearVesting = false;

  currentTotalAirdropAmount = formatTotalAirdropAmount(airdrops[0].totalAirdropAmount);
  currentClaimedAccounts = formatClaimedAccounts(
    airdrops[0].eligibleUsersNum,
    airdrops[0].claimedUsersNum,
  );
  if ("vestingEndsAt" in airdrops[0]) {
    currentVestingEndsAt = formatVestingEndsAt(airdrops[0].vestingEndsAt);
  }
  isLinearVesting = airdrops[0].templateName === TemplateType.LINEAR_VESTING;

  return (
    <Container maxW={"container.xl"} mb={4}>
      <VStack spacing="4">
        <Box width={{ base: "100%", md: "50%" }} ml={4}>
          <Heading fontSize="3xl">Airdrop</Heading>
        </Box>
        <Box width={{ base: "100%", md: "50%" }}>
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
                <Flex alignItems="baseline" direction={{ base: "column", xl: "row" }}>
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
            <Flex direction={{ base: "column", lg: "row" }}>
              <Box
                bg="gray.500"
                borderRadius="md"
                px={{ base: "1", sm: "3" }}
                py={{ base: "0.5", sm: "1" }}
                mt="1.5"
                mr={{ lg: "2" }}
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
                mr={{ lg: "2" }}
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
            </Flex>
          </Box>

          {/* Status Section */}
          <Claim isLinearVesting={isLinearVesting} currentVestingEndsAt={currentVestingEndsAt} />

          {/* Menu Section */}
          {isOwner && <OwnerMenu />}
        </Box>
      </VStack>
    </Container>
  );
}
