"use client";
import DashBoardCard from "./DashBoardCard";
import { TemplateType } from "@/app/interfaces/dashboard";
import { Airdrop } from "@/app/interfaces/dashboard";

export default function RenderAirdrop() {
    const airdrops: Airdrop[] = [
      {
        id: "asdf",
        title: "Vesting",
        templateName: TemplateType.LINEAR_VESTING,
        owner: "0x",
        tokenAddress: "0x",
        createdAt: 1731897560,
        merkleTreeUploadedAt: 1731897560,
        contractAddress: "0x",
        totalAirdropAmount: BigInt(0.005 * 1e18),
        eligibleUsersNum: 1000,
        claimedUsersNum: 40,
        contractDeployedAt: 1731897560,
        vestingEndsAt: 1731897560,
      },
      {
        id: "zxcv",
        title: "Standard",
        templateName: TemplateType.STANDARD,
        owner: "0x",
        tokenAddress: "0x",
        createdAt: 1731897560,
        merkleTreeUploadedAt: undefined,
        contractAddress: undefined,
        totalAirdropAmount: BigInt(0.005 * 1e18),
        eligibleUsersNum: 1000,
        claimedUsersNum: 40,
        contractDeployedAt: 1731897560,
      },
    ];
    return airdrops.map((airdrop) => (
      <DashBoardCard key={airdrop.id} airdrop={airdrop} />
    ));
  }