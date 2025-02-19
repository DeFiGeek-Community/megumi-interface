import { AbiEvent, getAddress, GetLogsReturnType, parseAbiItem } from "viem";
import { parseBalanceMap } from "./shared";
import { CHAIN_INFO } from "@/app/lib/constants/chains";
import { findContractDeploymentBlock, getViemProvider } from "../shared";
import { getAlchemyProvider } from "../apiHelper";
import { ContractEvents, TargetEvent } from "@/app/types/snapshots";

type holdersResponseData = { address: `0x${string}`; balance: string }[];

export const generateMerkleTreeFromSnapshot = async ({
  chainId,
  snapshotTokenAddress,
  untilBlock,
  totalAirdropAmount,
  ignoreAddresses = [],
  minAmount = 0n,
  maxEntries = 10000,
  contractEvents,
}: {
  chainId: number;
  snapshotTokenAddress: `0x${string}`;
  untilBlock: number;
  totalAirdropAmount: bigint;
  ignoreAddresses: `0x${string}`[];
  minAmount?: bigint;
  maxEntries?: number;
  contractEvents?: ContractEvents;
}) => {
  const balanceData: { [key: `0x${string}`]: bigint } = await extractTokenBalance(
    chainId,
    snapshotTokenAddress,
    untilBlock,
    ignoreAddresses,
    maxEntries,
  );

  let aggregatedAmountMap: { [key: `0x${string}`]: bigint } = {};
  if (contractEvents) {
    const client = getViemProvider(chainId, true);
    const startBlockNumber = await findContractDeploymentBlock(
      client,
      contractEvents.contractAddress as `0x${string}`,
      1n,
      BigInt(untilBlock),
    );
    if (startBlockNumber < 0n) throw new Error("Deployed block not found");

    const logs = await getContractEvents(
      chainId,
      contractEvents,
      startBlockNumber,
      BigInt(untilBlock),
    );
    aggregatedAmountMap = await aggregateAmountFromContractEvents(
      logs,
      contractEvents.targetEvents,
      snapshotTokenAddress,
    );
  }

  const uniqueAddresses = Array.from(
    new Set([...Object.keys(aggregatedAmountMap), ...Object.keys(balanceData)]),
  ) as `0x${string}`[];
  const result: { [key: string]: bigint } = {};

  for (const _key of uniqueAddresses) {
    const key = _key as `0x${string}`;
    let sum = 0n;
    if (aggregatedAmountMap.hasOwnProperty(key)) {
      sum += aggregatedAmountMap[key];
    }
    if (balanceData.hasOwnProperty(key)) {
      sum += balanceData[key];
    }
    if (sum < minAmount) continue;
    result[key] = sum;
  }

  const sum = Object.values(result).reduce((acc, amount) => acc + amount, 0n);

  const allocationData: { [key: string]: bigint } = { ...result };
  for (const key in allocationData) {
    if (allocationData.hasOwnProperty(key)) {
      const allocation = (allocationData[key] * totalAirdropAmount) / sum;
      allocationData[key] = allocation;
    }
  }
  const accutualAirdropAmount = Object.values(allocationData).reduce(
    (acc, amount) => acc + amount,
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
  maxEntries: number = 10000,
): Promise<{ [address: `0x${string}`]: bigint }> => {
  /* 
    Since Blast API is not working properly and goldrash API requires paid plan,
    using Alchemy API to fetch transfer event and aggregate them manually for now.
  */
  // const responseJson = await fetchHolders(chainId, snapshotTokenAddress, untilBlock, maxEntries);
  // const responseJson = await fetchHoldersCov(chainId, snapshotTokenAddress, untilBlock, maxEntries);
  const responseJson = await fetchHoldersAlchemy(
    chainId,
    snapshotTokenAddress,
    untilBlock,
    maxEntries,
  );
  const _ignoreAddresses = ignoreAddresses.map((addr) => addr.toLowerCase());

  return responseJson.reduce(
    (acc: { [key: `0x${string}`]: bigint }, data: { address: `0x${string}`; balance: string }) => {
      if (!_ignoreAddresses.includes(data.address.toLowerCase())) {
        acc[getAddress(data.address) as `0x${string}`] = BigInt(data.balance);
      }
      return acc;
    },
    {},
  );
};

// Fetch holders and balances by using Blast API
// Looks like getTokenHolders is buggy and not return correct data as of 2025/02/19
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

// Deprecated
async function fetchHoldersCov(
  chainId: number,
  tokenAddress: `0x${string}`,
  snapshotBlockNumber: number,
  maxEntries: number = 10000,
) {
  if (!process.env.COVALENT_API_KEY) throw new Error("COVALENT_API_KEY is not set");
  const BASE_URL = `https://api.covalenthq.com/v1/${chainId}/tokens/`;
  const TOKEN_HOLDERS_URL = "/token_holders/?";
  let param = new URLSearchParams({
    key: process.env.COVALENT_API_KEY,
    "block-height": `${snapshotBlockNumber}`,
    "page-size": "1000",
  });
  let response: holdersResponseData = [];
  let covRes;
  let pageNumber = 0;
  let count = 0;
  while (true) {
    param.set("page-number", pageNumber.toString());
    covRes = await fetch(BASE_URL + tokenAddress + TOKEN_HOLDERS_URL + param.toString());
    if (covRes.ok) {
      covRes = await covRes.json();
      covRes = covRes.data;
      covRes.items.map((data: { address: `0x${string}`; balance: string }) => {
        response.push({ address: data.address, balance: data.balance });
      });
      count += covRes.items.length;
      if (count >= maxEntries) throw new Error(`Maximum number of entries is ${maxEntries}`);
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
  return response;
}

// Fetch holders and balances by aggregating Transfer events of given token address
// This takes forever in most cases
// Should consider using a different method or upgrading to a paid plan!
async function fetchHoldersAlchemyPaging(
  chainId: number,
  tokenAddress: `0x${string}`,
  snapshotBlockNumber: number,
  maxEntries: number = 10000,
) {
  const blockCapPerRequest = 2000n; // From https://docs.alchemy.com/reference/eth-getlogs
  const client = getViemProvider(chainId, true);
  const startBlockNumber = await findContractDeploymentBlock(
    client,
    tokenAddress,
    1n,
    BigInt(snapshotBlockNumber),
  );
  if (startBlockNumber < 0n) throw new Error("Deployed block not found");

  let blockNumberCursor = startBlockNumber;

  const transferEventSignature =
    "event Transfer(address indexed from, address indexed to, uint256 value)" as const;
  const transferEventAbi = parseAbiItem(transferEventSignature);
  type TransferLogType = GetLogsReturnType<
    typeof transferEventAbi,
    [typeof transferEventAbi],
    false,
    bigint,
    bigint
  >;
  let logs: TransferLogType = [];
  while (true) {
    let toBlock = blockNumberCursor + blockCapPerRequest - 1n;
    if (toBlock > BigInt(snapshotBlockNumber)) {
      toBlock = BigInt(snapshotBlockNumber);
    }
    const localLogs = await client.getLogs({
      address: tokenAddress,
      event: transferEventAbi,
      fromBlock: blockNumberCursor,
      toBlock: toBlock,
    });

    logs = [...logs, ...localLogs];

    blockNumberCursor += blockCapPerRequest;

    if (toBlock === BigInt(snapshotBlockNumber)) break;
  }

  let addressAmountMap: { [key: `0x${string}`]: bigint } = {};

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const logArgs = log.args as any;
    const from = logArgs.from;
    const to = logArgs.to;
    const amount = BigInt(logArgs.value);

    addressAmountMap[from] = from in addressAmountMap ? addressAmountMap[from] - amount : -amount;
    addressAmountMap[to] = to in addressAmountMap ? addressAmountMap[to] + amount : amount;
  }

  if (Object.keys(addressAmountMap).length > maxEntries)
    throw new Error(`Maximum number of entries is ${maxEntries}`);
  const response = Object.entries(addressAmountMap).map(([address, balance]) => ({
    address: address as `0x${string}`,
    balance: balance.toString(),
  })) as holdersResponseData;
  return response;
}

// Fetch holders and balances by aggregating Transfer events of given token address
async function fetchHoldersAlchemy(
  chainId: number,
  tokenAddress: `0x${string}`,
  snapshotBlockNumber: number,
  maxEntries: number = 10000,
) {
  // TODO
  // Condsider alchemy's api limit
  // https://docs.alchemy.com/reference/eth-getlogs
  const client = getViemProvider(chainId, true);
  const startBlockNumber = await findContractDeploymentBlock(
    client,
    tokenAddress,
    1n,
    BigInt(snapshotBlockNumber),
  );
  if (startBlockNumber < 0n) throw new Error("Deployed block not found");

  let logs = await client.getLogs({
    address: tokenAddress,
    event: parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
    fromBlock: startBlockNumber,
    toBlock: BigInt(snapshotBlockNumber),
  });

  let addressAmountMap: { [key: `0x${string}`]: bigint } = {};

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const logArgs = log.args as any;
    const from = logArgs.from;
    const to = logArgs.to;
    const amount = BigInt(logArgs.value);

    addressAmountMap[from] = from in addressAmountMap ? addressAmountMap[from] - amount : -amount;
    addressAmountMap[to] = to in addressAmountMap ? addressAmountMap[to] + amount : amount;
  }

  if (Object.keys(addressAmountMap).length > maxEntries)
    throw new Error(`Maximum number of entries is ${maxEntries}`);
  const response = Object.entries(addressAmountMap).map(([address, balance]) => ({
    address: address as `0x${string}`,
    balance: balance.toString(),
  })) as holdersResponseData;
  return response;
}

const aggregateAmountFromContractEvents = async (
  logs: GetLogsReturnType<undefined, AbiEvent[], undefined, bigint, bigint>,
  targetEvents: TargetEvent[],
  targetTokenAddress: `0x${string}`,
) => {
  let addressAmountMap: { [key: `0x${string}`]: bigint } = {};
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const logArgs = log.args as any;

    for (let j = 0; j < targetEvents.length; j++) {
      const tokenAddress = logArgs[targetEvents[j].tokenAddressKey];
      if (
        log.eventName === targetEvents[j].abi.name &&
        tokenAddress.toLowerCase() === targetTokenAddress.toLowerCase()
      ) {
        const userAddress = logArgs[targetEvents[j].addressKey];

        const amount = targetEvents[j].sub
          ? -logArgs[targetEvents[j].amountKey]
          : logArgs[targetEvents[j].amountKey];
        addressAmountMap[userAddress] =
          userAddress in addressAmountMap ? addressAmountMap[userAddress] + amount : amount;
      }
    }
  }
  return addressAmountMap;
};

const getContractEvents = async (
  chainId: number,
  contractEvents: ContractEvents,
  fromBlock: bigint,
  toBlock: bigint,
) => {
  // TODO
  // Condsider alchemy's api limit
  // https://docs.alchemy.com/reference/eth-getlogs
  // If response exceeds the limit, it returns an error like below
  // {"code":-32602,"message":"Log response size exceeded. You can make eth_getLogs requests with up to a 2K block range and no limit on the response size, or you can request any block range with a cap of 10K logs in the response. Based on your parameters and the response size limit, this block range should work: [0x329d3a, 0x66683f]"}}
  const client = getAlchemyProvider(chainId);
  const logs = await client.getLogs({
    address: contractEvents.contractAddress,
    events: contractEvents.targetEvents.map((e) => e.abi),
    fromBlock,
    toBlock,
  });
  return logs;
};
