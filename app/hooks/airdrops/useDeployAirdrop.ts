"use client";
import { useCallback, useContext, useState } from "react";
import {
  decodeAbiParameters,
  encodeAbiParameters,
  encodeFunctionData,
  Hex,
  parseAbiParameters,
  parseEther,
} from "viem";
import { useSimulateContract } from "wagmi";
import { TemplateArgs, TemplateNames, TemplateType } from "@/app/lib/constants/templates";
import { TxToastsContext } from "@/app/providers/ToastProvider";
import { Factory } from "@/app/lib/constants/abis";
import { CONTRACT_ADDRESSES } from "@/app/lib/constants/contracts";
import { getErrorMessage } from "@/app/utils/shared";
import { useSafeWriteContract } from "../safe/useSafeWriteContract";
import { useSafeWaitForTransactionReceipt } from "../safe/useSafeWaitForTransactionReceipt";

export default function useDeployAirdrop<T extends TemplateType>({
  chainId,
  type,
  args,
  ownerAddress,
  isSafeTx,
  uuid,
  enabled = true,
}: {
  chainId: number;
  type: TemplateType;
  args: TemplateArgs[T];
  isSafeTx: boolean;
  ownerAddress: `0x${string}`;
  uuid: `0x${string}`;
  enabled?: boolean;
  safeAddress?: `0x${string}`;
}) {
  const isReady: boolean = !!chainId && enabled;

  // TODO move to utils -->
  const getEncodedArgs = useCallback((): Hex => {
    try {
      return encodeAbiParameters(parseAbiParameters(TemplateArgs[type]), args);
    } catch (e) {
      return "0x";
    }
  }, [args, type]);

  const getDecodedArgs = useCallback(() => {
    try {
      return decodeAbiParameters(parseAbiParameters(TemplateArgs[type]), getEncodedArgs());
    } catch (e) {
      return [];
    }
  }, [getEncodedArgs, type]);

  const getTransactionRawData = useCallback(
    (templateName: string, args: string) => {
      return encodeFunctionData({
        abi: Factory,
        functionName: "deployMerkleAirdrop",
        args: [templateName, uuid, args],
      });
    },
    [uuid],
  );
  // <--

  const prepareFn = useSimulateContract({
    chainId,
    address: CONTRACT_ADDRESSES[chainId].FACTORY,
    account: ownerAddress,
    abi: Factory,
    functionName: "deployMerkleAirdrop",
    args: [TemplateNames[type], uuid, getEncodedArgs()],
    value: parseEther("0.01"),
    query: {
      enabled: isReady,
    },
  });

  const writeFn = useSafeWriteContract({
    safeAddress: isSafeTx ? ownerAddress : undefined,
  });

  const { addTxPromise } = useContext(TxToastsContext);
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [deploying, setDeploying] = useState<boolean>(false);
  const waitFn = useSafeWaitForTransactionReceipt({
    hash,
    isSafe: isSafeTx,
    query: { enabled: !!hash },
  });

  const deploy = useCallback(
    async (callbacks?: { onSuccess?: () => void; onError?: (e: unknown) => void }) => {
      if (!prepareFn.data || !writeFn.writeContractAsync) return;
      setDeploying(true);
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
        setDeploying(false);
      }
    },
    [prepareFn.data, writeFn.writeContractAsync, isSafeTx, addTxPromise],
  );

  return {
    prepareFn,
    writeFn: { ...writeFn, deploy, deploying },
    waitFn,
    getDecodedArgs,
    getTransactionRawData,
  };
}
