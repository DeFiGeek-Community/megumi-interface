import { erc20Abi, getContract, isAddress, type PublicClient } from "viem";
import type { GetEnsNameReturnType } from "viem/ens";
import { type Chain, localhost, mainnet, sepolia, base, baseSepolia } from "viem/chains";
import type { Airdrop } from "@prisma/client";
import { TemplateType } from "./constants/templates";
import { Session } from "next-auth";
import { AirdropContractType, AirdropFormType, AirdropValidationType } from "../interfaces/airdrop";
import { isSupportedChain } from "./chain";
import MerkleAirdropBase from "@/app/lib/constants/abis/MerkleAirdropBase.json";
import Factory from "@/app/lib/constants/abis/Factory.json";
import { CONTRACT_ADDRESSES } from "./constants/contracts";

const chains = { mainnet, sepolia, base, baseSepolia };

// For frontend -->
export const getEtherscanLink = (
  chain: Chain | undefined,
  hash: string,
  type: "tx" | "token" | "address" | "block",
): string => {
  if (typeof chain === "undefined" || typeof chain.blockExplorers === "undefined") return "";

  return `${chain.blockExplorers.default.url}/${type}/${hash}`;
};

export const getEllipsizedAddress = ({
  address,
  ensName,
}: {
  address?: `0x${string}`;
  ensName?: GetEnsNameReturnType;
}): string => {
  return ensName ? `${ensName}` : `${address?.slice(0, 5)}...${address?.slice(-4)}`;
};
// <--

// For frontend and backend-->
export const uint8ObjectToHexString = (
  object: { [key: string]: number } | Uint8Array,
): `0x${string}` => {
  const values = Object.values(object);
  return uint8ArrayToHexString(new Uint8Array(values));
};

export const uint8ArrayToHexString = (uint8Array: Uint8Array): `0x${string}` => {
  return ("0x" +
    Array.from(uint8Array)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")) as `0x${string}`;
};

export const hexStringToUint8Array = (hexString: `0x${string}`): Uint8Array => {
  return Uint8Array.from(Buffer.from(hexString.slice(2), "hex"));
};

export const isSupportedTemplate = (templateName: string) => {
  return Object.values(TemplateType)
    .map((v) => v as string)
    .includes(templateName);
};
// <--

// For backend ->
// Airdrop utility
export const convertAirdropWithUint8ArrayToHexString = (airdrop: Airdrop) => {
  return {
    ...airdrop,
    contractAddress: airdrop.contractAddress
      ? uint8ObjectToHexString(airdrop.contractAddress)
      : null,
    templateName: uint8ObjectToHexString(airdrop.templateName),
    owner: uint8ObjectToHexString(airdrop.owner),
    tokenAddress: uint8ObjectToHexString(airdrop.tokenAddress),
  };
};

export const validateAirdropData = async (
  session: Session,
  airdrop: AirdropFormType,
  provider: PublicClient,
): Promise<{ isValid: boolean; errors: AirdropValidationType }> => {
  const errors: AirdropValidationType = {};
  // Validates templateName
  if (!isSupportedTemplate(airdrop.templateName)) {
    errors["templateName"] = "Invalid templateName";
  }

  if (!isSupportedChain(airdrop.chainId)) {
    errors["chainId"] = "Unsupported chain";
  }

  if (!airdrop.title) {
    errors["title"] = "Title is required";
  }

  if (airdrop.title.length > 200) {
    errors["title"] = "Max length is 200";
  }

  // Validates owner if contractAddress is set
  // Basically contractAddress is supposed not to be set on creation
  if (airdrop.contractAddress) {
    try {
      const airdropContract = getContract({
        address: airdrop.contractAddress,
        abi: MerkleAirdropBase,
        client: provider,
      });
      const contractOwner = await airdropContract.read.owner();
      if (
        contractOwner !== session.user.address
        // TODO Take Safe into account
        // ↓ From Yamawake
        // (!session.user.siwe.resources && contractOwner === session.siwe.address) ||
        // (session.siwe.resources && contractOwner === session.siwe.resources[0])
      ) {
        errors["contractAddress"] = "You are not the owner of this contract";
      }
    } catch (error: unknown) {
      errors["contractAddress"] =
        error instanceof Error ? `${error.name} ${error.message}` : `${error}`;
      console.log(`[ERROR] ${errors["contractAddress"]}`);
    }
  }
  // Validates token
  if (!airdrop.tokenAddress) {
    errors["tokenAddress"] = "Token address is required";
  }

  // Validate Token logo URL
  if (airdrop.tokenLogo) {
    try {
      new URL(airdrop.tokenLogo);
    } catch (e: unknown) {
      errors["tokenLogo"] = e instanceof Error ? e.message : "Invalid URL";
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateAirdropContract = async (
  contractAddress: `0x${string}`,
  provider: PublicClient,
): Promise<{ isRegistered: boolean; airdropContract: AirdropContractType | undefined }> => {
  if (!isAddress(contractAddress)) {
    return {
      isRegistered: false,
      airdropContract: undefined,
    };
  }
  const chainId = await provider.getChainId();
  const factory = getContract({
    address: CONTRACT_ADDRESSES[chainId].FACTORY,
    abi: Factory,
    client: provider,
  });
  const isRegisteredAirdrop = (await factory.read.airdrops([contractAddress])) as boolean;
  const airdropContract = getContract({
    address: contractAddress,
    abi: MerkleAirdropBase,
    client: provider,
  });
  return {
    isRegistered: isRegisteredAirdrop,
    airdropContract,
  };
};

// Token information
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

export const getTemplateNameFromAirdropAddress = async (
  address: `0x${string}`,
  provider: PublicClient,
): Promise<TemplateType | undefined> => {
  const proxyCode = await provider.getCode({
    address,
  });

  // Check if this is a EIP-1167 contract
  if (!proxyCode || !proxyCode.startsWith("0x363d3d373d3d3d363d73")) {
    throw new Error("The given address is not an EIP-1167 Minimal Proxy.");
  }
  const implementationAddress = `0x${proxyCode.slice(22, 62)}`.toLowerCase();
  const chainId = await provider.getChainId();

  const templateKey = Object.keys(CONTRACT_ADDRESSES[chainId]).find(
    (key) =>
      Object.keys(TemplateType).includes(key) &&
      CONTRACT_ADDRESSES[chainId][key].toLowerCase() === implementationAddress,
  ) as keyof typeof TemplateType | undefined;

  return templateKey && TemplateType[templateKey];
};
// <--
