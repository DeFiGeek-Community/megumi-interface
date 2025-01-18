import { concat, getContract, getContractAddress, isAddress, keccak256, PublicClient } from "viem";
import { Prisma, prisma, PrismaClient, type Airdrop, type AirdropClaimerMap } from "@/prisma";
import {
  hexStringToUint8Array,
  uint8ArrayToHexString,
  uint8ObjectToHexString,
} from "@/app/utils/apiHelper";
import {
  AirdropABIType,
  AirdropContractType,
  AirdropFormType,
  AirdropValidationType,
  AirdropWithClaimMap,
  AirdropWithClaimMapHex,
  MerkleTreeData,
  TemplateType,
} from "@/app/types/airdrop";
import { CONTRACT_ADDRESSES } from "@/app/lib/constants/contracts";
import { Factory, MerkleAirdropBase, Standard, LinearVesting } from "@/app/lib/constants/abis";
import { TemplateNames } from "@/app/lib/constants/templates";
import { GetObjectCommand, s3Client } from "@/app/lib/aws";
import { isSupportedTemplate } from "@/app/utils/shared";
import { isSupportedChain } from "@/app/utils/chain";
import { InvalidMerkletreeError } from "@/app/types/errors";
import { DefaultArgs } from "@prisma/client/runtime/library";

export const getAirdropById = async (airdropId: string): Promise<Airdrop | null> => {
  const airdrop = await prisma.airdrop.findUnique({
    where: { id: airdropId },
  });

  return airdrop;
};

export const toHexString = (airdrop: AirdropWithClaimMap): AirdropWithClaimMapHex => {
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
    contractAddress: airdrop.contractAddress && uint8ObjectToHexString(airdrop.contractAddress),
    templateName: uint8ObjectToHexString(airdrop.templateName),
    owner: uint8ObjectToHexString(airdrop.owner),
    tokenAddress: uint8ObjectToHexString(airdrop.tokenAddress),
    AirdropClaimerMap,
  };
};

export const validateParams = async (
  airdrop: AirdropFormType,
  provider: PublicClient,
): Promise<{ isValid: boolean; errors: AirdropValidationType }> => {
  const errors: AirdropValidationType = {};

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

  // Validate Token logo URL
  if (airdrop.tokenLogo) {
    try {
      new URL(airdrop.tokenLogo);
    } catch (e: unknown) {
      errors["tokenLogo"] = e instanceof Error ? e.message : "Invalid URL";
    }
  }

  // Validates owner if contractAddress is set
  // Basically contractAddress is supposed not to be set on creation
  if (airdrop.contractAddress && !isAddress(airdrop.contractAddress)) {
    errors["contractAddress"] = "Contract address is invalid";
  }

  // Validates token
  if (!isAddress(airdrop.tokenAddress)) {
    errors["tokenAddress"] = "Token address is invalid";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const isRegisteredAirdrop = async (
  contractAddress: `0x${string}`,
  provider: PublicClient,
): Promise<boolean> => {
  const chainId = await provider.getChainId();
  const factory = getContract({
    address: CONTRACT_ADDRESSES[chainId].FACTORY,
    abi: Factory,
    client: provider,
  });
  return (await factory.read.airdrops([contractAddress])) as boolean;
};

export const getTokenAddress = async (contractAddress: `0x${string}`, provider: PublicClient) => {
  const abi = await getABIFromAirdropAddress(contractAddress, provider);
  if (!abi) throw new Error("Unknown ABI");

  const airdropContract = getContract({
    address: contractAddress,
    abi: abi,
    client: provider,
  });
  return (await airdropContract.read.token()) as `0x${string}`;
};

export const isOwnerOf = async (
  contractAddress: `0x${string}`,
  user: `0x${string}`,
  provider: PublicClient,
) => {
  const abi = await getABIFromAirdropAddress(contractAddress, provider);
  if (!abi) throw new Error("Unknown ABI");

  const airdropContract = getContract({
    address: contractAddress,
    abi: abi,
    client: provider,
  });
  const owner = (await airdropContract.read.owner()) as string;
  return owner.toLowerCase() === user.toLowerCase();
};

export const checkTemplateName = async (
  templateName: `0x${string}`,
  contractAddress: `0x${string}`,
  provider: PublicClient,
) => {
  const _templateName = await getTemplateNameFromAirdropAddress(contractAddress, provider);
  return templateName.toLowerCase() === _templateName?.toLowerCase();
};

export const validateMerkleRoot = async (
  merkleTree: { [key: string]: any },
  contractAddress: `0x${string}`,
  provider: PublicClient,
) => {
  const merkleRoot = await getMerkleRootFromAirdropAddress(contractAddress, provider);

  // If merkle tree is registered, merkle root should be identical
  return merkleTree.merkleRoot === merkleRoot;
};

export const getMerkleTreeFile = async (chainId: string, airdropId: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${chainId}/${airdropId}-merkletree.json`,
  });

  const response = await s3Client.send(command);
  const str = await response.Body?.transformToString();
  if (!str) throw new Error("No json file");
  return JSON.parse(str);
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
