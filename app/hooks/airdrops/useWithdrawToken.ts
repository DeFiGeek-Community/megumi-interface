"use client";
import { TxToastsContext } from "@/app/providers/ToastProvider";
import { useCallback, useContext, useState } from "react";
import { useSimulateContract } from "wagmi";
import { Standard } from "@/app/lib/constants/abis";
import { useSafeWriteContract } from "../safe/useSafeWriteContract";
import { useSafeWaitForTransactionReceipt } from "../safe/useSafeWaitForTransactionReceipt";
import { getErrorMessage } from "@/app/utils/shared";

export default function useWithdrawFee({
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
    abi: Standard,
    functionName: "withdrawDepositedToken",
    query: {
      enabled: isReady,
    },
  });

  const writeFn = useSafeWriteContract({
    safeAddress: isSafeTx ? ownerAddress : undefined,
  });
  const { addTxPromise } = useContext(TxToastsContext);
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [withdrawing, setWithdrawing] = useState<boolean>(false);
  const waitFn = useSafeWaitForTransactionReceipt({
    hash,
    isSafe: isSafeTx,
    query: { enabled: !!hash },
  });

  const withdraw = useCallback(
    async (callbacks?: { onSuccess?: () => void; onError?: (e: unknown) => void }) => {
      if (!prepareFn.data || !writeFn.writeContractAsync) return;
      setWithdrawing(true);
      try {
        const { account, ...request } = prepareFn.data.request;
        const promise = writeFn.writeContractAsync(request, callbacks);
        addTxPromise({
          promise,
          isSafe: isSafeTx,
        });
        const hash = await promise;
        setHash(hash);
      } catch (e: unknown) {
        console.log(getErrorMessage(e));
      } finally {
        setWithdrawing(false);
      }
    },
    [prepareFn.data, writeFn.writeContractAsync, isSafeTx, addTxPromise],
  );

  return {
    prepareFn,
    writeFn: { ...writeFn, withdraw, withdrawing },
    waitFn,
  };
}
