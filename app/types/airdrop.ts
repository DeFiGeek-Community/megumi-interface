import type { GetContractReturnType, PublicClient } from "viem";
import { TemplateNames, TemplateNamesType } from "@/app/lib/constants/templates";
import { MerkleAirdropBase, Standard, LinearVesting } from "@/app/lib/constants/abis";
import { Airdrop as AirdropM, AirdropClaimerMap } from "@/prisma";

export type AirdropFormType = {
  chainId: number;
  title: string;
  contractAddress: `0x${string}` | null;
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

// export type TemplateType = (typeof TemplateNames)[keyof typeof TemplateNames];

// Mock type ---->
// export type Airdrop = Standard | LinearVesting;

// export type Standard = {
//   id: string;
//   title: string;
//   templateName: TemplateType;
//   owner: string;
//   tokenAddress: string;
//   createdAt: number;
//   merkleTreeUploadedAt: number | undefined;
//   contractAddress: string | undefined;
//   totalAirdropAmount: bigint | undefined;
//   eligibleUsersNum: number | undefined;
//   claimedUsersNum: number | undefined;
//   contractDeployedAt: number | undefined;
// };

// export type LinearVesting = Standard & {
//   vestingEndsAt: number;
// };
// <---- Mock type

// Airdrop Creation
export type AirdropCreationData = Omit<AirdropM, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
export type AirdropClaimerMapHex = Omit<AirdropClaimerMap, "proofs" | "amount"> & {
  proofs: `0x${string}`[];
  amount: string;
  index: number;
  isClaimed: boolean;
};

export type AirdropAggregationData = {
  eligibleUsersNum?: number;
  claimedUsersNum?: number;
};

// For frontend
export type AirdropHex = Omit<
  AirdropM,
  "contractAddress" | "templateName" | "owner" | "tokenAddress" | "totalAirdropAmount"
> & {
  contractAddress: `0x${string}` | null;
  templateName: TemplateNamesType;
  owner: `0x${string}`;
  tokenAddress: `0x${string}`;
  totalAirdropAmount: string | null;
} & AirdropAggregationData & { AirdropClaimerMap?: AirdropClaimerMapHex[] };
export type AirdropWithClaimMap = AirdropM &
  AirdropAggregationData & { AirdropClaimerMap?: AirdropClaimerMap[] };

export type MerkleTreeClaim = {
  index: number;
  amount: `0x${string}`; // Hex string
  proof: `0x${string}`[]; // Array of hex strings
};

export type MerkleTreeData = {
  airdropAmount: string; // Numeric string
  merkleRoot: `0x${string}`; // Hex string
  claims: {
    [address: `0x${string}`]: MerkleTreeClaim;
  };
};
