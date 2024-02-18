"use client";
import { FC, ReactNode } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import Web3Provider from "./Web3Provider";
import { SessionProvider } from "next-auth/react";
import AuthCallbackProvider from "./AuthCallbackProvider";
import theme from "../theme";

type ProviderProps = {
  children: ReactNode;
  session: Session | null;
};

const queryClient = new QueryClient();

const Providers: FC<ProviderProps> = ({ children, session }) => {
  return (
    <Web3Provider>
      <SessionProvider refetchInterval={0} session={session}>
        <QueryClientProvider client={queryClient}>
          <AuthCallbackProvider>
            <ChakraProvider theme={theme}>{children}</ChakraProvider>
          </AuthCallbackProvider>
        </QueryClientProvider>
      </SessionProvider>
    </Web3Provider>
  );
};

export default Providers;
