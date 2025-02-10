"use client";
import { useCallback, useContext, useState } from "react";
import { parseEther } from "viem";
import { useSimulateContract } from "wagmi";
import { TxToastsContext } from "@/app/providers/ToastProvider";
import { AirdropNameABI, TemplateNamesType } from "@/app/lib/constants/templates";
import { getErrorMessage } from "@/app/utils/shared";
import { useSafeWriteContract } from "../safe/useSafeWriteContract";
import { useSafeWaitForTransactionReceipt } from "../safe/useSafeWaitForTransactionReceipt";

export default function useClaim({
  chainId,
  contractAddress,
  claimerAddress,
  templateName,
  claimParams,
  isSafeTx,
  enabled = true,
}: {
  chainId: number;
  contractAddress: `0x${string}`;
  claimerAddress: `0x${string}`;
  templateName: TemplateNamesType;
  claimParams: any[];
  isSafeTx: boolean;
  enabled?: boolean;
}) {
  const claimFee = parseEther("0.0002"); // Fixed fee
  const prepareFn = useSimulateContract({
    chainId,
    address: contractAddress,
    abi: AirdropNameABI[templateName],
    functionName: "claim",
    args: claimParams,
    value: claimFee,
    query: {
      enabled: claimParams.length === 4 && enabled,
    },
  });

  const writeFn = useSafeWriteContract({
    safeAddress: isSafeTx ? claimerAddress : undefined,
  });
  const { addTxPromise } = useContext(TxToastsContext);
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [claiming, setClaiming] = useState<boolean>(false);
  const waitFn = useSafeWaitForTransactionReceipt({
    hash,
    isSafe: isSafeTx,
    query: { enabled: !!hash },
  });

  const claim = useCallback(
    async (callbacks?: { onSuccess?: () => void; onError?: (e: unknown) => void }) => {
      if (!prepareFn.data || !writeFn.writeContractAsync) return;
      setClaiming(true);
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
        setClaiming(false);
      }
    },
    [prepareFn.data, writeFn.writeContractAsync, isSafeTx, addTxPromise],
  );

  return {
    prepareFn,
    writeFn: { ...writeFn, claim, claiming },
    waitFn,
  };
}
