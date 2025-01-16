import { mainnet, sepolia } from "viem/chains";

type ContractAddresses = {
  [key: number]: { readonly [key: string]: `0x${string}` };
};

export const CONTRACT_ADDRESSES: ContractAddresses = {
  [mainnet.id]: {
    FACTORY: "0xFIXME",
    STANDARD: "0xFIXME",
    LINEAR_VESTING: "0xFIXME",
    // TODO
    // This settings are just for PND Airdrops
    PND_AIRDROP: "0xFIXME",
  },
  [sepolia.id]: {
    FACTORY: "0xD2D897F22C8B21B154ecBF713550B0f2064Ef638",
    STANDARD: "0xBC99eAcf3C60B52e87421bf422629bD88c25B02a",
    LINEAR_VESTING: "0xd79167b6eE79F0Bf94E30D095C37FA6d647337d2",
    // TODO
    // This settings are just for PND Airdrops
    PND_AIRDROP: "0x92A92007e687C036592d5eF490cA7f755FC3abAC",
  },
};
