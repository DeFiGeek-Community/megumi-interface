"use client";
import { useState, useCallback } from "react";
import { getCsrfToken, signIn } from "next-auth/react";
import { SiweMessage } from "siwe";
import { getErrorMessage } from "@/app/utils/shared";
import { useSignMessage, useSwitchChain, useAccount } from "wagmi";
import { isSupportedChain } from "@/app/utils/chain";
import { useWeb3ModalState } from "@web3modal/wagmi/react";

export type LoginProps = {
  chainId: number;
  address: string;
  safeAddress?: `0x${string}`;
};

export const useHandleLogin = () => {
  const { signMessageAsync } = useSignMessage();
  const { chain: connectedChain, connector } = useAccount();
  const { chains, switchChain } = useSwitchChain();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const state = useWeb3ModalState();

  const login = useCallback(
    async ({ chainId, address, safeAddress }: LoginProps) => {
      setSigningIn(true);
      setError(null);

      try {
        const connectedChainId = await connector?.getChainId();

        if (!isSupportedChain(chainId)) {
          switchChain({ chainId: parseInt(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID!) });
          // throw new Error(`Chain id ${chainId} is not supported`);
        }

        if (connectedChainId !== chainId) {
          switchChain({ chainId });
        }

        const message = new SiweMessage({
          domain: window.location.host,
          address: address as `0x${string}`,
          statement: "Sign in with Ethereum",
          uri: window.location.origin,
          version: "1",
          chainId,
          nonce: await getCsrfToken(),
          expirationTime: new Date(new Date().getTime() + 600000).toISOString(), // Requires to verify in 10 min
        });

        if (safeAddress) {
          message.resources = [safeAddress];
        }

        const signature = await signMessageAsync({
          message: message.prepareMessage(),
        });

        const response = await signIn("siwe", {
          message: JSON.stringify(message),
          redirect: true,
          signature,
          callbackUrl: "/dashboard",
        });
        if (response?.error) {
          throw new Error(response.error);
        }
      } catch (error: unknown) {
        console.log("error", error);
        setError(getErrorMessage(error));
      } finally {
        setSigningIn(false);
      }
    },
    [connectedChain, connector],
  );

  return { login, signingIn, error };
};
