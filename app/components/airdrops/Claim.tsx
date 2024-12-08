"use client";
import { useTranslation } from "react-i18next";
import { VStack, Box, HStack, Text, Button } from "@chakra-ui/react";
import { ClaimProps } from "@/app/interfaces/airdrop";

export default function Claim({ isLinearVesting, currentVestingEndsAt }: ClaimProps): JSX.Element {
  const { t } = useTranslation();
  const standardClaim = {
    amount: BigInt(2351),
    isClaimed: false,
  };
  const linearVestingClaim = {
    claimedAmount: BigInt(1021),
    claimable: BigInt(325),
  };
  return (
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
        {(isLinearVesting || (!isLinearVesting && !standardClaim.isClaimed)) && (
          <Button size="sm" colorScheme="blue" width="full" mt={4}>
            {t("airdrop.claim")}
          </Button>
        )}
      </VStack>
    </Box>
  );
}
