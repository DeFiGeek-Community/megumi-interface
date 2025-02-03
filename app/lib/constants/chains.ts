import type { Chain } from "viem/chains";
import { mainnet, sepolia, base, baseSepolia } from "viem/chains";

export type ChainInfo = Readonly<Chain> & {
  readonly chainSelector: bigint;
  readonly alchemyRpcUrl: string;
  readonly infuraRpcUrl: string;
  readonly blastApiUrl: string;
};

export const CHAIN_INFO: { [id: number]: ChainInfo } = {
  [mainnet.id]: {
    ...mainnet,
    chainSelector: 5009297550715157269n,
    alchemyRpcUrl: "https://eth-mainnet.g.alchemy.com/v2/",
    infuraRpcUrl: "https://mainnet.infura.io/v3/",
    blastApiUrl: "https://eth-mainnet.blastapi.io/",
  },
  [base.id]: {
    ...base,
    chainSelector: 15971525489660198786n,
    sourceId: 1,
    alchemyRpcUrl: "https://base-mainnet.g.alchemy.com/v2/",
    infuraRpcUrl: "https://base-mainnet.infura.io/v3/",
    blastApiUrl: "https://base-mainnet.blastapi.io/",
  },
  [sepolia.id]: {
    ...sepolia,
    chainSelector: 16015286601757825753n,
    alchemyRpcUrl: "https://eth-sepolia.g.alchemy.com/v2/",
    infuraRpcUrl: "https://sepolia.infura.io/v3/",
    blastApiUrl: "https://eth-sepolia.blastapi.io/",
  },
  [baseSepolia.id]: {
    ...baseSepolia,
    chainSelector: 10344971235874465080n,
    alchemyRpcUrl: "https://base-sepolia.g.alchemy.com/v2/",
    infuraRpcUrl: "https://base-sepolia.infura.io/v3/",
    blastApiUrl: "https://base-sepolia.blastapi.io/",
  },
};

export const SUPPORTED_CHAIN: number[] =
  process.env.NEXT_PUBLIC_ENV === "mainnet" ? [mainnet.id, base.id] : [sepolia.id, baseSepolia.id];
