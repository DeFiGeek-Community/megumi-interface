import { fromHex } from "viem";
import type { GetEnsNameReturnType } from "viem/ens";
import { DateArg, format, FormatOptions } from "date-fns";
import { getChainById } from "@/app/utils/chain";
import { TemplateNamesType } from "@/app/lib/constants/templates";

export const getEtherscanLink = (
  chainId: number | string,
  hash: string | null,
  type: "tx" | "token" | "address" | "block",
): string => {
  if (!hash) return "";
  const chain = getChainById(chainId);
  if (typeof chain === "undefined" || typeof chain.blockExplorers === "undefined") return "";

  return `${chain.blockExplorers.default.url}/${type}/${hash}`;
};

export const ellipsisText = (text: string, maxLength: number = 20, ellipsis = "..."): string => {
  return text.length >= maxLength ? text.slice(0, maxLength - ellipsis.length) + ellipsis : text;
};

export const getEllipsizedAddress = ({
  address,
  ensName,
}: {
  address?: `0x${string}` | null;
  ensName?: GetEnsNameReturnType;
}): string => {
  if (!address) return "";
  return ensName ? `${ensName}` : `${address?.slice(0, 5)}...${address?.slice(-4)}`;
};

export const formatDate = (
  date: (DateArg<Date> & {}) | null,
  formatStr: string = "yyyy/MM/dd HH:mm(z)",
  options?: FormatOptions,
) => {
  return date ? format(date, formatStr, options) : "-";
};

export const formatTemplateType = (tempTemplateType: TemplateNamesType) => {
  return fromHex(tempTemplateType, { size: 32, to: "string" });
};

export const formatTotalAirdropAmount = (tempTotalAirdropAmount: string | null) => {
  const temp = tempTotalAirdropAmount ? tempTotalAirdropAmount : "0";
  return temp + " YMT";
};

export const formatClaimedAccounts = (
  eligibleUsersNum: number | undefined,
  claimedUsersNum: number | undefined,
) => {
  return `${claimedUsersNum ?? "-"} / ${eligibleUsersNum ?? "-"}`;
};

export const formatAmount = (
  amount: bigint | `0x${string}` | string,
  decimals: number = 18,
  precision: number = 3,
) => {
  if (precision > decimals) {
    precision = decimals;
  }
  const bigIntAmount = typeof amount === "bigint" ? amount : BigInt(amount);
  const formatted = BigInt(bigIntAmount) / BigInt(10) ** BigInt(decimals);
  if (formatted > Number.MAX_SAFE_INTEGER) {
    return formatted.toString();
  } else {
    return Number(formatted).toFixed(precision);
  }
};

export const toMinUnit = (value: bigint | string, decimals: number) => {
  const str = value.toString();
  const decimalPos = str.indexOf(".");

  let fractionDigits = 0;
  let integerPart = str;
  if (decimalPos >= 0) {
    fractionDigits = str.length - 1 - decimalPos;
    integerPart = str.slice(0, decimalPos) + str.slice(decimalPos + 1);
  }
  let big = BigInt(integerPart);

  const totalShift = decimals - fractionDigits;
  if (totalShift > 0) {
    big *= 10n ** BigInt(totalShift);
  } else if (totalShift < 0) {
    const diff = BigInt(-totalShift);
    big = big / 10n ** diff;
  }
  return big;
};
