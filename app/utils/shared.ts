import { createPublicClient, fallback, http, erc20Abi, getContract, type PublicClient } from "viem";
import { getChainById, isSupportedChain } from "@/app/utils/chain";
import { CHAIN_INFO } from "@/app/lib/constants/chains";
import { TemplateNames, TemplateType } from "@/app/lib/constants/templates";

export const getViemProvider = (
  chainId: number,
  allowUnsupportedChain: boolean = false,
  clientSide: boolean = false,
): PublicClient => {
  const chain = getChainById(chainId);
  if (!chain) throw new Error("Wrong network");
  if (!isSupportedChain(chain.id) && !allowUnsupportedChain) throw new Error("Unsupported network");

  const infraKey = clientSide ? process.env.NEXT_PUBLIC_INFURA_API_KEY : process.env.INFURA_API_KEY;
  const alchemyKey = clientSide
    ? process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
    : process.env.ALCHEMY_API_KEY;
  const publicEndpoints = chain.rpcUrls.default.http.map((url) => http(url));
  const thirdPartyEndpoints = [];

  if (CHAIN_INFO[chain.id]?.infuraRpcUrl && infraKey) {
    thirdPartyEndpoints.push(http(`${CHAIN_INFO[chain.id].infuraRpcUrl}${infraKey}`));
  }
  if (CHAIN_INFO[chain.id]?.alchemyRpcUrl && alchemyKey) {
    thirdPartyEndpoints.push(http(`${CHAIN_INFO[chain.id].alchemyRpcUrl}${alchemyKey}`));
  }

  const client = createPublicClient({
    chain,
    transport: fallback([...thirdPartyEndpoints, ...publicEndpoints]),
  });
  return client;
};

export const getTokenInfo = async (
  tokenAddress: `0x${string}`,
  provider: PublicClient,
): Promise<{ tokenName: string; tokenSymbol: string; tokenDecimals: number }> => {
  const token = getContract({
    address: tokenAddress,
    abi: erc20Abi,
    client: provider,
  });
  const tokenName = await token.read.name();
  const tokenSymbol = await token.read.symbol();
  const tokenDecimals = await token.read.decimals();

  return { tokenName, tokenSymbol, tokenDecimals };
};

export const isSupportedTemplate = (templateName: string) => {
  return Object.values(TemplateNames)
    .map((v) => v as string)
    .includes(templateName);
};

export function getTemplateTypeByHex(hex: string): TemplateType {
  for (const [key, val] of Object.entries(TemplateNames)) {
    if (val === hex) {
      return key as TemplateType;
    }
  }
  throw new Error(`Template type not found for ${hex}`);
}

export function getTemplateKeyByHex(hex: string): keyof typeof TemplateType {
  let nameKey;
  for (const [key, value] of Object.entries(TemplateNames)) {
    if (value === hex) {
      nameKey = key as TemplateType;
      break;
    }
  }
  if (!nameKey) {
    throw new Error(`Template type not found for ${hex}`);
  }
  for (const [key, value] of Object.entries(TemplateType)) {
    if (value === nameKey) {
      return key as keyof typeof TemplateType;
    }
  }
  throw new Error(`Template type not found for ${hex}`);
}

export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? (error.message ? error.message : error.name) : `${error}`;
};

export const objectToKeyValueString = (obj: { [key: string]: any }) => {
  return Object.entries(obj)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
};

export const uuidToHex = (uuid: string): `0x${string}` => {
  return `0x${uuid.replace(/-/g, "").padEnd(64, "0")}`;
};

export const safeParseBigInt = (input: string): bigint => {
  const numericString = input.replace(/[^0-9]/g, "");
  if (numericString === "") return BigInt(0);

  try {
    return BigInt(numericString);
  } catch (error) {
    console.warn(`Could not convert ${input} to BigInt`);
    return BigInt(0);
  }
};

export async function findContractDeploymentBlock(
  client: PublicClient,
  address: `0x${string}`,
  startBlock: bigint,
  endBlock: bigint,
): Promise<bigint> {
  let low = startBlock;
  let high = endBlock;
  let deploymentBlock = -1n;

  while (low <= high) {
    const mid = (low + high) >> 1n;

    const code = await client.getCode({
      address,
      blockNumber: mid,
    });

    if (code && code !== "0x") {
      deploymentBlock = mid;
      high = mid - 1n;
    } else {
      low = mid + 1n;
    }
  }

  return deploymentBlock;
}
