import { mainnet, sepolia } from "viem/chains";

type ContractAddresses = {
  [key: number]: { readonly [key: string]: `0x${string}` };
};

// TODO
// These settings are just for PND Airdrops
export const CONTRACT_ADDRESSES: ContractAddresses = {
  [mainnet.id]: {
    PND_AIRDROP: "0xFIXME",
  },
  [sepolia.id]: {
    PND_AIRDROP: "0x92A92007e687C036592d5eF490cA7f755FC3abAC",
  },
};
