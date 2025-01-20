import { TemplateArgs, TemplateNames, TemplateType } from "@/app/lib/constants/templates";
import { TxToastsContext } from "@/app/providers/ToastProvider";
import { useCallback, useContext, useMemo } from "react";
import {
  decodeAbiParameters,
  encodeAbiParameters,
  encodeFunctionData,
  Hex,
  parseAbiParameters,
  parseEther,
} from "viem";
import { useSimulateContract, useWriteContract } from "wagmi";
import { Factory } from "@/app/lib/constants/abis";
import { CONTRACT_ADDRESSES } from "@/app/lib/constants/contracts";

export default function useDeployAirdrop<T extends TemplateType>({
  chainId,
  type,
  args,
  // owner,
  uuid,
  enabled = true,
}: {
  chainId: number;
  type: TemplateType;
  args: TemplateArgs[T];
  // owner: `0x${string}` | undefined;
  uuid: `0x${string}`;
  enabled?: boolean;
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
    // account: owner,
    abi: Factory,
    functionName: "deployMerkleAirdrop",
    args: [TemplateNames[type], uuid, getEncodedArgs()],
    value: parseEther("0.01"),
    query: {
      enabled: isReady,
    },
  });

  const writeFn = useWriteContract();
  const { setWritePromise, waitResult } = useContext(TxToastsContext);

  const write = useCallback(
    (callbacks?: { onSuccess?: () => void }): void => {
      if (!prepareFn.data || !writeFn.writeContractAsync) return;
      return setWritePromise(writeFn.writeContractAsync(prepareFn.data.request, callbacks));
    },
    [prepareFn.data, writeFn.writeContractAsync],
  );

  return {
    prepareFn,
    writeFn: { ...writeFn, write },
    getDecodedArgs,
    getTransactionRawData,
    waitResult,
  };
}
