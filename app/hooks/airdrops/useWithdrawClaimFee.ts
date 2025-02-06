"use client";
import { TxToastsContext } from "@/app/providers/ToastProvider";
import { useCallback, useContext } from "react";
import { useSimulateContract } from "wagmi";
import { useSafeWriteContract } from "../safe/useSafeWriteContract";

export default function useWithdrawClaimFee({
  chainId,
  contractAddress,
  ownerAddress,
  isSafeTx,
  enabled = true,
}: {
  chainId: number;
  contractAddress: `0x${string}` | null;
  ownerAddress: `0x${string}`;
  isSafeTx: boolean;
  enabled?: boolean;
}) {
  const isReady: boolean = !!chainId && !!contractAddress && enabled;

  const prepareFn = useSimulateContract({
    chainId,
    address: contractAddress || "0x",
    account: ownerAddress,
    abi: [
      {
        inputs: [],
        name: "withdrawClaimFee",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: "withdrawClaimFee",
    query: {
      enabled: isReady,
    },
  });

  const writeFn = useSafeWriteContract({
    safeAddress: isSafeTx ? ownerAddress : undefined,
  });
  const { setWritePromise, waitResult } = useContext(TxToastsContext);

  const write = useCallback(
    (callbacks?: { onSuccess?: () => void }): void => {
      if (!prepareFn.data || !writeFn.writeContractAsync) return;
      const { account, ...request } = prepareFn.data.request;
      return setWritePromise({
        promise: writeFn.writeContractAsync(request, callbacks),
        isSafe: isSafeTx,
      });
    },
    [prepareFn.data, writeFn.writeContractAsync, isSafeTx],
  );

  return {
    prepareFn,
    writeFn: { ...writeFn, write },
    waitResult,
  };
}
