"use client";
import { Card, CardBody } from "@chakra-ui/react";
import { DashBoardCardProps } from "@/app/interfaces/dashboard";
import RenderCardContent from "@/app/components/dashboard/RenderCardContent";

export default function DashBoardCard({
  creationDate,
  publicationDate,
  airdropTitle,
  vestingType,
  totalAmount,
  claimedAccounts,
  vestingEndDate,
  resisteredStatus,
}: DashBoardCardProps) {
  return (
    <Card width="100%">
      <CardBody paddingX={{ base: "1", sm: "5" }}>
        <RenderCardContent
          creationDate={creationDate}
          publicationDate={publicationDate}
          airdropTitle={airdropTitle}
          vestingType={vestingType}
          totalAmount={totalAmount}
          claimedAccounts={claimedAccounts}
          vestingEndDate={vestingEndDate}
          resisteredStatus={resisteredStatus}
        />
      </CardBody>
    </Card>
  );
}
