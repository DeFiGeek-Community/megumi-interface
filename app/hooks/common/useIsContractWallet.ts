"use client";
// Forked from https://github.com/moleculeprotocol/test-wagmi-safe-privy
import { useEffect, useState } from "react";
import { Address } from "viem";
import { usePublicClient } from "wagmi";
import { isContractWallet } from "@/app/utils/safe";

export const useIsContractWallet = ({
  chainId,
  address,
}: {
  chainId: number | undefined;
  address: Address | undefined;
}): Awaited<ReturnType<typeof isContractWallet>> & { isChecking: boolean } => {
  const publicClient = usePublicClient({ chainId });
  const [_isContractWallet, setIsContractWallet] = useState<
    Awaited<ReturnType<typeof isContractWallet>>
  >({ isContract: false, isSafe: false });
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    if (!address || !publicClient) return;

    setIsChecking(true);
    isContractWallet(publicClient, address)
      .then(setIsContractWallet)
      .finally(() => setIsChecking(false));
  }, [address, publicClient]);

  return { ..._isContractWallet, isChecking };
};

/* try to check whether our connector *can* actually be a safe,  this is privy specific,
    // if (!activeWallet.connectorType.startsWith("wallet_connect")) {
    //   setIsSafeWallet(false);
    //   return;
    // }
*/
