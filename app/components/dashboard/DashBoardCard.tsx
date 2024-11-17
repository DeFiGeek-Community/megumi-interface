"use client";
import { Card, CardBody } from "@chakra-ui/react";
import { useIsMobile } from "@/app/lib/chakra/chakraUtils";
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
  const isMobile = useIsMobile();

  return (
    <Card width="100%">
      <CardBody paddingX={isMobile ? "1" : undefined}>
        <RenderCardContent
          creationDate={creationDate}
          publicationDate={publicationDate}
          airdropTitle={airdropTitle}
          vestingType={vestingType}
          totalAmount={totalAmount}
          claimedAccounts={claimedAccounts}
          vestingEndDate={vestingEndDate}
          resisteredStatus={resisteredStatus}
          isMobile={isMobile}
        />
      </CardBody>
    </Card>
  );
}
