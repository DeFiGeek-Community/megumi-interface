"use client";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  useEffect(() => {
    // Workaround to apply custome style to the connect button in shadow dom
    setTimeout(() => {
      const shadowHosts = document.querySelectorAll("w3m-button");
      shadowHosts.forEach((shadowHost) => {
        if (!shadowHost.shadowRoot) return;
        const w3mShadowHost = shadowHost.shadowRoot.querySelector("w3m-connect-button");
        if (!w3mShadowHost || !w3mShadowHost.shadowRoot) return;

        const wuiShadowHost = w3mShadowHost.shadowRoot.querySelector("wui-connect-button");
        if (!wuiShadowHost || !wuiShadowHost.shadowRoot) return;

        const button = wuiShadowHost.shadowRoot.querySelector("button");
        if (button) {
          button.style.width = "100%";
          button.style.borderRadius = "0.375rem";
        }
      });
    }, 10);
  }, [isConnected]);

  if (!isMounted) return <></>;

  return (
    <>
      {!isConnected && (
        <chakra.span onClick={() => setRequireAuth(requireSignIn)}>
          <w3m-button {...props} />
        </chakra.span>
      )}
      {isConnected && (
        <Button
          colorScheme={"green"}
          w={"full"}
          onClick={() => handleLogin({ chain, address, signMessageAsync })}
        >
          {t("common.signInWithEthereum")}
        </Button>
      )}
    </>
  );
}
