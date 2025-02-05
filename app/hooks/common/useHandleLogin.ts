"use client";
import { useState, useCallback } from "react";
import { getCsrfToken, signIn } from "next-auth/react";
import { SiweMessage } from "siwe";
import type { Chain } from "viem";
import { getErrorMessage } from "@/app/utils/shared";
import { useSignMessage } from "wagmi";

export type LoginProps = {
  chain: Chain;
  address: string;
  safeAddress?: `0x${string}`;
};

export const useHandleLogin = () => {
  const { signMessageAsync } = useSignMessage();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async ({ chain, address, safeAddress }: LoginProps) => {
    setSigningIn(true);
    setError(null);

    try {
      const message = new SiweMessage({
        domain: window.location.host,
        address: address as `0x${string}`,
        statement: "Sign in with Ethereum",
        uri: window.location.origin,
        version: "1",
        chainId: chain.id,
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
      setError(getErrorMessage(error));
    } finally {
      setSigningIn(false);
    }
  }, []);

  return { login, signingIn, error };
};
