// Forked from https://github.com/moleculeprotocol/test-wagmi-safe-privy
import { useEffect, useState } from "react";
import {
  useWaitForTransactionReceipt,
  useAccount,
  type UseWaitForTransactionReceiptParameters,
} from "wagmi";
import { resolveSafeTx } from "@/app/utils/safe";

type UseSafeWaitForTransactionReceiptParameters = UseWaitForTransactionReceiptParameters & {
  isSafe: boolean;
};
type UseSafeWaitForTransactionReturn = ReturnType<typeof useWaitForTransactionReceipt> & {
  resolvedTxHash?: `0x${string}`;
};
export const useSafeWaitForTransactionReceipt = (
  config: UseSafeWaitForTransactionReceiptParameters,
): UseSafeWaitForTransactionReturn => {
  const { chainId } = useAccount();
  const [safeParams, setSafeParams] = useState<UseSafeWaitForTransactionReceiptParameters | null>(
    null,
  );
  const waitResponse = useWaitForTransactionReceipt({
    ...safeParams,
    query: { enabled: !!safeParams?.hash },
  });

  useEffect(() => {
    if (!config || !config.hash || !chainId) {
      return;
    }

    if (config.isSafe) {
      setSafeParams(null);
      //try to resolve the underlying transaction
      resolveSafeTx(chainId, config.hash).then((resolvedTx) => {
        if (!resolvedTx) throw new Error("couldnt resolve safe tx");
        setSafeParams({ ...config, hash: resolvedTx });
      });
    } else {
      setSafeParams(config);
    }
  }, [chainId, config.isSafe, config.hash]);

  return { ...waitResponse, resolvedTxHash: safeParams?.hash };
};
