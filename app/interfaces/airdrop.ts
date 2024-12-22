import type { GetContractReturnType, PublicClient } from "viem";
import MerkleAirdropBase from "@/app/lib/constants/abis/MerkleAirdropBase.json";
import Standard from "@/app/lib/constants/abis/Standard.json";
import LinearVesting from "@/app/lib/constants/abis/LinearVesting.json";

export interface ClaimProps {
  isLinearVesting: boolean;
  currentVestingEndsAt?: string;
}

export type StandardClaim = {
  amount: bigint;
  isClaimed: boolean;
};
export type LinearVestingClaim = StandardClaim & {
  claimedAmount: bigint;
  claimable: bigint;
};

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
