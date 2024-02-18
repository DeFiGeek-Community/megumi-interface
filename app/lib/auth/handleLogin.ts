import { SiweMessage } from "siwe";
import { getCsrfToken, signIn } from "next-auth/react";
import { Chain } from "viem";

type LoginProps = {
  chain?: Chain;
  address?: `0x${string}`;
  signMessageAsync: ({ message }: { message: string }) => Promise<string>;
};

export const handleLogin = async ({ chain, address, signMessageAsync }: LoginProps) => {
  if (!chain || !address) return;
  try {
    const message = new SiweMessage({
      domain: window.location.host,
      address: address as `0x${string}`,
      statement: "Sign in with Ethereum",
      uri: window.location.origin,
      version: "1",
      chainId: chain.id,
      nonce: await getCsrfToken(),
    });

    const signature = await signMessageAsync({
      message: message.prepareMessage(),
    });

    const response = await signIn("siwe", {
      message: JSON.stringify(message),
      redirect: false,
      signature,
    });
    if (response?.error) {
      console.log("Error occured:", response.error);
    }
  } catch (error) {
    console.log("Error Occured", error);
  }
};
