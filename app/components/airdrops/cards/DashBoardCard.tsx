"use client";
import { Card, CardBody } from "@chakra-ui/react";
import { DashBoardCardProps } from "@/app/interfaces/dashboard";
import RenderCardContent from "@/app/components/airdrops/cards/RenderCardContent";
import { Airdrop } from "@/app/interfaces/dashboard";

export default function DashBoardCard({
  creationDate,
  publicationDate,
  airdropTitle,
  vestingType,
  totalAmount,
  claimedAccounts,
  vestingEndDate,
  resisteredStatus,
  airdrop, // ここにAirdrop型を追加
}: DashBoardCardProps & { airdrop?: Airdrop }) { // 型を更新
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
