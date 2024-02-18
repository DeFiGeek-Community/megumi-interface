"use client";
import { FC, ReactNode, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useAccount, useSignMessage } from "wagmi";
import { useAtom } from "jotai";
import { requireAuthAtom } from "@/app/stores/requireAuthAtom";
import { usePrevious } from "@chakra-ui/react";
import { handleLogin } from "@/app/lib/auth/handleLogin";

type ProviderProps = {
  children: ReactNode;
};
const AuthCallbackProvider: FC<ProviderProps> = ({ children }) => {
  const { isConnected, address, chain } = useAccount();
  const [requireAuth] = useAtom(requireAuthAtom);
  const prevIsConnected = usePrevious(isConnected);
  const { data: session } = useSession();
  const { signMessageAsync } = useSignMessage();

  // Sign out when the wallet is disconnected
  useEffect(() => {
    if (session?.user && !isConnected) {
      signOut({ redirect: false });
    }
  }, [isConnected, session?.user]);

  // Sign in when after the wallet is connected
  useEffect(() => {
    if (requireAuth && prevIsConnected === false && isConnected) {
      setTimeout(() => handleLogin({ chain, address, signMessageAsync }), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, requireAuth]);

  return <>{children}</>;
};

export default AuthCallbackProvider;
