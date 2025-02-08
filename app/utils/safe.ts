// emulates some features of api kit https://github.com/safe-global/safe-core-sdk/tree/main/packages/api-kit
// https://docs.safe.global/safe-core-api/available-services
import { Address, getContract, PublicClient } from "viem";
import {
  arbitrum,
  base,
  baseGoerli,
  gnosis,
  goerli,
  sepolia,
  mainnet,
  optimism,
  polygon,
  baseSepolia,
} from "viem/chains";
import SafeABI from "@/app/lib/constants/abis/Safe.json";

export function delay(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

type TxServiceApiTransactionResponse = {
  safe: Address;
  to: Address;
  data: `0x${string}`;
  blockNumber: number;
  transactionHash: `0x${string}`;
  safeTxHash: `0x${string}`;
  executor: Address;
  isExecuted: boolean;
  isSuccessful: boolean;
  confirmations: Array<{
    owner: Address;
  }>;
};

// Gnosis Safe Proxy
const PROXY_BYTECODE =
  "0x608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea2646970667358221220d1429297349653a4918076d650332de1a1068c5f3e07c5c82360c277770b955264736f6c63430007060033";
// Reference:
// https://www.alchemy.com/smart-contracts/gnosissafeproxy
// Consider comparing this with the resolt of "getBytecode"

//https://docs.safe.global/safe-core-api/available-services
const apiNetworkName = (chainId: number): string => {
  switch (chainId) {
    case gnosis.id:
      return "gnosis-chain";
    case baseGoerli.id:
      return "base-testnet";
    default:
      return (
        {
          [mainnet.id]: "mainnet",
          [optimism.id]: "optimism",
          [polygon.id]: "polygon",
          [base.id]: "base",
          [baseSepolia.id]: "base-sepolia",
          [arbitrum.id]: "arbitrum",
          [goerli.id]: "goerli",
          [sepolia.id]: "sepolia",
        }[chainId] || "mainnet"
      );
  }
};

/**
 * @see https://safe-transaction-mainnet.safe.global/
 * @see https://safe-transaction-goerli.safe.global/api/v1/multisig-transactions/0xc02ba93a6f025e3e78dfceb5c9d4d681aa9aafc780ba6243d3d70ac9fdf48288/
 *
 * @param network network id
 * @param safeTxHash the "internal" safe tx hash
 * @returns 0xstring the executed transaction
 */
export const resolveSafeTx = async (
  networkId: number,
  safeTxHash: `0x${string}`,
  attempt = 1,
  maxAttempts = 20, // About 25 min
): Promise<`0x${string}` | undefined> => {
  const networkName = apiNetworkName(networkId);
  if (attempt >= maxAttempts) {
    throw new Error(`timeout: couldnt find safeTx [${safeTxHash}] on [${networkName}]`);
  }
  const endpoint = `https://safe-transaction-${networkName}.safe.global`;
  const url = `${endpoint}/api/v1/multisig-transactions/${safeTxHash}`;

  const response = <TxServiceApiTransactionResponse>await (await fetch(url)).json();

  // console.debug(`[${attempt}] looking up [${safeTxHash}] on [${networkName}]`, response);
  if (response.isSuccessful === null) {
    await delay(1000 * attempt ** 1.75); //using a polynomial backoff, 2 grows too fast for my taste
    return resolveSafeTx(networkId, safeTxHash, attempt + 1, maxAttempts);
  }

  if (!response.isSuccessful) {
    return undefined;
  }
  return response.transactionHash;
};

export const isContractWallet = async (
  publicClient: PublicClient,
  address: Address,
): Promise<{
  isContract: boolean;
  isSafe: boolean;
}> => {
  let isContract = false;
  let isSafe = false;
  try {
    const bytecode = await publicClient.getCode({ address });
    isContract = !!bytecode && bytecode.length > 0;

    const safeAccount = getContract({
      address,
      abi: SafeABI,
      client: publicClient,
    });

    // Reference:
    // https://github.com/safe-global/safe-smart-account/blob/main/contracts/base/OwnerManager.sol
    const threshold = (await safeAccount.read.getThreshold()) as bigint;
    isSafe = threshold > 0; // && PROXY_BYTECODE === bytecode;
  } catch (error: unknown) {
    console.info(`${address} is not a Safe account`);
  }

  return {
    isContract,
    isSafe,
  };
};
