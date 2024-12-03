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
    isStandardTemplateType = false,
    currentTotalAirdropAmount = "0",
    currentClaimedAccounts = "0 / 0",
    currentVestingEndsAt = "-",
    isRegisteredAirdrop = false,
    isRegisteredContract = false;

  airdropContractDeployedAt = formatDate(airdrop.contractDeployedAt);
  airdropCreatedAt = formatDate(airdrop.createdAt);
  isStandardTemplateType = isStandard(airdrop.templateName);
  currentTotalAirdropAmount = formatTotalAirdropAmount(airdrop.totalAirdropAmount);
  currentClaimedAccounts = formatClaimedAccounts(airdrop.eligibleUsersNum, airdrop.claimedUsersNum);
  if ("vestingEndsAt" in airdrop) {
    currentVestingEndsAt = formatVestingEndsAt(airdrop.vestingEndsAt);
  }
  isRegisteredAirdrop = !!airdrop.merkleTreeUploadedAt;
  isRegisteredContract = !!airdrop.contractAddress;

  const CardContentProps = {
    creationDate: airdropCreatedAt,
    publicationDate: airdropContractDeployedAt,
    airdropTitle: airdrop.title,
    isStandard: isStandardTemplateType,
    totalAmount: currentTotalAirdropAmount,
    claimedAccounts: currentClaimedAccounts,
    vestingEndDate: currentVestingEndsAt,
    isRegisteredAirdrop: isRegisteredAirdrop,
    isRegisteredContract: isRegisteredContract,
  };
  return (
    <Card width="100%">
      <CardBody paddingX={{ base: "1", sm: "5" }}>
        <CardContent {...CardContentProps} />
      </CardBody>
    </Card>
  );
}
