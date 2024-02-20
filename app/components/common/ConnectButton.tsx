"use client";
import { useContext } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { chakra, Button } from "@chakra-ui/react";
import { handleLogin } from "@/app/lib/auth/handleLogin";
import { useIsMounted } from "@/app/hooks/common/useIsMounted";
import { RequireAuthContext } from "@/app/providers/AuthCallbackProvider";

type ConnectButtonProps = {
  requireSignIn?: boolean;
  size?: "md" | "sm";
  label?: string;
  loadingLabel?: string;
  disabled?: boolean;
  balance?: "show" | "hide";
};

export default function ConnectButton({ requireSignIn = false, ...props }: ConnectButtonProps) {
  const isMounted = useIsMounted();
  const { address, isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { setRequireAuth } = useContext(RequireAuthContext);

  if (!isMounted) return <></>;

  return (
    <>
      {!isConnected && (
        <chakra.span onClick={() => setRequireAuth(requireSignIn)}>
          <w3m-button {...props} />
        </chakra.span>
      )}
      {isConnected && (
        <Button onClick={() => handleLogin({ chain, address, signMessageAsync })}>
          Sign In With Ethereum
        </Button>
      )}
    </>
  );
}
