"use client";
import { FC, ReactNode } from "react";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import theme from "../theme";
import Web3Provider from "./Web3Provider";
import AuthCallbackProvider from "./AuthCallbackProvider";
import I18nProvider from "./I18nProvider";
import TxToastProvider from "./ToastProvider";

type ProviderProps = {
  children: ReactNode;
  session: Session | null;
  locale: string;
};

const queryClient = new QueryClient();

const Providers: FC<ProviderProps> = ({ children, session, locale }) => {
  return (
    <Web3Provider>
      <SessionProvider refetchInterval={0} session={session}>
        <QueryClientProvider client={queryClient}>
          <AuthCallbackProvider>
            <ChakraProvider theme={theme}>
              <ColorModeScript initialColorMode={"dark"} />
              <I18nProvider locale={locale}>
                <TxToastProvider>{children}</TxToastProvider>
              </I18nProvider>
            </ChakraProvider>
          </AuthCallbackProvider>
        </QueryClientProvider>
      </SessionProvider>
    </Web3Provider>
  );
};

export default Providers;
