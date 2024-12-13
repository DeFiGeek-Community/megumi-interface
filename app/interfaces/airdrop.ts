import type { GetContractReturnType, PublicClient } from "viem";
import MerkleAirdropBase from "@/app/lib/constants/abis/MerkleAirdropBase.json";

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

export type AirdropContractType = GetContractReturnType<
  typeof MerkleAirdropBase,
  PublicClient,
  any
>;

export type AirdropValidationType = {
  chainId?: string;
  title?: string;
  templateName?: string;
  contractAddress?: string;
  tokenAddress?: string;
  tokenLogo?: string;
};
