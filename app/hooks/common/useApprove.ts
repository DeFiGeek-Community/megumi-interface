import { TxToastsContext } from "@/app/providers/ToastProvider";
import { useContext, useEffect, useState } from "react";
import { erc20Abi, maxInt256 } from "viem";
import { useSimulateContract, useReadContract, useWriteContract } from "wagmi";

export default function useApprove({
  chainId,
  targetAddress,
  owner,
  spender,
  enabled = true,
  amount,
}: {
  chainId: number;
  targetAddress: `0x${string}`;
  owner: `0x${string}` | undefined;
  spender: `0x${string}`;
  enabled?: boolean;
  amount?: bigint;
}) {
  const [allowance, setAllowance] = useState<bigint>(BigInt(0));
  const approveArgs: [`0x${string}`, bigint] = [spender, amount ?? maxInt256];
  const allowanceArgs: [`0x${string}`, `0x${string}`] = [owner || "0x", spender];
  const isReady: boolean = !!targetAddress && !!owner && !!spender && !!chainId && enabled;

  const prepareFn = useSimulateContract({
    chainId,
    address: targetAddress as `0x${string}`,
    account: owner,
    abi: erc20Abi,
    functionName: "approve",
    args: approveArgs,
    query: {
      enabled: isReady,
    },
  });

  const writeFn = useWriteContract();
  const { setWritePromise, waitResult } = useContext(TxToastsContext);

  const write = async () => {
    if (!prepareFn.data) return;
    return setWritePromise(writeFn.writeContractAsync(prepareFn.data.request));
  };

  const { data, isSuccess, refetch } = useReadContract({
    address: targetAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: allowanceArgs,
    query: {
      enabled,
    },
  });
  useEffect(() => {
    isSuccess && setAllowance(data);
  }, [data, isSuccess]);

  return {
    prepareFn,
    writeFn: { ...writeFn, write },
    allowance,
    waitResult,
    refetchAllowance: refetch,
  };
}
