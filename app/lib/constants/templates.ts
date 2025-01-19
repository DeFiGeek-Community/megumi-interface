import { Standard, LinearVesting } from "@/app/lib/constants/abis";
import type { AirdropABIType } from "@/app/types/airdrop";

export const TemplateType = {
  STANDARD: "Standard",
  LINEAR_VESTING: "LinearVesting",
} as const;
export type TemplateType = (typeof TemplateType)[keyof typeof TemplateType];

export const TemplateNames = {
  [TemplateType.STANDARD]: "0x5374616e64617264000000000000000000000000000000000000000000000000",
  [TemplateType.LINEAR_VESTING]:
    "0x4c696e65617256657374696e6700000000000000000000000000000000000000",
} as const;
export type TemplateNamesType = (typeof TemplateNames)[keyof typeof TemplateNames];

export const AirdropABI: { [key: string]: AirdropABIType } = {
  [TemplateType.STANDARD]: Standard,
  [TemplateType.LINEAR_VESTING]: LinearVesting,
};

export const AirdropNameABI: { [key: `0x${string}`]: AirdropABIType } = {
  [TemplateNames[TemplateType.STANDARD]]: Standard,
  [TemplateNames[TemplateType.LINEAR_VESTING]]: LinearVesting,
};

export type TemplateArgs = {
  [TemplateType.STANDARD]: [string, string, string, bigint];
  [TemplateType.LINEAR_VESTING]: [string, string, string, number, bigint];
};
export const TemplateArgs: { [key in TemplateType]: string } = {
  // owner_, merkleRoot_, token_, depositAmount_
  [TemplateType.STANDARD]: "address, bytes32, address, uint256",
  // owner_, merkleRoot_, token_, vestingDuration_, depositAmount_
  [TemplateType.LINEAR_VESTING]: "address, bytes32, address, uint256, uint256",
};
