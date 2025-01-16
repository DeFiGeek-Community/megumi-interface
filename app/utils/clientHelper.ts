import { TemplateType } from "@/app/types/airdrop";
import { fromHex } from "viem";

export const formatDate = (timestamp: number | undefined) => {
  // sv-SE locale returns date string in YYYY-MM-DD format.
  // The default is YYYYY/MM/DD format.
  return timestamp ? new Date(timestamp * 1000).toLocaleDateString("sv-SE") : "-";
};

export const formatTemplateType = (tempTemplateType: TemplateType) => {
  return fromHex(tempTemplateType, { size: 32, to: "string" });
};

export const formatTotalAirdropAmount = (tempTotalAirdropAmount: bigint | undefined) => {
  const temp = tempTotalAirdropAmount ? tempTotalAirdropAmount.toString() : "0";
  return temp + " YMT";
};

export const formatClaimedAccounts = (
  tempEligibleUsersNum: number | undefined,
  tempClaimedUsersNum: number | undefined,
) => {
  return tempClaimedUsersNum && tempEligibleUsersNum
    ? `${tempClaimedUsersNum} / ${tempEligibleUsersNum}`
    : "0 / 0";
};

export const formatVestingEndsAt = (tempVestingEndsAt?: number | undefined) => {
  return tempVestingEndsAt ? formatDate(tempVestingEndsAt) : "-";
};
