"use client";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";
import { Image, Button, ButtonProps, useDisclosure, useToast } from "@chakra-ui/react";
import { SafeAddressModal } from "@/app/components/common/SafeAddressModal";
import safeLogo from "@/public/images/safe.png";
import { RequireAuthContext } from "@/app/providers/AuthCallbackProvider";
import { useWeb3Modal } from "@web3modal/wagmi/react";

export default function SafeSignInButton({
  onSignInSuccess,
  onSignInError,
  text,
  ...buttonProps
}: {
  onSignInSuccess?: () => void;
  onSignInError?: (error: string) => void;
  text?: string;
} & ButtonProps) {
  const safeModalDisclosure = useDisclosure();
  const { address: connectedAddress, isConnected, chainId, isConnecting } = useAccount();
  const { setRequireAuth, login, signingIn, error: signInError } = useContext(RequireAuthContext);
  const { open } = useWeb3Modal();
  const { t } = useTranslation();
  const toast = useToast({ position: "top-right", isClosable: true });

  useEffect(() => {
    if (signInError) onSignInError?.(signInError);
  }, [signInError]);

  return (
    <>
      <Button
        {...buttonProps}
        leftIcon={<Image width={"12px"} height={"12px"} alt={"Safe account"} src={safeLogo.src} />}
        variant={"solid"}
        isLoading={signingIn}
        onClick={
          !connectedAddress || !chainId
            ? () => {
                safeModalDisclosure.onOpen();
              }
            : async () => {
                try {
                  // const chainId = await switchToSupportedNetwork(chain.id);
                  safeModalDisclosure.onOpen();
                } catch (e: any) {
                  toast({
                    title: e.message,
                    status: "error",
                    duration: 5000,
                  });
                }
              }
        }
      >
        {text ? text : t("common.siginInWithEthereumAsSafe")}
      </Button>

      {safeModalDisclosure.isOpen && (
        <SafeAddressModal
          isOpen={safeModalDisclosure.isOpen}
          isLoading={signingIn || isConnecting}
          onClose={safeModalDisclosure.onClose}
          onProceed={
            !!isConnected && !!chainId && connectedAddress
              ? async (safeAddress: `0x${string}`) => {
                  login?.({ chainId, address: connectedAddress, safeAddress });
                }
              : async (safeAddress: `0x${string}`) => {
                  setRequireAuth({ flag: true, safeAddress: safeAddress });
                  open();
                }
          }
        />
      )}
    </>
  );
}
