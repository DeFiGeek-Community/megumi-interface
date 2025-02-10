"use client";
// Forked from wagmi useWriteContract
// https://github.com/wevm/wagmi/blob/42e65ea4fea99c639817088bba915e0933d17141/packages/react/src/hooks/useWriteContract.ts
import { useMutation } from "@tanstack/react-query";
import {
  useConfig,
  type UseWriteContractParameters,
  type UseWriteContractReturnType,
  type Config,
  type ResolvedRegister,
} from "wagmi";
import { writeContractMutationOptions } from "wagmi/query";
import { safeWriteContractMutationOptions } from "@/app/lib/safe/safeWriteContract";

export type ConfigParameter<config extends Config = Config> = {
  config?: Config | config | undefined;
};

/** https://wagmi.sh/react/api/hooks/useWriteContract */
export function useSafeWriteContract<
  config extends Config = ResolvedRegister["config"],
  context = unknown,
>(
  parameters: UseWriteContractParameters<config, context> & { safeAddress?: `0x${string}` } = {},
): UseWriteContractReturnType<config, context> {
  const { mutation, safeAddress } = parameters;

  const config = useConfig(parameters);

  const mutationOptions = safeAddress
    ? safeWriteContractMutationOptions({ ...config, safeAddress })
    : writeContractMutationOptions(config);
  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  });

  type Return = UseWriteContractReturnType<config, context>;
  return {
    ...result,
    writeContract: mutate as Return["writeContract"],
    writeContractAsync: mutateAsync as Return["writeContractAsync"],
  };
}
