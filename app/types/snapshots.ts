import type { AbiEvent } from "viem";

export type TargetEvent = {
  index: number;
  abi: AbiEvent;
  tokenAddressKey: string;
  addressKey: string;
  amountKey: string;
  sub: boolean;
};

export type ContractEvents = {
  contractAddress: string;
  targetEvents: TargetEvent[];
};
