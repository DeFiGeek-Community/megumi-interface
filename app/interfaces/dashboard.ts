export interface DashBoardCardProps {
  creationDate: string;
  publicationDate: string;
  airdropTitle: string;
  vestingType: "Linear vesting" | "Standard";
  totalAmount: string;
  claimedAccounts: string;
  vestingEndDate: string;
  resisteredStatus: boolean;
}

export interface RenderStatusProps {
  isResistered: boolean;
}

export interface RenderDateContentProps {
  creationDate: string;
  publicationDate: string;
  isMobile: boolean;
}

export interface RenderDetailedInfoProps {
  totalAmount: string;
  claimedAccounts: string;
  vestingEndDate: string;
}

export interface RenderAirdropInfoProps {
  airdropTitle: string;
  vestingType: "Linear vesting" | "Standard";
  isMobile: boolean;
}
