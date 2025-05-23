import {
  concat,
  getContract,
  getContractAddress,
  isAddress,
  keccak256,
  PublicClient,
  zeroAddress,
} from "viem";
import { Prisma, prisma, PrismaClient, type Airdrop, type AirdropClaimerMap } from "@/prisma";
import { hexStringToUint8Array, uint8ObjectToHexString } from "@/app/utils/apiHelper";
import {
  AirdropABIType,
  AirdropFormType,
  AirdropValidationType,
  AirdropHex,
  AirdropWithClaimMap,
  MerkleTreeData,
  AirdropClaimerMapHex,
} from "@/app/types/airdrop";
import { CONTRACT_ADDRESSES } from "@/app/lib/constants/contracts";
import { Factory, MerkleAirdropBase } from "@/app/lib/constants/abis";
import {
  AirdropABI,
  AirdropNameABI,
  TemplateNames,
  TemplateNamesType,
  TemplateType,
} from "@/app/lib/constants/templates";
import { GetObjectCommand, s3Client } from "@/app/lib/aws";
import { isSupportedTemplate } from "@/app/utils/shared";
import { isSupportedChain } from "@/app/utils/chain";
import { InvalidMerkletreeError } from "@/app/types/errors";
import { DefaultArgs } from "@prisma/client/runtime/library";
import BalanceTree from "@/app/lib/merkleTree/balance-tree";

export const getAirdropById = async (
  airdropId: string,
  withClaimParamsOf?: `0x${string}`,
): Promise<Airdrop | null> => {
  const airdrops = await prisma.$queryRaw<Airdrop[]>`
          SELECT DISTINCT
              "Airdrop".*,
              (
                      SELECT
                          COUNT(*) 
                      FROM
                          "AirdropClaimerMap" 
                      WHERE 
                          "AirdropClaimerMap"."airdropId"="Airdrop"."id" 
                          AND 
                          "AirdropClaimerMap"."isClaimed" = true
              ) AS "claimedUsersNum",
              (
                    SELECT
                        COUNT(*)
                    FROM
                        "AirdropClaimerMap"
                    WHERE 
                        "AirdropClaimerMap"."airdropId"="Airdrop"."id"
              ) AS "eligibleUsersNum"
          FROM
              "Airdrop"
          LEFT JOIN "AirdropClaimerMap" ON "Airdrop"."id" = "AirdropClaimerMap"."airdropId"
          LEFT JOIN "Claimer" ON "AirdropClaimerMap"."claimerId" = "Claimer"."id"
          WHERE "Airdrop"."id" = ${airdropId}
          GROUP BY "Airdrop"."id"
          LIMIT 1
      `;
  return airdrops[0];
};

export const airdropClaimerMaptoHexString = (
  airdropClaimerMap: AirdropClaimerMap,
): AirdropClaimerMapHex => {
  return {
    ...airdropClaimerMap,
    proofs: airdropClaimerMap.proofs.map((p: any) => uint8ObjectToHexString(p)!),
    amount: BigInt(uint8ObjectToHexString(airdropClaimerMap.amount)!).toString(),
  };
};
export const toHexString = (airdrop: AirdropWithClaimMap): AirdropHex => {
  let AirdropClaimerMap;

  if ("AirdropClaimerMap" in airdrop) {
    AirdropClaimerMap = airdrop.AirdropClaimerMap?.map((airdropClaimerMap) =>
      airdropClaimerMaptoHexString(airdropClaimerMap),
    );
  }

  return {
    ...airdrop,
    contractAddress: airdrop.contractAddress && uint8ObjectToHexString(airdrop.contractAddress),
    templateName: uint8ObjectToHexString(airdrop.templateName) as TemplateNamesType,
    owner: uint8ObjectToHexString(airdrop.owner)!,
    tokenAddress: uint8ObjectToHexString(airdrop.tokenAddress)!,
    claimedUsersNum: Number(airdrop.claimedUsersNum),
    eligibleUsersNum: Number(airdrop.eligibleUsersNum),
    totalAirdropAmount:
      airdrop.totalAirdropAmount &&
      BigInt(uint8ObjectToHexString(airdrop.totalAirdropAmount)!).toString(),
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

  if (!isAddress(airdrop.tokenAddress)) {
    errors["tokenAddress"] = "Token address is invalid";
  }

  if (airdrop.tokenAddress === zeroAddress) {
    errors["tokenAddress"] = "Token address should not be zero";
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
  // Basically contractAddress is supposed NOT to be set on creation
  if (airdrop.contractAddress && !isAddress(airdrop.contractAddress)) {
    errors["contractAddress"] = "Contract address is invalid";
  }

  // Validates token if passed
  // Basically tokenAddress is supposed NOT to be set on creation
  // It is set when contractAddress is registered
  if (airdrop.tokenAddress && !isAddress(airdrop.tokenAddress)) {
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
    Key: getMerkleTreeKey(chainId, airdropId),
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

export const getTemplateAddressFromAirdropAddress = async (
  address: `0x${string}`,
  provider: PublicClient,
) => {
  const proxyCode = await provider.getCode({
    address,
  });

  // Check if this is a EIP-1167 contract
  if (!proxyCode || !proxyCode.startsWith("0x363d3d373d3d3d363d73")) {
    throw new Error("The given address is not an EIP-1167 Minimal Proxy.");
  }
  return `0x${proxyCode.slice(22, 62)}`.toLowerCase();
};

export const getTemplateNameFromAirdropAddress = async (
  address: `0x${string}`,
  provider: PublicClient,
): Promise<TemplateNamesType | undefined> => {
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

  return templateKey && TemplateNames[TemplateType[templateKey]];
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
      Object.keys(TemplateType).includes(key) &&
      CONTRACT_ADDRESSES[chainId][key].toLowerCase() === implementationAddress,
  ) as keyof typeof TemplateType | undefined;

  return templateKey && AirdropABI[TemplateType[templateKey]];
};

// <--

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

export const validateMerkleTree = (data: any): { error?: InvalidMerkletreeError } => {
  const hashRegex = /^0x[a-fA-F0-9]{64}$/;
  const hexRegex = /^0x[a-fA-F0-9]+$/;
  const maxEntries = 10000;
  const isHashString = (str: string) => hashRegex.test(str);
  const isHexString = (str: string) => hexRegex.test(str);
  let error;

  // Check if root object has the required keys
  if (
    typeof data !== "object" ||
    !("airdropAmount" in data) ||
    !("merkleRoot" in data) ||
    !("claims" in data)
  ) {
    return { error: new InvalidMerkletreeError("Missing required root keys.") };
  }

  // Validate airdropAmount
  if (typeof data.airdropAmount !== "string") {
    return { error: new InvalidMerkletreeError("airdropAmount must be a numeric string.") };
  }
  try {
    BigInt(data.airdropAmount);
  } catch (e) {
    return { error: new InvalidMerkletreeError("airdropAmount must be a numeric string.") };
  }

  // Validate merkleRoot
  if (typeof data.merkleRoot !== "string" || !isHashString(data.merkleRoot)) {
    return { error: new InvalidMerkletreeError("merkleRoot must be a valid hex string.") };
  }

  // Validate claims
  if (typeof data.claims !== "object") {
    return { error: new InvalidMerkletreeError("claims must be an object.") };
  }

  if (Object.entries(data.claims).length === 0) {
    return { error: new InvalidMerkletreeError("Eligible users must not be empty.") };
  }

  if (Object.entries(data.claims).length > maxEntries) {
    // If the claims exceed 10,000 entries, return an error immediately
    return { error: new InvalidMerkletreeError("Eligible users must not exceed 10,000 entries.") };
  }

  for (const [address, claim] of Object.entries(data.claims)) {
    // Check if the address is a valid address
    if (!isAddress(address)) {
      error = new InvalidMerkletreeError(`Claim address '${address}' is not a valid address.`);
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
      error = new InvalidMerkletreeError(
        `Claim for address '${address}' is missing required keys.`,
      );
      break;
    }

    // Validate index
    if (typeof claim.index !== "number" || claim.index < 0) {
      error = new InvalidMerkletreeError(
        `Claim index for address '${address}' must be a non-negative number.`,
      );
      break;
    }

    // Validate amount
    if (typeof claim.amount !== "string" || !isHexString(claim.amount)) {
      error = new InvalidMerkletreeError(
        `Claim amount for address '${address}' must be a valid hex string.`,
      );
      break;
    }

    // Validate proof
    if (
      !Array.isArray(claim.proof) ||
      !claim.proof.every((item) => typeof item === "string" && isHashString(item))
    ) {
      error = new InvalidMerkletreeError(
        `Claim proof for address '${address}' must be an array of valid hex strings.`,
      );
      break;
    }

    const amount = BigInt(claim.amount);
    const proof = claim.proof.map((proof) => Buffer.from(proof.slice(2), "hex"));

    const isValidProof = BalanceTree.verifyProof(
      claim.index,
      address as `0x${string}`,
      amount,
      proof,
      Buffer.from(data.merkleRoot.slice(2), "hex"),
    );

    if (!isValidProof) {
      error = new InvalidMerkletreeError(`Invalid proof for address '${address}'`);
      break;
    }
  }

  if (error) {
    return { error };
  }

  return {};
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
  const updatedAirdrop = await prisma.airdrop.update({
    where: { id: airdropUUID },
    data: { lastSyncedAt: new Date() },
  });
  console.log(`[INFO] Finished merkle tree for airdrop ${airdropUUID}`);
}

export const getMerkleTreeKey = (chainId: number | string, airdropId: string) =>
  `${chainId}/${airdropId}-merkletree.json`;
