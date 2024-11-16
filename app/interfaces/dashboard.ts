export interface DashBoardCardProps {
  creationDate: string;
  publicationDate: string;
  totalAmount: string;
  claimedAccounts: string;
  vestingEndDate: string;
  status: "registered" | "unregistered";
}
