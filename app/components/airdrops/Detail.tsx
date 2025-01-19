"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
  Link,
} from "@chakra-ui/react";
import { useRequireAccount } from "@/app/hooks/common/useRequireAccount";
import { useIsMounted } from "@/app/hooks/common/useIsMounted";
import { useTranslation } from "react-i18next";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  formatTotalAirdropAmount,
  formatClaimedAccounts,
  formatTemplateType,
  getEllipsizedAddress,
  getEtherscanLink,
} from "@/app/utils/clientHelper";
import Claim from "@/app/components/airdrops/Claim";
import OwnerMenu from "@/app/components/airdrops/OwnerMenu";
import { useBalance } from "wagmi";
import type { AirdropHex } from "@/app/types/airdrop";

export default function AirdropDetail({
  chainId,
  airdrop,
}: {
  chainId: string;
  airdrop: AirdropHex;
}) {
  const {
    address,
    isConnecting,
    isReconnecting,
    isConnected: isConnectedRaw,
  } = useRequireAccount();
  const { data: session } = useSession();
  const isMounted = useIsMounted();
  const { t } = useTranslation();

  const [isConnected, setIsConnected] = useState<boolean>(false);
  useEffect(() => setIsConnected(isConnectedRaw), [isConnectedRaw]);

  // Get token balance on airdrop contract
  const { data: balanceOnContract } = useBalance({
    address: airdrop.contractAddress || "0x",
    token: airdrop.tokenAddress || "0x",
  });

  if (!isMounted || !address)
    return (
      <Center>
        <Spinner />
      </Center>
    );
  const isOwner =
    session?.user?.address && session.user.address.toLowerCase() === airdrop?.owner.toLowerCase();
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
                    {t(`dashboard.${formatTemplateType(airdrop.templateName)}`)}
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
                  {airdrop.title}
                </Text>
                <Flex alignItems="baseline" direction={{ base: "column", xl: "row" }}>
                  <Flex alignItems="baseline" direction="row">
                    <Text fontSize="md" fontWeight="bold" mr={4}>
                      {formatTotalAirdropAmount(airdrop.totalAirdropAmount)}
                    </Text>
                  </Flex>
                  <Flex alignItems="baseline" direction="row">
                    <Text fontSize="md" fontWeight="bold" mr={1}>
                      {formatClaimedAccounts(airdrop.eligibleUsersNum, airdrop.claimedUsersNum)}
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
                <Text fontSize={{ base: "xs" }} marginRight="1">
                  {t("airdrop.tokenAddress")}
                </Text>
              </Box>
              <Link
                fontSize="sm"
                fontWeight={{ sm: "bold" }}
                py={{ base: "0.5", sm: "1" }}
                mt="1.5"
                mr={{ base: "0", lg: "4" }}
                href={getEtherscanLink(chainId, airdrop.tokenAddress, "address")}
                target="_blank"
              >
                {getEllipsizedAddress({ address: airdrop.tokenAddress })}
                <Icon as={ExternalLinkIcon} ml={1} mb={1} />
              </Link>
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
                <Text fontSize={{ base: "xs" }} marginRight="1">
                  {t("airdrop.airdropContract")}
                </Text>
              </Box>
              <Link
                fontSize="sm"
                fontWeight={{ sm: "bold" }}
                py={{ base: "0.5", sm: "1" }}
                mt="1.5"
                _hover={!airdrop.contractAddress ? { textDecoration: "none" } : undefined}
                cursor={!airdrop.contractAddress ? "default" : "pointer"}
                href={
                  airdrop.contractAddress
                    ? getEtherscanLink(chainId, airdrop.contractAddress, "address")
                    : undefined
                }
                target="_blank"
              >
                {airdrop.contractAddress
                  ? getEllipsizedAddress({ address: airdrop.contractAddress })
                  : "Not registered"}
                {airdrop.contractAddress && <Icon as={ExternalLinkIcon} ml={1} mb={1} />}
              </Link>
            </Flex>
          </Box>

          {/* Status Section */}
          {/* TODO If eligible */}
          {airdrop.contractAddress && (
            <Claim
              chainId={chainId}
              address={address}
              airdropId={airdrop.id}
              contractAddress={airdrop.contractAddress}
              tokenAddress={airdrop.tokenAddress}
              tokenName={airdrop.tokenName}
              tokenSymbol={airdrop.tokenSymbol}
              tokenDecimals={airdrop.tokenDecimals}
              vestingEndsAt={airdrop.vestingEndsAt}
              templateName={airdrop.templateName}
            />
          )}

          {/* Menu Section */}
          {isOwner && (
            <OwnerMenu
              chainId={parseInt(chainId)}
              airdropId={airdrop.id}
              ownerAddress={address}
              contractAddress={airdrop.contractAddress}
            />
          )}
        </Box>
      </VStack>
    </Container>
  );
}
