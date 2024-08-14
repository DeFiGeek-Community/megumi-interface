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
    PND_AIRDROP: "0x7E5EE2CE5Ba508c1E4E78142fB38b5e51d1d7599",
  },
};
