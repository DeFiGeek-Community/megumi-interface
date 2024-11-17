export interface DashBoardCardProps {
  creationDate: string;
  publicationDate: string;
  airdropTitle: string;
  totalAmount: string;
  claimedAccounts: string;
  vestingEndDate: string;
  resisteredStatus: boolean;
}

export interface RenderStatusProps {
  isResistered: boolean;
}
