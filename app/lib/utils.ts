import { erc20Abi, getContract, type PublicClient } from "viem";
import { s3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@/app/lib/aws";

// const chains = { mainnet, sepolia, base, baseSepolia };

// For backend ->
// Airdrop utility

// export const validateAirdropContract = async (
//   contractAddress: `0x${string}`,
//   user: `0x${string}`,
//   provider: PublicClient,
// ): Promise<{
//   isRegistered: boolean;
//   isOwner: boolean;
//   airdropContract: AirdropContractType | undefined;
// }> => {
//   if (!isAddress(contractAddress)) {
//     return {
//       isRegistered: false,
//       isOwner: false,
//       airdropContract: undefined,
//     };
//   }
//   const chainId = await provider.getChainId();
//   const factory = getContract({
//     address: CONTRACT_ADDRESSES[chainId].FACTORY,
//     abi: Factory,
//     client: provider,
//   });
//   const isRegisteredAirdrop = (await factory.read.airdrops([contractAddress])) as boolean;
//   const abi = await AirdropUtils.getABIFromAirdropAddress(contractAddress, provider);
//   if (!abi) throw new Error("Unknown ABI");
//   const airdropContract = getContract({
//     address: contractAddress,
//     abi: abi,
//     client: provider,
//   });
//   const owner = (await airdropContract.read.owner()) as string;

//   return {
//     isRegistered: isRegisteredAirdrop,
//     isOwner: owner.toLowerCase() === user.toLowerCase(),
//     airdropContract,
//   };
// };

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

// TODO For tests only
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
