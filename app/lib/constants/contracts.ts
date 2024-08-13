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
    PND_AIRDROP: "0x398D8d44F3f3A5FfdCE7e053277b85D64B0dcd0A",
  },
};
