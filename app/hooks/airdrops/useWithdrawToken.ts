import { TxToastsContext } from "@/app/providers/ToastProvider";
import { useContext } from "react";
import { useSimulateContract, useWriteContract } from "wagmi";
import { Standard } from "@/app/lib/constants/abis";

export default function useWithdrawFee({
  chainId,
  contractAddress,
  enabled = true,
}: {
  chainId: number;
  contractAddress: `0x${string}` | null;
  enabled?: boolean;
}) {
  const isReady: boolean = !!chainId && !!contractAddress && enabled;

  const prepareFn = useSimulateContract({
    chainId,
    address: contractAddress || "0x",
    // account: owner,
    abi: Standard,
    functionName: "withdrawDepositedToken",
    query: {
      enabled: isReady,
    },
  });

  const writeFn = useWriteContract();
  const { setWritePromise, waitResult } = useContext(TxToastsContext);

  const write = (callbacks?: { onSuccess?: () => void }): void => {
    if (!prepareFn.data || !writeFn.writeContractAsync) return;
    return setWritePromise(writeFn.writeContractAsync(prepareFn.data.request, callbacks));
  };

  return {
    prepareFn,
    writeFn: { ...writeFn, write },
    waitResult,
  };
}
