"use client";
import { FC, ReactNode } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { RainbowKitSiweNextAuthProvider } from "@rainbow-me/rainbowkit-siwe-next-auth";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { SessionProvider } from "next-auth/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import Web3Provider from "./Web3Provider";
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
          <RainbowKitSiweNextAuthProvider>
            <RainbowKitProvider>
              <ChakraProvider theme={theme}>{children}</ChakraProvider>
            </RainbowKitProvider>
          </RainbowKitSiweNextAuthProvider>
        </QueryClientProvider>
      </SessionProvider>
    </Web3Provider>
  );
};

export default Providers;
