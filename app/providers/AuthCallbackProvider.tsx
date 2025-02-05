"use client";
import { Dispatch, FC, ReactNode, SetStateAction, createContext, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { usePrevious } from "@chakra-ui/react";
import { LoginProps, useHandleLogin } from "@/app/hooks/common/useHandleLogin";

export type RequireAuthContextType = {
  requireAuth: RequireAuthParams;
  setRequireAuth: Dispatch<SetStateAction<RequireAuthParams>>;
  login: (({ chain, address, safeAddress }: LoginProps) => Promise<void>) | null;
  signingIn: boolean;
  error: string | null;
};
export const RequireAuthContext = createContext<RequireAuthContextType>({
  requireAuth: { flag: false },
  setRequireAuth: () => {},
  login: null,
  signingIn: false,
  error: null,
});

type ProviderProps = {
  children: ReactNode;
};
type RequireAuthParams = {
  flag: boolean;
  safeAddress?: `0x${string}`;
};
const AuthCallbackProvider: FC<ProviderProps> = ({ children }) => {
  const { isConnected, address, chain } = useAccount();
  const { login, signingIn, error } = useHandleLogin();
  const [requireAuth, setRequireAuth] = useState<RequireAuthParams>({ flag: false });
  const prevIsConnected = usePrevious(isConnected);
  const { data: session } = useSession();

  // Sign out when the wallet is disconnected
  useEffect(() => {
    if (session?.user && !isConnected) {
      signOut({ redirect: true });
    }
  }, [isConnected, session?.user]);

  // Sign in when after the wallet is connected
  useEffect(() => {
    if (requireAuth.flag && prevIsConnected === false && isConnected && !!chain && !!address) {
      setTimeout(
        () =>
          login({
            chain,
            address,
            safeAddress: requireAuth.safeAddress,
          }),
        1000,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, requireAuth.flag]);

  return (
    <RequireAuthContext.Provider value={{ requireAuth, setRequireAuth, signingIn, error, login }}>
      {children}
    </RequireAuthContext.Provider>
  );
};

export default AuthCallbackProvider;
