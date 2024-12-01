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

  let airdropContractDeployedAt = "-",
    airdropCreatedAt = "-",
    currentTempleteType: TemplateTypeString = "Standard";
  if (airdrop) {
    airdropContractDeployedAt = formatDate(airdrop.contractDeployedAt);
    airdropCreatedAt = formatDate(airdrop.createdAt);
    currentTempleteType = formatTempleteType(airdrop.templateName);
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
            totalAmount={totalAmount}
            claimedAccounts={claimedAccounts}
            vestingEndDate={vestingEndDate}
            resisteredStatus={resisteredStatus}
          />
        )}
      </CardBody>
    </Card>
  );
}
