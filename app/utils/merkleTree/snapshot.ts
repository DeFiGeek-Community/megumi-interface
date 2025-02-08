import { getAddress } from "viem";
import { parseBalanceMap } from "./shared";
import { CHAIN_INFO } from "@/app/lib/constants/chains";

type holdersResponseData = { address: `0x${string}`; balance: string }[];

export const generateMerkleTreeFromSnapshot = async (
  chainId: number,
  snapshotTokenAddress: `0x${string}`,
  untilBlock: number,
  totalAirdropAmount: bigint,
  ignoreAddresses: `0x${string}`[] = [],
  minAmount: bigint = 0n,
  maxEntries: number = 10000,
) => {
  const balanceData: { [key: `0x${string}`]: string } = await extractTokenBalance(
    chainId,
    snapshotTokenAddress,
    untilBlock,
    ignoreAddresses,
    minAmount,
    maxEntries,
  );
  const sum = Object.values(balanceData).reduce((acc, string) => acc + BigInt(string), 0n);

  const allocationData: { [key: string]: string } = { ...balanceData };
  for (const key in allocationData) {
    if (allocationData.hasOwnProperty(key)) {
      const allocation = (BigInt(allocationData[key]) * totalAirdropAmount) / sum;
      allocationData[key] = allocation.toString();
    }
  }
  const accutualAirdropAmount = Object.values(allocationData).reduce(
    (acc, string) => acc + BigInt(string),
    0n,
  );

  const merkleTree = parseBalanceMap(accutualAirdropAmount.toString(), allocationData);
  return merkleTree;
};

const extractTokenBalance = async (
  chainId: number,
  snapshotTokenAddress: `0x${string}`,
  untilBlock: number,
  ignoreAddresses: `0x${string}`[] = [],
  minAmount: bigint = 0n,
  maxEntries: number = 10000,
): Promise<{ [address: `0x${string}`]: string }> => {
  const responseJson = await fetchHolders(chainId, snapshotTokenAddress, untilBlock, maxEntries);
  const _ignoreAddresses = ignoreAddresses.map((addr) => addr.toLowerCase());

  return responseJson.reduce(
    (acc: { [key: `0x${string}`]: string }, data: { address: `0x${string}`; balance: string }) => {
      if (
        !_ignoreAddresses.includes(data.address.toLowerCase()) &&
        BigInt(data.balance) >= minAmount
      ) {
        acc[getAddress(data.address) as `0x${string}`] = data.balance.toString();
      }
      return acc;
    },
    {},
  );
};

async function fetchHolders(
  chainId: number,
  tokenAddress: `0x${string}`,
  snapshotBlockNumber: number,
  maxEntries: number = 10000,
) {
  if (!process.env.BLAST_PROJECT_ID) throw new Error("BLAST_PROJECT_ID is not set");
  const BASE_URL = `${CHAIN_INFO[chainId].blastApiUrl}${process.env.BLAST_PROJECT_ID}/builder/getTokenHolders?`;
  let param = new URLSearchParams({
    contractAddress: tokenAddress,
    blockNumber: `${snapshotBlockNumber}`,
    pageSize: "100",
  });
  let response: holdersResponseData = [];
  let blastRes;
  let count = 0;
  while (true) {
    blastRes = await fetch(BASE_URL + param.toString());
    if (blastRes.ok) {
      blastRes = await blastRes.json();
      blastRes.tokenHolders.map((data: { walletAddress: `0x${string}`; balance: string }) => {
        response.push({ address: data.walletAddress, balance: data.balance });
      });
      count += blastRes.tokenHolders.length;
      if (count >= maxEntries) throw new Error(`Maximum number of entries is ${maxEntries}`);
      if (blastRes.nextPageKey) {
        param.set("pageKey", blastRes.nextPageKey);
      } else {
        break;
      }
    } else {
      console.error(blastRes);
      break;
    }
  }
  return response;
}
