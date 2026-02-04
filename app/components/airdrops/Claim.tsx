"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  VStack,
  Box,
  HStack,
  Text,
  Button,
  chakra,
  Spinner,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { TemplateNames, TemplateNamesType } from "@/app/lib/constants/templates";
import { useFetchClaimParams } from "@/app/hooks/airdrops/useFetchClaimParams";
import { formatAmount, formatDate } from "@/app/utils/clientHelper";
import { useUpdateClaimStatus } from "@/app/hooks/airdrops/useUpdateIsClaimed";
import useClaim from "@/app/hooks/airdrops/useClaim";

interface ClaimProps {
  chainId: string;
  address: `0x${string}`;
  isAddressSafe: boolean;
  airdropId: string;
  contractAddress: `0x${string}`;
  tokenAddress: `0x${string}` | null;
  tokenName: string | null;
  tokenSymbol: string | null;
  tokenDecimals: number | null;
  templateName: TemplateNamesType;
  vestingEndsAt: Date | null;
  balanceOnContract:
    | {
        decimals: number;
        formatted: string;
        symbol: string;
        value: bigint;
      }
    | undefined;
  refetchAirdrop: () => Promise<void>;
}

export default function Claim({
  chainId,
  address,
  isAddressSafe = false,
  airdropId,
  contractAddress,
  tokenAddress,
  tokenName,
  tokenSymbol,
  tokenDecimals,
  vestingEndsAt,
  templateName,
  balanceOnContract,
  refetchAirdrop,
}: ClaimProps): JSX.Element {
  const { t } = useTranslation();
  const toast = useToast({ position: "top-right", isClosable: true });
  const {
    data: claimParams,
    loading: claimLoading,
    error: claimError,
    fetchClaimParams,
  } = useFetchClaimParams(chainId, airdropId, address);

  const { prepareFn, writeFn, waitFn } = useClaim({
    chainId: parseInt(chainId),
    contractAddress,
    claimerAddress: address,
    templateName,
    claimParams:
      !!claimParams && !!address
        ? [claimParams.index, address, claimParams.amount, claimParams.proofs]
        : [],
    isSafeTx: isAddressSafe,
  });
  const { updateClaimStatus } = useUpdateClaimStatus(
    chainId,
    airdropId,
    address,
    claimParams === null ? true : claimParams.isClaimed,
  );
  const [isClaimed, setIsClaimed] = useState<boolean>(false);

  const refetch = async () => {
    await updateClaimStatus();
    await refetchAirdrop();
    await fetchClaimParams();
  };

  const handleClaim = writeFn.claim;

  useEffect(() => {
    if (waitFn.isSuccess) {
      refetch();
    }
  }, [waitFn.isSuccess]);

  useEffect(() => {
    const claimed =
      claimParams?.isClaimed ||
      (!!prepareFn.failureReason &&
        prepareFn.failureReason.message.includes("Error: AlreadyClaimed()"));
    setIsClaimed(claimed);
  }, [prepareFn.failureReason, writeFn.status, waitFn.isSuccess, claimParams?.isClaimed]);

  const claimButtonLoading =
    writeFn.claiming || waitFn.isLoading || (writeFn.isSuccess && waitFn.isPending);

  return (
    <Box
      bg="brand.bg.card"
      borderRadius="16px"
      borderWidth="1px"
      borderColor="brand.border.subtle"
      backdropFilter="blur(10px)"
      boxShadow="md"
      p={4}
      mb={4}
      transition="all 0.3s ease"
      _hover={{
        borderColor: "brand.border.medium",
        boxShadow: "0 0 20px rgba(252, 200, 98, 0.1)",
      }}
    >
      {!claimParams && claimLoading && (
        <Flex justifyContent={"center"} alignItems={"center"} py={10}>
          <Spinner />
        </Flex>
      )}
      {!claimParams && !claimLoading && !prepareFn.failureReason && (
        <chakra.div py={10} textAlign={"center"}>
          {t("airdrop.notEligible")} 😔
        </chakra.div>
      )}

      {claimParams && (
        <VStack spacing={0.5} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="md" fontWeight="900">
              {t("airdrop.yourAllocatedAmount")}
            </Text>
            <HStack justify="flex-start">
              {claimLoading ? (
                <Spinner />
              ) : (
                <>
                  <Text fontSize="3xl" fontWeight="medium">
                    {`${formatAmount(BigInt(claimParams.amount), tokenDecimals || undefined)}`}
                  </Text>
                  <Text fontSize="md" fontWeight="medium">
                    {tokenSymbol}
                  </Text>
                </>
              )}
            </HStack>
          </HStack>
          <chakra.p color={"gray.400"} fontSize={"sm"} textAlign={"right"}>
            {t("airdrop.contractBalance")}:{" "}
            {balanceOnContract
              ? `${formatAmount(balanceOnContract.value, balanceOnContract.decimals)} ${balanceOnContract.symbol}`
              : "-"}
          </chakra.p>
          {templateName === TemplateNames.LinearVesting && (
            <>
              <HStack justify="space-between">
                <Text fontSize="sm">{t("airdrop.totalAmount")}</Text>
                <HStack justify="flex-start">
                  <Text fontSize="3xl" fontWeight="medium">
                    {/* TODO */}
                    {/* {`${claimedAmount + claimable}`} */}
                  </Text>
                  <Text fontSize="md" fontWeight="medium">
                    {tokenSymbol}
                  </Text>
                </HStack>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm">{t("dashboard.vestingDeadline")}</Text>
                <Text fontSize="3xl" fontWeight="medium">
                  {formatDate(vestingEndsAt, "yyyy-MM-dd")}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm">{t("airdrop.claimed")}</Text>
                <HStack justify="flex-start">
                  <Text fontSize="3xl" fontWeight="medium">
                    {/* TODO */}
                    {/* {`${claimedAmount}`} */}
                  </Text>
                  <Text fontSize="md" fontWeight="medium">
                    {tokenSymbol}
                  </Text>
                </HStack>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm">{t("airdrop.claimable")}</Text>
                <HStack justify="flex-start">
                  <Text fontSize="3xl" fontWeight="medium">
                    {/* TODO */}
                    {/* {`${claimable}`} */}
                  </Text>
                  <Text fontSize="md" fontWeight="medium">
                    {tokenSymbol}
                  </Text>
                </HStack>
              </HStack>
            </>
          )}
          <Button
            isDisabled={
              !prepareFn.data?.request ||
              writeFn.status === "success" ||
              isClaimed ||
              claimButtonLoading
            }
            isLoading={claimButtonLoading}
            onClick={() => handleClaim()}
            size="md"
            variant={isClaimed ? "goldOutline" : "gold"}
            width="full"
            mt={4}
          >
            {isClaimed ? t("airdrop.claimed") : t("airdrop.claim")}
          </Button>

          <chakra.p mt="2" fontSize={"xs"} color={"whiteAlpha.700"}>
            ※ {t("airdrop.feeNotice")}
          </chakra.p>
        </VStack>
      )}
    </Box>
  );
}
