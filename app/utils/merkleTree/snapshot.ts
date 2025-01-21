import { getAddress } from "viem";
import { parseBalanceMap } from "./shared";

type holdersResponseData = { address: string; balance: string }[];

export const generateMerkleTreeFromSnapshot = async (
  chainId: number,
  snapshotTokenAddress: `0x${string}`,
  untilBlock: number,
  totalAirdropAmount: bigint,
  ignoreAddresses: `0x${string}`[] = [],
  minAmount: bigint = 0n,
) => {
  const balanceData: { [key: `0x${string}`]: string } = await extractTokenBalance(
    chainId,
    snapshotTokenAddress,
    untilBlock,
    ignoreAddresses,
    minAmount,
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
): Promise<{ [address: `0x${string}`]: string }> => {
  const responseJson = await fetchHolders(chainId, snapshotTokenAddress, untilBlock);
  const _ignoreAddresses = ignoreAddresses.map((addr) => addr.toLowerCase());

  return responseJson.items.reduce(
    (acc: { [key: string]: string }, data: { address: `0x${string}`; balance: string }) => {
      if (
        !_ignoreAddresses.includes(data.address.toLowerCase()) &&
        BigInt(data.balance) >= minAmount
      ) {
        acc[getAddress(data.address)] = data.balance.toString();
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
) {
  const BASE_URL = `https://api.covalenthq.com/v1/${chainId}/tokens/`;
  const TOKEN_HOLDERS_URL = "/token_holders/?";
  let param = new URLSearchParams({
    key: process.env.COVALENT_API_KEY as string,
    "block-height": `${snapshotBlockNumber}`,
    "page-size": "1000",
  });
  let response: holdersResponseData = [];
  let covRes;
  let pageNumber = 0;
  while (true) {
    param.set("page-number", pageNumber.toString());
    covRes = await fetch(BASE_URL + tokenAddress + TOKEN_HOLDERS_URL + param.toString());
    if (covRes.ok) {
      covRes = await covRes.json();
      covRes = covRes.data;
      covRes.items.map((data: { address: `0x${string}`; balance: string }) => {
        response.push({ address: data.address, balance: data.balance });
      });
      if (covRes.pagination.has_more) {
        pageNumber += 1;
        // To handle Covalent API rate limit
        if (pageNumber % 4 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      } else {
        break;
      }
    } else {
      console.error(covRes);
      break;
    }
  }
  return covRes;
}
