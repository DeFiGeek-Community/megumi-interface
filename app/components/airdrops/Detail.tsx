"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Center,
  Container,
  Spinner,
  VStack,
  Box,
  HStack,
  Text,
  Flex,
  Icon,
  Tag,
  Tooltip,
  Link,
} from "@chakra-ui/react";
import ConnectButton from "@/app/components/common/ConnectButton";
import { useIsMounted } from "@/app/hooks/common/useIsMounted";
import { useTranslation } from "react-i18next";
import { ExternalLinkIcon, QuestionIcon } from "@chakra-ui/icons";
import {
  formatClaimedAccounts,
  formatTemplateType,
  getEllipsizedAddress,
  getEtherscanLink,
  formatAmount,
} from "@/app/utils/clientHelper";
import Claim from "@/app/components/airdrops/Claim";
import OwnerMenu from "@/app/components/airdrops/OwnerMenu";
import type { AirdropHex } from "@/app/types/airdrop";
import { API_BASE_URL } from "@/app/lib/constants";
import { useAccount, useBalance } from "wagmi";
import { TokenLogo } from "../common/TokenLogo";
import { TokenAddButton } from "../common/TokenAddButton";

export default function AirdropDetail({
  chainId,
  initAirdrop,
}: {
  chainId: string;
  initAirdrop: AirdropHex;
}) {
  const { address, isConnected: isConnectedRaw } = useAccount();
  const { data: session } = useSession();
  const isMounted = useIsMounted();
  const { t } = useTranslation();

  const [airdrop, setAirdrop] = useState<AirdropHex>(initAirdrop);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  useEffect(() => setIsConnected(isConnectedRaw), [isConnectedRaw]);

  const API_URL = `${API_BASE_URL}/airdrops`;
  const refetchAirdrop = async () => {
    const response = await fetch(`${API_URL}/${chainId}/${airdrop.id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch airdrop claim");
    }

    const responseData: AirdropHex = await response.json();
    setAirdrop(responseData);
  };

  // Get token balance on airdrop contract
  const { data: balanceOnContract, refetch: refetchBalance } = useBalance({
    address: airdrop.contractAddress || "0x",
    token: airdrop.tokenAddress || "0x",
  });

  const refetch = async () => {
    refetchAirdrop();
    refetchBalance();
  };

  if (!isMounted)
    return (
      <Center>
        <Spinner />
      </Center>
    );
  const signedInUserAddress = session?.user.safeAddress || session?.user.address;
  const userAddress = !isConnected ? undefined : signedInUserAddress || address;
  const isOwner = signedInUserAddress?.toLowerCase() === airdrop.owner.toLowerCase();
  return (
    <Container maxW={"container.xl"} mb={4}>
      <VStack spacing="4">
        <Box width={{ base: "100%", md: "50%" }}>
          {/* Header Section */}
          <Box borderRadius="md" p={{ base: "0", lg: "4" }} mb={4}>
            <HStack spacing={3} mb={4}>
              <TokenLogo
                width={"96px"}
                height={"96px"}
                borderRadius={"full"}
                tokenName={airdrop.tokenName}
                tokenLogo={airdrop.tokenLogo}
                airdropTitle={airdrop.title}
              />
              <Box>
                <Tag>
                  {t(`dashboard.${formatTemplateType(airdrop.templateName)}`)}
                  <Tooltip
                    hasArrow
                    label={t(
                      `common.templateExplanation.${formatTemplateType(airdrop.templateName)}`,
                    )}
                  >
                    <QuestionIcon ml={1} />
                  </Tooltip>
                </Tag>
                <Text fontSize="3xl" fontWeight="bold">
                  {airdrop.title}
                </Text>
                <Flex alignItems="baseline" direction={{ base: "column", xl: "row" }}>
                  <Flex alignItems="baseline" direction="row">
                    <Text fontSize="md" fontWeight="bold" mr={4}>
                      {airdrop.totalAirdropAmount
                        ? formatAmount(
                            BigInt(airdrop.totalAirdropAmount),
                            airdrop.tokenDecimals || undefined,
                          )
                        : "-"}{" "}
                      {airdrop.tokenSymbol}
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
            <Flex
              direction={{ base: "column", lg: "row" }}
              alignItems={{ base: undefined, lg: "center" }}
            >
              <Box
                bg="brand.bg.tertiary"
                borderRadius="md"
                borderWidth="1px"
                borderColor="brand.border.subtle"
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
              {airdrop.tokenAddress ? (
                <Flex>
                  <Link
                    fontSize="sm"
                    fontWeight={{ sm: "bold" }}
                    py={{ base: "0.5", sm: "1" }}
                    mt="1.5"
                    mr={{ base: "0", lg: "2" }}
                    href={
                      airdrop.tokenAddress
                        ? getEtherscanLink(chainId, airdrop.tokenAddress, "address")
                        : undefined
                    }
                    _hover={!airdrop.tokenAddress ? { textDecoration: "none" } : undefined}
                    cursor={!airdrop.tokenAddress ? "default" : "pointer"}
                    target="_blank"
                  >
                    <>
                      {getEllipsizedAddress({ address: airdrop.tokenAddress })}
                      <Icon as={ExternalLinkIcon} ml={1} mb={1} />
                    </>
                  </Link>
                  <TokenAddButton
                    size={"xs"}
                    address={airdrop.tokenAddress}
                    symbol={airdrop.tokenSymbol}
                    decimals={airdrop.tokenDecimals}
                    image={airdrop.tokenLogo ? airdrop.tokenLogo : undefined}
                    colorScheme="gray"
                    mr={2}
                    py={{ base: "0.5", sm: "1" }}
                    mt="1.5"
                  />
                </Flex>
              ) : (
                t("airdrop.unregistered")
              )}

              <Box
                bg="brand.bg.tertiary"
                borderRadius="md"
                borderWidth="1px"
                borderColor="brand.border.subtle"
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
                  : t("airdrop.unregistered")}
                {airdrop.contractAddress && <Icon as={ExternalLinkIcon} ml={1} mb={1} />}
              </Link>
            </Flex>
          </Box>

          {!address && (
            <Flex
              bg="brand.bg.card"
              borderRadius="16px"
              borderWidth="1px"
              borderColor="brand.border.subtle"
              backdropFilter="blur(10px)"
              boxShadow="md"
              p={4}
              mb={4}
              justifyContent={"center"}
              transition="all 0.3s ease"
              _hover={{
                borderColor: "brand.border.medium",
              }}
            >
              <ConnectButton requireSignIn={false} label={t("common.connectWallet")} size="sm" />
            </Flex>
          )}

          {userAddress && airdrop.contractAddress && (
            <Claim
              chainId={chainId}
              address={userAddress as `0x${string}`}
              isAddressSafe={!!session?.user.safeAddress}
              airdropId={airdrop.id}
              contractAddress={airdrop.contractAddress}
              tokenAddress={airdrop.tokenAddress}
              tokenName={airdrop.tokenName}
              tokenSymbol={airdrop.tokenSymbol}
              tokenDecimals={airdrop.tokenDecimals}
              vestingEndsAt={airdrop.vestingEndsAt}
              templateName={airdrop.templateName}
              balanceOnContract={balanceOnContract}
              refetchAirdrop={refetch}
            />
          )}

          {isOwner && (
            <OwnerMenu
              chainId={parseInt(chainId)}
              airdropId={airdrop.id}
              ownerAddress={signedInUserAddress}
              isOwnerSafe={!!session?.user.safeAddress}
              contractAddress={airdrop.contractAddress}
              totalAirdropAmount={airdrop.totalAirdropAmount}
              merkleTreeRegisteredAt={airdrop.merkleTreeRegisteredAt}
              contractRegisteredAt={airdrop.contractRegisteredAt}
              lastSyncedAt={airdrop.lastSyncedAt}
              balanceOnContract={balanceOnContract}
              title={airdrop.title}
              tokenAddress={airdrop.tokenAddress}
              tokenSymbol={airdrop.tokenSymbol}
              tokenDecimals={airdrop.tokenDecimals}
              templateName={airdrop.templateName}
              tokenLogo={airdrop.tokenLogo}
              refetchAirdrop={refetch}
            />
          )}
        </Box>
      </VStack>
    </Container>
  );
}
