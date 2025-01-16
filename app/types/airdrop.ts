import type { GetContractReturnType, PublicClient } from "viem";
import { TemplateNames } from "@/app/lib/constants/templates";
import { MerkleAirdropBase, Standard, LinearVesting } from "@/app/lib/constants/abis";

export type AirdropFormType = {
  chainId: number;
  title: string;
  contractAddress: `0x${string}`;
  templateName: `0x${string}`;
  owner: `0x${string}`;
  tokenAddress: `0x${string}`;
  tokenLogo: string;
};

export type AirdropABIType = typeof MerkleAirdropBase | typeof Standard | typeof LinearVesting;

export type AirdropContractType = GetContractReturnType<AirdropABIType, PublicClient, any>;

export type AirdropValidationType = {
  chainId?: string;
  title?: string;
  templateName?: string;
  contractAddress?: string;
  tokenAddress?: string;
  tokenLogo?: string;
};

export type TemplateType = (typeof TemplateNames)[keyof typeof TemplateNames];

// Mock type ---->
export type Airdrop = Standard | LinearVesting;

export type Standard = {
  id: string;
  title: string;
  templateName: TemplateType;
  owner: string;
  tokenAddress: string;
  createdAt: number;
  merkleTreeUploadedAt: number | undefined;
  contractAddress: string | undefined;
  totalAirdropAmount: bigint | undefined;
  eligibleUsersNum: number | undefined;
  claimedUsersNum: number | undefined;
  contractDeployedAt: number | undefined;
};

export type LinearVesting = Standard & {
  vestingEndsAt: number;
};
// <---- Mock type
