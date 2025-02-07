"use client";
import { TxToastsContext } from "@/app/providers/ToastProvider";
import { useCallback, useContext, useEffect, useState } from "react";
import { erc20Abi, maxInt256 } from "viem";
import { useSimulateContract, useReadContract, useWriteContract } from "wagmi";
import { useSafeWriteContract } from "../safe/useSafeWriteContract";
import { useSafeWaitForTransactionReceipt } from "../safe/useSafeWaitForTransactionReceipt";
import { getErrorMessage } from "@/app/utils/shared";

export default function useApprove({
  chainId,
  targetAddress,
  owner,
  isOwnerSafe,
  spender,
  enabled = true,
  amount,
}: {
  chainId: number;
  targetAddress: `0x${string}`;
  owner: `0x${string}` | undefined;
  isOwnerSafe: boolean;
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
    abi: erc20Abi,
    functionName: "approve",
    args: approveArgs,
    query: {
      enabled: isReady,
    },
  });

  const writeFn = useSafeWriteContract({
    safeAddress: isOwnerSafe ? owner : undefined,
  });
  const { addTxPromise } = useContext(TxToastsContext);
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [approving, setApproving] = useState<boolean>(false);
  const waitFn = useSafeWaitForTransactionReceipt({
    hash,
    isSafe: isOwnerSafe,
    query: { enabled: !!hash },
  });

  const approve = useCallback(
    async (callbacks?: { onSuccess?: () => void; onError?: (e: unknown) => void }) => {
      if (!prepareFn.data || !writeFn.writeContractAsync) return;
      setApproving(true);
      try {
        const { account, ...request } = prepareFn.data.request;
        const promise = writeFn.writeContractAsync(request, callbacks);
        addTxPromise({
          promise,
          isSafe: isOwnerSafe,
        });
        const hash = await promise;
        setHash(hash);
      } catch (e: unknown) {
        console.log(getErrorMessage(e));
      } finally {
        setApproving(false);
      }
    },
    [prepareFn.data, writeFn.writeContractAsync, isOwnerSafe, addTxPromise],
  );

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
    writeFn: { ...writeFn, approve, approving },
    waitFn,
    allowance,
    refetchAllowance: refetch,
  };
}
