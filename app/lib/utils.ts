import { Session } from "next-auth";
import {
  concat,
  erc20Abi,
  getContract,
  getContractAddress,
  isAddress,
  keccak256,
  type PublicClient,
} from "viem";
import type { GetEnsNameReturnType } from "viem/ens";
import { type Chain, localhost, mainnet, sepolia, base, baseSepolia } from "viem/chains";
import type { Airdrop, AirdropClaimerMap, Prisma, PrismaClient } from "@/prisma";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { TemplateNames } from "@/app/lib/constants/templates";
import type {
  AirdropABIType,
  AirdropContractType,
  AirdropFormType,
  AirdropValidationType,
  TemplateType,
} from "@/app/types/airdrop";
import { isSupportedChain } from "@/app/utils/chain";
import { CONTRACT_ADDRESSES } from "@/app/lib/constants/contracts";
import { Factory, MerkleAirdropBase, Standard, LinearVesting } from "@/app/lib/constants/abis";
import { s3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@/app/lib/aws";
import { InvalidMerkletreeError } from "@/app/types/errors";

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
  return Object.values(TemplateNames)
    .map((v) => v as string)
    .includes(templateName);
};

export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? (error.message ? error.message : error.name) : `${error}`;
};
// <--

// For backend ->
// Airdrop utility
export const convertAirdropWithUint8ArrayToHexString = (
  airdrop: Airdrop & { AirdropClaimerMap?: AirdropClaimerMap[] },
) => {
  let AirdropClaimerMap;

  if ("AirdropClaimerMap" in airdrop) {
    AirdropClaimerMap = airdrop.AirdropClaimerMap?.map((airdropClaimerMap) => ({
      ...airdropClaimerMap,
      proofs: airdropClaimerMap.proofs.map((p: any) => uint8ObjectToHexString(p)),
      amount: BigInt(uint8ObjectToHexString(airdropClaimerMap.amount)),
    }));
  }

  return {
    ...airdrop,
    contractAddress: airdrop.contractAddress
      ? uint8ObjectToHexString(airdrop.contractAddress)
      : null,
    templateName: uint8ObjectToHexString(airdrop.templateName),
    owner: uint8ObjectToHexString(airdrop.owner),
    tokenAddress: uint8ObjectToHexString(airdrop.tokenAddress),
    AirdropClaimerMap,
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
  const abi = await getABIFromAirdropAddress(contractAddress, provider);
  if (!abi) throw new Error("Unknown ABI");
  const airdropContract = getContract({
    address: contractAddress,
    abi: abi,
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

export const getMerkleRootFromAirdropAddress = async (
  address: `0x${string}`,
  provider: PublicClient,
): Promise<`0x${string}`> => {
  const airdrop = getContract({
    address,
    abi: MerkleAirdropBase,
    client: provider,
  });
  const merkleRoot = (await airdrop.read.merkleRoot()) as `0x${string}`;

  return merkleRoot;
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
      Object.keys(TemplateNames).includes(key) &&
      CONTRACT_ADDRESSES[chainId][key].toLowerCase() === implementationAddress,
  ) as keyof typeof TemplateNames | undefined;

  return templateKey && TemplateNames[templateKey];
};

export const getABIFromAirdropAddress = async (
  address: `0x${string}`,
  provider: PublicClient,
): Promise<AirdropABIType | undefined> => {
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
      Object.keys(TemplateNames).includes(key) &&
      CONTRACT_ADDRESSES[chainId][key].toLowerCase() === implementationAddress,
  ) as keyof typeof TemplateNames | undefined;
  return templateKey && AirdropABI[templateKey];
};

const AirdropABI: { [key: string]: AirdropABIType } = {
  STANDARD: Standard,
  LINEAR_VESTING: LinearVesting,
};
// <--

export type MerkleTreeClaim = {
  index: number;
  amount: `0x${string}`; // Hex string
  proof: `0x${string}`[]; // Array of hex strings
};

export type MerkleTreeData = {
  airdropAmount: string; // Numeric string
  merkleRoot: `0x${string}`; // Hex string
  claims: {
    [address: `0x${string}`]: MerkleTreeClaim;
  };
};

export const validateMerkleTree = (
  data: any,
): { valid: boolean; error?: InvalidMerkletreeError } => {
  const hashRegex = /^0x[a-fA-F0-9]{64}$/;
  const hexRegex = /^0x[a-fA-F0-9]+$/;
  const isHashString = (str: string) => hashRegex.test(str);
  const isHexString = (str: string) => hexRegex.test(str);
  let valid = false;
  let errors = [];

  // Check if root object has the required keys
  if (
    typeof data !== "object" ||
    !("airdropAmount" in data) ||
    !("merkleRoot" in data) ||
    !("claims" in data)
  ) {
    errors.push("Missing required root keys.");
  }

  // Validate airdropAmount
  if (typeof data.airdropAmount !== "string") {
    errors.push("airdropAmount must be a numeric string.");
  }
  try {
    BigInt(data.airdropAmount);
  } catch (e) {
    errors.push("airdropAmount must be a numeric string.");
  }

  // Validate merkleRoot
  if (typeof data.merkleRoot !== "string" || !isHashString(data.merkleRoot)) {
    errors.push("merkleRoot must be a valid hex string.");
  }

  // Validate claims
  if (typeof data.claims !== "object") {
    errors.push("claims must be an object.");
  }

  for (const [address, claim] of Object.entries(data.claims)) {
    // Check if the address is a valid address
    if (!isAddress(address)) {
      errors.push(`Claim address '${address}' is not a valid address.`);
      break;
    }

    // Validate the claim object
    if (
      !claim ||
      typeof claim !== "object" ||
      !("index" in claim) ||
      !("amount" in claim) ||
      !("proof" in claim)
    ) {
      errors.push(`Claim for address '${address}' is missing required keys.`);
      break;
    }

    // Validate index
    if (typeof claim.index !== "number" || claim.index < 0) {
      errors.push(`Claim index for address '${address}' must be a non-negative number.`);
      break;
    }

    // Validate amount
    if (typeof claim.amount !== "string" || !isHexString(claim.amount)) {
      errors.push(`Claim amount for address '${address}' must be a valid hex string.`);
      break;
    }

    // Validate proof
    if (
      !Array.isArray(claim.proof) ||
      !claim.proof.every((item) => typeof item === "string" && isHashString(item))
    ) {
      errors.push(`Claim proof for address '${address}' must be an array of valid hex strings.`);
      break;
    }
  }

  if (errors.length > 0) {
    return { valid, error: new InvalidMerkletreeError(errors.join(" ")) };
  }

  return { valid: true };
};

export async function processMerkleTree(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  merkleTreeData: MerkleTreeData,
  airdropUUID: string,
) {
  console.log(`[INFO] Processing merkle tree for airdrop ${airdropUUID}`);

  for (const [address, claim] of Object.entries(merkleTreeData.claims)) {
    // console.log(`[INFO] Processing claim for address ${address}`);
    // Check if Claimer exists on the table
    let claimer = await prisma.claimer.findUnique({
      where: { address: hexStringToUint8Array(address as `0x${string}`) },
    });

    // If not, insert
    if (!claimer) {
      claimer = await prisma.claimer.create({
        data: { address: hexStringToUint8Array(address as `0x${string}`) },
      });
    }

    // Create AirdropClaimerMap
    await prisma.airdropClaimerMap.upsert({
      where: {
        airdropClaimerId: {
          claimerId: claimer.id,
          airdropId: airdropUUID,
        },
      },
      update: {},
      create: {
        claimerId: claimer.id,
        airdropId: airdropUUID,
        isClaimed: false,
        index: claim.index,
        proofs: claim.proof.map((p) => hexStringToUint8Array(p)),
        amount: hexStringToUint8Array(claim.amount),
      },
    });
  }
}

// TODO Test
export function getAirdropAddressFromUUID({
  templateAddress,
  uuid,
  deployer,
  chainId,
}: {
  templateAddress: `0x${string}`;
  uuid: `0x${string}`;
  deployer: `0x${string}`;
  chainId: number;
}) {
  // Fixed bytecode for ERC1167
  const MINIMAL_PROXY_PREFIX = "0x3d602d80600a3d3981f3363d3d373d3d3d363d73";
  const MINIMAL_PROXY_SUFFIX = "0x5af43d82803e903d91602b57fd5bf3";

  // Calculate salt through the same logic as a contract
  const salt = keccak256(concat([templateAddress, uuid, deployer]));

  // Build ERC1167 minimal proxy bytecode
  const bytecode = concat([MINIMAL_PROXY_PREFIX, templateAddress, MINIMAL_PROXY_SUFFIX]);

  // Calculate CREATE2 address
  return getContractAddress({
    bytecode,
    from: CONTRACT_ADDRESSES[chainId].FACTORY,
    salt,
    opcode: "CREATE2",
  });
}

// For tests only
export async function deleteAllObjects(bucketName: string) {
  try {
    // Get all objects
    const listCommand = new ListObjectsV2Command({ Bucket: bucketName });
    const listResponse = await s3Client.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return;
    }

    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects: listResponse.Contents.map((obj) => ({ Key: obj.Key })),
      },
    };

    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    const deleteResponse = await s3Client.send(deleteCommand);
  } catch (err) {
    console.error(err);
  }
}
