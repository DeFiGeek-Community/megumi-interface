// Forked from wagmi writeContract.ts
// https://github.com/wevm/wagmi/blob/42e65ea4fea99c639817088bba915e0933d17141/packages/core/src/actions/writeContract.ts
import {
  encodeFunctionData,
  getAddress,
  type Abi,
  type Client,
  type ContractFunctionArgs,
  type ContractFunctionName,
} from "viem";
import type { Config } from "wagmi";
import type { WriteContractData, WriteContractVariables } from "wagmi/query";
import {
  getConnectorClient,
  type WriteContractParameters,
  type WriteContractReturnType,
  type WriteContractErrorType,
} from "wagmi/actions";
import Safe, { Eip1193Provider, SafeTransactionOptionalProps } from "@safe-global/protocol-kit";
import SafeApiKit from "@safe-global/api-kit";
import { MutationOptions } from "@tanstack/react-query";

export function safeWriteContractMutationOptions<config extends Config>(
  config: config & { safeAddress: `0x${string}` },
) {
  return {
    mutationFn(variables) {
      return safeWriteContract(config, variables);
    },
    mutationKey: ["safeWriteContract"],
  } as const satisfies MutationOptions<
    WriteContractData,
    WriteContractErrorType,
    WriteContractVariables<Abi, string, readonly unknown[], config, config["chains"][number]["id"]>
  >;
}

/** https://wagmi.sh/core/api/actions/writeContract */
export async function safeWriteContract<
  config extends Config,
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, "nonpayable" | "payable">,
  args extends ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>,
  chainId extends config["chains"][number]["id"],
>(
  config: config & { safeAddress: `0x${string}` },
  parameters: WriteContractParameters<abi, functionName, args, config, chainId> & {
    value?: bigint;
    gasPrice?: bigint;
    nonce?: number;
  },
): Promise<WriteContractReturnType> {
  const { account, chainId, connector, ...request } = parameters;

  let client: Client;
  if (typeof account === "object" && account?.type === "local")
    client = config.getClient({ chainId });
  else
    client = await getConnectorClient(config, {
      account: account ?? undefined,
      chainId,
      connector,
    });

  const signer = client.account?.address;
  if (!signer) throw new Error("signer is not set");
  if (!chainId) throw new Error("ChainId is not set");

  let protocolKit = await Safe.init({
    provider: client as Eip1193Provider,
    signer,
    safeAddress: config.safeAddress,
  });
  const data = encodeFunctionData({
    abi: request.abi as Abi,
    functionName: request.functionName.toString(),
    args: request.args
      ? Array.isArray(request.args)
        ? [...request.args]
        : Object.values(request.args)
      : [],
  });
  const transactions = [
    {
      to: getAddress(request.address) as string,
      data: data,
      value: request.value?.toString() ?? "0",
      // operation, // Optional
    },
  ];
  const options: SafeTransactionOptionalProps = {
    // safeTxGas, // Optional
    // baseGas // Optional
    gasPrice: request.gasPrice ? request.gasPrice.toString() : undefined, // Optional
    // gasToken, // Optional
    // refundReceiver, // Optional
    nonce: request.nonce, // Optional
  };

  const safeTransaction = await protocolKit.createTransaction({ transactions, options });
  const safeTxHash = await protocolKit.getTransactionHash(safeTransaction);
  const signature = await protocolKit.signHash(safeTxHash);
  // Propose transaction to the service
  const apiKit = new SafeApiKit({
    chainId: BigInt(chainId),
  });
  await apiKit.proposeTransaction({
    safeAddress: config.safeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress: signer,
    senderSignature: signature.data,
  });

  return safeTxHash as `0x${string}`;
}
