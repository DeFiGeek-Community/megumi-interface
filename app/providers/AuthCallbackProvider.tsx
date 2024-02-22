"use client";
import { Dispatch, FC, ReactNode, SetStateAction, createContext, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useAccount, useSignMessage } from "wagmi";
import { usePrevious } from "@chakra-ui/react";
import { handleLogin } from "@/app/lib/auth/handleLogin";

export type RequireAuthContextType = {
  requireAuth: boolean;
  setRequireAuth: Dispatch<SetStateAction<boolean>>;
};
export const RequireAuthContext = createContext<RequireAuthContextType>({
  requireAuth: false,
  setRequireAuth: () => {},
});

type ProviderProps = {
  children: ReactNode;
};
const AuthCallbackProvider: FC<ProviderProps> = ({ children }) => {
  const { isConnected, address, chain } = useAccount();
  const [requireAuth, setRequireAuth] = useState<boolean>(false);
  const prevIsConnected = usePrevious(isConnected);
  const { data: session } = useSession();
  const { signMessageAsync } = useSignMessage();

  // Sign out when the wallet is disconnected
  useEffect(() => {
    if (session?.user && !isConnected) {
      signOut({ redirect: true });
    }
  }, [isConnected, session?.user]);

  // Sign in when after the wallet is connected
  useEffect(() => {
    if (requireAuth && prevIsConnected === false && isConnected) {
      setTimeout(() => handleLogin({ chain, address, signMessageAsync }), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, requireAuth]);

  return (
    <RequireAuthContext.Provider value={{ requireAuth, setRequireAuth }}>
      {children}
    </RequireAuthContext.Provider>
  );
};

export default AuthCallbackProvider;
