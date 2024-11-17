export interface DashBoardCardProps {
  creationDate: string;
  publicationDate: string;
  airdropTitle: string;
  totalAmount: string;
  claimedAccounts: string;
  vestingEndDate: string;
  status: "registered" | "unregistered";
}
