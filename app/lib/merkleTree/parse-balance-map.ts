import { toHex, isAddress, getAddress } from "viem";
import BalanceTree from "./balance-tree";

// This is the blob that gets distributed and pinned to IPFS.
// It is completely sufficient for recreating the entire merkle tree.
// Anyone can verify that all air drops are included in the tree,
// and the tree has no additional distributions.
interface MerkleDistributorInfo {
  airdropAmount: string;
  merkleRoot: string;
  claims: {
    [account: string]: {
      index: number;
      amount: string;
      proof: string[];
    };
  };
}

type Format = { [account: string]: number | string };
type Format2 = { address: string; amount: bigint | string };

export function parseBalanceMap(
  airdropAmount: string,
  balances: Format | Format2[],
): MerkleDistributorInfo {
  const FormatToFormat2: Format2[] = Array.isArray(balances)
    ? balances
    : Object.keys(balances).map(
        (account): Format2 => ({
          address: account,
          amount: balances[account].toString(),
        }),
      );

  const dataByAddress = FormatToFormat2.reduce<{
    [address: `0x${string}`]: {
      amount: bigint;
    };
  }>((memo, { address: account, amount }) => {
    if (!isAddress(account)) {
      throw new Error(`Found invalid address: ${account}`);
    }
    const parsed = getAddress(account);
    if (memo[parsed]) throw new Error(`Duplicate address: ${parsed}`);
    const parsedNum = BigInt(amount);
    if (parsedNum < 0) return memo;

    memo[parsed] = { amount: parsedNum, ...{} };
    return memo;
  }, {});

  const sortedAddresses = Object.keys(dataByAddress).sort();

  // construct a tree
  const tree = new BalanceTree(
    sortedAddresses.map((address) => ({
      account: address as `0x${string}`,
      amount: dataByAddress[address as `0x${string}`].amount,
    })),
  );

  // generate claims
  const claims = sortedAddresses.reduce<{
    [address: `0x${string}`]: {
      amount: string;
      index: number;
      proof: `0x${string}`[];
    };
  }>((memo, address, index) => {
    const { amount } = dataByAddress[address as `0x${string}`];
    memo[address as `0x${string}`] = {
      index,
      amount: toHex(amount),
      proof: tree.getProof(index, address as `0x${string}`, amount),
      ...{},
    };
    return memo;
  }, {});

  return {
    airdropAmount: airdropAmount,
    merkleRoot: tree.getHexRoot(),
    claims,
  };
}
