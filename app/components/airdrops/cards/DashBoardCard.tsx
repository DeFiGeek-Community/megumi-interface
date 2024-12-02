"use client";
import { Card, CardBody } from "@chakra-ui/react";
import CardContent from "@/app/components/airdrops/cards/CardContent";
import { Airdrop } from "@/app/interfaces/dashboard";
import {
  formatDate,
  isStandard,
  formatTotalAirdropAmount,
  formatClaimedAccounts,
  formatVestingEndsAt,
} from "@/app/lib/airdrop/airdropUtils";

export default function DashBoardCard({ airdrop }: { airdrop: Airdrop }) {
  let airdropContractDeployedAt = "-",
    airdropCreatedAt = "-",
    isStandardTempleteType = false,
    currentTotalAirdropAmount = "0",
    currentClaimedAccounts = "0 / 0",
    currentVestingEndsAt = "-",
    isResisteredAirdrop = false,
    isResisteredContract = false;

  airdropContractDeployedAt = formatDate(airdrop.contractDeployedAt);
  airdropCreatedAt = formatDate(airdrop.createdAt);
  isStandardTempleteType = isStandard(airdrop.templateName);
  currentTotalAirdropAmount = formatTotalAirdropAmount(airdrop.totalAirdropAmount);
  currentClaimedAccounts = formatClaimedAccounts(airdrop.eligibleUsersNum, airdrop.claimedUsersNum);
  if ("vestingEndsAt" in airdrop) {
    currentVestingEndsAt = formatVestingEndsAt(airdrop.vestingEndsAt);
  }
  isResisteredAirdrop = !!airdrop.merkleTreeUploadedAt;
  isResisteredContract = !!airdrop.contractAddress;

  const CardContentProps = {
    creationDate: airdropCreatedAt,
    publicationDate: airdropContractDeployedAt,
    airdropTitle: airdrop.title,
    isStandard: isStandardTempleteType,
    totalAmount: currentTotalAirdropAmount,
    claimedAccounts: currentClaimedAccounts,
    vestingEndDate: currentVestingEndsAt,
    isResisteredAirdrop: isResisteredAirdrop,
    isResisteredContract: isResisteredContract,
  };
  return (
    <Card width="100%">
      <CardBody paddingX={{ base: "1", sm: "5" }}>
        <CardContent {...CardContentProps} />
      </CardBody>
    </Card>
  );
}
