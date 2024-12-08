"use client";
import {} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Center, Container, Heading, Spinner, VStack, Box } from "@chakra-ui/react";
import { useRequireAccount } from "@/app/hooks/common/useRequireAccount";
import AirdropDetails from "@/app/components/airdrops/cards/AirdropDetails";
import { useIsMounted } from "@/app/hooks/common/useIsMounted";
import { TemplateType, Airdrop } from "@/app/interfaces/dashboard";
import { Stack, HStack, Text, Button, Avatar, Divider, Flex, Icon } from "@chakra-ui/react";
import { ExternalLinkIcon, WarningTwoIcon } from "@chakra-ui/icons";
import { ClaimProps } from "@/app/interfaces/airdrop";
export default function Claim({
    isLinearVesting,
  }: ClaimProps): JSX.Element {
  const { t } = useTranslation();
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
