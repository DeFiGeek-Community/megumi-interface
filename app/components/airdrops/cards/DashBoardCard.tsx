"use client";
import { Card, CardBody } from "@chakra-ui/react";
import { DashBoardCardProps } from "@/app/interfaces/dashboard";
import RenderCardContent from "@/app/components/airdrops/cards/RenderCardContent";
import { TemplateTypeString } from "@/app/interfaces/dashboard";
import { TemplateType } from "@/app/interfaces/dashboard";
import { Airdrop } from "@/app/interfaces/dashboard";

export default function DashBoardCard({
  creationDate,
  publicationDate,
  airdropTitle,
  templeteType,
  totalAmount,
  claimedAccounts,
  vestingEndDate,
  resisteredStatus,
  airdrop,
}: DashBoardCardProps & { airdrop?: Airdrop }) {
  const formatDate = (timestamp: number | undefined) => {
    // sv-SE locale returns date string in YYYY-MM-DD format.
    // The default is YYYYY/MM/DD format.
    return timestamp ? new Date(timestamp * 1000).toLocaleDateString("sv-SE") : "-";
  };
  const formatTempleteType = (tempTempleteType: string) => {
    return tempTempleteType === TemplateType.STANDARD ? "Standard" : "Linear vesting";
  };
  const formatTotalAirdropAmount = (tempTotalAirdropAmount: bigint | undefined) => {
    const temp = tempTotalAirdropAmount ? tempTotalAirdropAmount.toString() : "0"
    return temp + " YMT";
  };

  let airdropContractDeployedAt = "-",
    airdropCreatedAt = "-",
    currentTempleteType: TemplateTypeString = "Standard",
    currentTotalAirdropAmount = "0";
  if (airdrop) {
    airdropContractDeployedAt = formatDate(airdrop.contractDeployedAt);
    airdropCreatedAt = formatDate(airdrop.createdAt);
    currentTempleteType = formatTempleteType(airdrop.templateName);
    currentTotalAirdropAmount = formatTotalAirdropAmount(airdrop.totalAirdropAmount);
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
            claimedAccounts={claimedAccounts}
            vestingEndDate={vestingEndDate}
            resisteredStatus={resisteredStatus}
          />
        )}
      </CardBody>
    </Card>
  );
}
