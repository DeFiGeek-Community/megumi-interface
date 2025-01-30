"use client";
import { useContext, useEffect, useState } from "react";
import { parseEther } from "viem";
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
import { AirdropNameABI, TemplateNames, TemplateNamesType } from "@/app/lib/constants/templates";
import { useFetchClaimParams } from "@/app/hooks/airdrops/useFetchClaimParams";
import { useSimulateContract, useWriteContract } from "wagmi";
import { TxToastsContext } from "@/app/providers/ToastProvider";
import { formatAmount, formatDate } from "@/app/utils/clientHelper";
import { useUpdateClaimStatus } from "@/app/hooks/airdrops/useUpdateIsClaimed";
import { getErrorMessage } from "@/app/utils/shared";

interface ClaimProps {
  chainId: string;
  address: `0x${string}`;
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
  const { data, isError, isSuccess, failureReason, isFetched } = useSimulateContract({
    chainId: parseInt(chainId),
    address: contractAddress,
    abi: AirdropNameABI[templateName],
    functionName: "claim",
    args:
      claimParams && address
        ? [claimParams.index, address, claimParams.amount, claimParams.proofs]
        : [],
    value: parseEther("0.0002"), // Fixed fee
    query: {
      enabled: !!claimParams && !!address,
    },
  });
  const { writeContractAsync, status } = useWriteContract();
  const { setWritePromise, waitResult } = useContext(TxToastsContext);
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

  const handleClaim = async () => {
    try {
      data && setWritePromise(writeContractAsync(data.request));
    } catch (error: unknown) {
      toast({ title: getErrorMessage(error), status: "error" });
    }
  };

  useEffect(() => {
    if (waitResult?.isSuccess) {
      refetch();
    }
  }, [waitResult?.isSuccess]);

  useEffect(() => {
    const claimed =
      claimParams?.isClaimed ||
      (!!failureReason && failureReason.message.includes("Error: AlreadyClaimed()"));
    setIsClaimed(claimed);
  }, [failureReason, status, waitResult?.isSuccess, claimParams?.isClaimed]);

  return (
    <Box bg="#2E3748" borderRadius="md" boxShadow="md" p={4} mb={4}>
      {!claimParams && claimLoading && (
        <Flex justifyContent={"center"} alignItems={"center"} py={10}>
          <Spinner />
        </Flex>
      )}
      {!claimParams && !claimLoading && !failureReason && (
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
              !data?.request ||
              status === "pending" ||
              status === "success" ||
              isClaimed ||
              waitResult?.isLoading
            }
            isLoading={status === "pending" || waitResult?.isLoading}
            onClick={() => handleClaim()}
            size="sm"
            colorScheme="blue"
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
