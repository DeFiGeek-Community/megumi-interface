"use client";
import { TemplateArgs, TemplateNames, TemplateType } from "@/app/lib/constants/templates";
import { TxToastsContext } from "@/app/providers/ToastProvider";
import { useCallback, useContext } from "react";
import {
  decodeAbiParameters,
  encodeAbiParameters,
  encodeFunctionData,
  Hex,
  parseAbiParameters,
  parseEther,
} from "viem";
import { useSimulateContract } from "wagmi";
import { Factory } from "@/app/lib/constants/abis";
import { CONTRACT_ADDRESSES } from "@/app/lib/constants/contracts";
import { useSafeWriteContract } from "../safe/useSafeWriteContract";

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
    // account: ownerAddress,
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
  const { setWritePromise, waitResult } = useContext(TxToastsContext);

  const write = useCallback(
    (callbacks?: { onSuccess?: () => void }): void => {
      if (!prepareFn.data || !writeFn.writeContractAsync) return;
      return setWritePromise({
        promise: writeFn.writeContractAsync(prepareFn.data.request, callbacks),
        isSafe: isSafeTx,
      });
    },
    [prepareFn.data, writeFn.writeContractAsync, isSafeTx],
  );

  return {
    prepareFn,
    writeFn: { ...writeFn, write },
    getDecodedArgs,
    getTransactionRawData,
    waitResult,
  };
}
