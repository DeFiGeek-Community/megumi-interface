import { Standard, LinearVesting } from "@/app/lib/constants/abis";
import type { AirdropABIType } from "@/app/types/airdrop";

export const TemplateNames = {
  STANDARD: "0x5374616e64617264000000000000000000000000000000000000000000000000",
  LINEAR_VESTING: "0x4c696e65617256657374696e6700000000000000000000000000000000000000",
} as const;

export const AirdropABI: { [key: string]: AirdropABIType } = {
  STANDARD: Standard,
  LINEAR_VESTING: LinearVesting,
};

export const AirdropNameABI: { [key: `0x${string}`]: AirdropABIType } = {
  [TemplateNames.STANDARD]: Standard,
  [TemplateNames.LINEAR_VESTING]: LinearVesting,
};
