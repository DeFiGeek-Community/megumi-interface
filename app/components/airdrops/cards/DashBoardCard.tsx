"use client";
import { Card, CardBody } from "@chakra-ui/react";
import { DashBoardCardProps } from "@/app/interfaces/dashboard";
import RenderCardContent from "@/app/components/airdrops/cards/RenderCardContent";
import { TemplateTypeString } from "@/app/interfaces/dashboard";
import { TemplateType } from "@/app/interfaces/dashboard";
import { Airdrop } from "@/app/interfaces/dashboard";

export default function DashBoardCard({
  airdrop,
}: { airdrop: Airdrop }) {
  const formatDate = (timestamp: number | undefined) => {
    // sv-SE locale returns date string in YYYY-MM-DD format.
    // The default is YYYYY/MM/DD format.
    return timestamp ? new Date(timestamp * 1000).toLocaleDateString("sv-SE") : "-";
  };
  const handleTempleteType = (tempTempleteType: string) => {
    return tempTempleteType === TemplateType.STANDARD;
  }
  const formatTempleteType = (tempTempleteType: string) => {
    return handleTempleteType(tempTempleteType) ? "Standard" : "Linear vesting";
  };
  const formatTotalAirdropAmount = (tempTotalAirdropAmount: bigint | undefined) => {
    const temp = tempTotalAirdropAmount ? tempTotalAirdropAmount.toString() : "0"
    return temp + " YMT";
  };
  const formatClaimedAccounts = (tempEligibleUsersNum: number | undefined,
    tempClaimedUsersNum: number | undefined) => {
    return tempClaimedUsersNum && tempEligibleUsersNum 
    ? `${tempClaimedUsersNum} / ${tempEligibleUsersNum}`
    : "0 / 0";
  };
  const formatVestingEndsAt = (tempVestingEndsAt?: number | undefined) => {
    return tempVestingEndsAt ? formatDate(tempVestingEndsAt) : "-";
  };
  const handleResisteredStatus = (temp: number | string | undefined) => {
    return temp ? true : false;
  }

  let airdropContractDeployedAt = "-",
    airdropCreatedAt = "-",
    currentTempleteType: TemplateTypeString = "Standard",
    currentTotalAirdropAmount = "0",
    currentClaimedAccounts = "0 / 0",
    currentVestingEndsAt = "-",
    currentResisteredStatus = false,
    currentResisteredAirdropStatus = false,
    currentResisteredContractStatus = false;

  if (airdrop) {
    airdropContractDeployedAt = formatDate(airdrop.contractDeployedAt);
    airdropCreatedAt = formatDate(airdrop.createdAt);
    currentTempleteType = formatTempleteType(airdrop.templateName);
    currentTotalAirdropAmount = formatTotalAirdropAmount(airdrop.totalAirdropAmount);
    currentClaimedAccounts = formatClaimedAccounts(airdrop.eligibleUsersNum, airdrop.claimedUsersNum);
    if('vestingEndsAt' in airdrop){
      currentVestingEndsAt = formatVestingEndsAt(airdrop.vestingEndsAt);
    }
    currentResisteredAirdropStatus = handleResisteredStatus(airdrop.merkleTreeUploadedAt);
    currentResisteredContractStatus = handleResisteredStatus(airdrop.contractAddress);
  } 
  return (
    <Card width="100%">
      <CardBody paddingX={{ base: "1", sm: "5" }}>
        {airdrop && (
          <RenderCardContent
            creationDate={airdropCreatedAt}
            publicationDate={airdropContractDeployedAt}
            airdropTitle={airdrop.title}
            templeteType={currentTempleteType}
            totalAmount={currentTotalAirdropAmount}
            claimedAccounts={currentClaimedAccounts}
            vestingEndDate={currentVestingEndsAt}
            resisteredStatus={currentResisteredStatus}
            resisteredAirdropStatus={currentResisteredAirdropStatus}
            resisteredContractStatus={currentResisteredContractStatus}
          />
        )}
      </CardBody>
    </Card>
  );
}
