import { TargetEvent } from "@/app/types/snapshots";
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

// Preset for snapshot contract events
export const SNAPSHOT_CONTRACT_EVENT_KEY_MAP: {
  [key: number]: { [key: `0x${string}`]: TargetEvent[] };
} = {
  [mainnet.id]: {
    // pnd CJPY (pCJPY)
    "0xAA59F501c92092E624D30Cff77eAFf5EA4E7BfA2": [
      {
        index: 5,
        abi: {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "dst",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "asset",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "SupplyCollateral",
          type: "event",
        },
        tokenAddressKey: "asset",
        addressKey: "dst",
        amountKey: "amount",
        sub: false,
      },
      {
        index: 9,
        abi: {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "src",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "asset",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "WithdrawCollateral",
          type: "event",
        },
        tokenAddressKey: "asset",
        addressKey: "src",
        amountKey: "amount",
        sub: true,
      },
      {
        index: 0,
        abi: {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "absorber",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "borrower",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "asset",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "collateralAbsorbed",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "usdValue",
              type: "uint256",
            },
          ],
          name: "AbsorbCollateral",
          type: "event",
        },
        tokenAddressKey: "asset",
        addressKey: "borrower",
        amountKey: "collateralAbsorbed",
        sub: true,
      },
    ],
  },
};
