"use client";
import { useContext, useEffect, useState } from "react";
import { parseEther } from "viem";
import { useTranslation } from "react-i18next";
import { VStack, Box, HStack, Text, Button, chakra } from "@chakra-ui/react";
import { AirdropNameABI, TemplateNames } from "@/app/lib/constants/templates";
import { useFetchClaimParams } from "@/app/hooks/airdrops/useFetchClaimParams";
import { useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { TxToastsContext } from "@/app/providers/ToastProvider";
import { TemplateType } from "@/app/types/airdrop";
import { formatAmount, formatDate } from "@/app/utils/clientHelper";

interface ClaimProps {
  chainId: string;
  address: `0x${string}`;
  airdropId: string;
  contractAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  templateName: TemplateType;
  vestingEndsAt: Date | null;
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
}: ClaimProps): JSX.Element {
  const { t } = useTranslation();
  const {
    data: claimParams,
    loading: claimLoading,
    error: claimError,
  } = useFetchClaimParams(chainId, airdropId, address);
  const { data, isError, isSuccess, failureReason } = useSimulateContract({
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
  const { setWritePromise } = useContext(TxToastsContext);
  const {} = useWaitForTransactionReceipt();

  const [isClaimed, setIsClaimed] = useState<boolean>(false);
  useEffect(() => {
    const claimed = !!failureReason && failureReason.message.includes("Error: AlreadyClaimed()");
    setIsClaimed(claimed);
    if (claimed) {
      // TODO
      // update isClaimed in AirdropClaimerMap on database.
      // API: PATCH /AirdropClaimerMap/:airdropId/:address
      // Also, watch the claim status on the contract and sync with the database as much as possible.
    }
  }, [failureReason, status]);

  const handleClaim = async () => {
    try {
      data && setWritePromise(writeContractAsync(data.request));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Box bg="#2E3748" borderRadius="md" boxShadow="md" p={4} mb={4}>
      <VStack spacing={0.5} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="md" fontWeight="900">
            {t("airdrop.yourAllocatedAmount")}
          </Text>
          <HStack justify="flex-start">
            <Text fontSize="3xl" fontWeight="medium">
              {`${claimParams?.amount ? formatAmount(claimParams.amount, tokenDecimals) : 0}`}
            </Text>
            <Text fontSize="md" fontWeight="medium">
              {tokenSymbol}
            </Text>
          </HStack>
        </HStack>
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
            !Boolean(data?.request) || status === "pending" || status === "success" || isClaimed
          }
          isLoading={status === "pending"}
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
    </Box>
  );
}
