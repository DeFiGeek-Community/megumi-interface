import { mainnet, sepolia } from "viem/chains";

type ContractAddresses = {
  [key: number]: { readonly [key: string]: `0x${string}` };
};
type FactoryDeployedBlockNumber = {
  [key: number]: bigint;
};

export const CONTRACT_ADDRESSES: ContractAddresses = {
  [mainnet.id]: {
    FACTORY: "0xe48aCBC3Cf4b833B4dF248296ba0AC8af20fA44a",
    STANDARD: "0x3Df8b693bb67093838c13E841Fe3424B4f7eD3Ef",
    LINEAR_VESTING: "0x188A9A506686D1b8DD475d7bF6Fdba9Ea26fcdBE",
  },
  [sepolia.id]: {
    FACTORY: "0xD2D897F22C8B21B154ecBF713550B0f2064Ef638",
    STANDARD: "0xBC99eAcf3C60B52e87421bf422629bD88c25B02a",
    LINEAR_VESTING: "0xd79167b6eE79F0Bf94E30D095C37FA6d647337d2",
  },
};

export const FACTORY_DEPLOYED_BLOCK_NUMBER: FactoryDeployedBlockNumber = {
  [mainnet.id]: 21738286n,
  [sepolia.id]: 6572893n,
};
