"use client";
import "@rainbow-me/rainbowkit/styles.css";
import { FC, ReactNode, useState } from "react";
import { Button, ChakraProvider } from "@chakra-ui/react";
import {
  GetSiweMessageOptions,
  RainbowKitSiweNextAuthProvider,
} from "@rainbow-me/rainbowkit-siwe-next-auth";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { SessionProvider } from "next-auth/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import Web3Provider from "./Web3Provider";
import theme from "../theme";
import ConnectButton from "../components/common/ConnectButton";

type ProviderProps = {
  children: ReactNode;
  session: Session | null;
};

const queryClient = new QueryClient();

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: "Sign in to Megumi with Ethereum",
});

const Providers: FC<ProviderProps> = ({ children, session }) => {
  // TODO jotai
  const [requireSIWE, setRequireSIWE] = useState<boolean>(true);
  return (
    <Web3Provider>
      <SessionProvider refetchInterval={0} session={session}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitSiweNextAuthProvider
            enabled={requireSIWE}
            getSiweMessageOptions={getSiweMessageOptions}
          >
            <RainbowKitProvider theme={darkTheme()}>
              <ChakraProvider theme={theme}>
                {/* <Button onClick={() => setRequireSIWE(!requireSIWE)}>
                  Test{requireSIWE.toString()}
                </Button> */}
                {requireSIWE.toString()}
                <ConnectButton
                  setRequiringStatus={() => setRequireSIWE(false)}
                  requireAuthentication={false}
                  chainStatus="icon"
                />
                <ConnectButton setRequiringStatus={() => setRequireSIWE(true)} chainStatus="icon" />
                {children}
              </ChakraProvider>
            </RainbowKitProvider>
          </RainbowKitSiweNextAuthProvider>
        </QueryClientProvider>
      </SessionProvider>
    </Web3Provider>
  );
};

export default Providers;
