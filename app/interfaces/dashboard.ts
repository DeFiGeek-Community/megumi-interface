export interface DashBoardCardProps {
  creationDate: string;
  publicationDate: string;
  airdropTitle: string;
  templeteType: TemplateTypeString;
  totalAmount: string;
  claimedAccounts: string;
  vestingEndDate: string;
  resisteredAirdropStatus: boolean;
  resisteredContractStatus: boolean;
}

export interface RenderStatusProps {
  isAirdropResistered: boolean;
  isContractResistered: boolean;
}

export interface RenderDateContentProps {
  creationDate: string;
  publicationDate: string;
}

export interface RenderDetailedInfoProps {
  totalAmount: string;
  claimedAccounts: string;
  vestingEndDate: string;
}

export interface RenderAirdropInfoProps {
  airdropTitle: string;
  templeteType: TemplateTypeString;
}

export type TemplateTypeString = "Standard" | "Linear vesting";

export const TemplateType = {
  STANDARD: "0x5374616e64617264000000000000000000000000000000000000000000000000",
  LINEAR_VESTING: "0x4c696e65617256657374696e6700000000000000000000000000000000000000",
} as const;

export type TemplateType = (typeof TemplateType)[keyof typeof TemplateType];

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
