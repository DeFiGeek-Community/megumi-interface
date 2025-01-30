"use client";
import { useTranslation } from "react-i18next";
import { useWalletClient } from "wagmi";
import { AddIcon } from "@chakra-ui/icons";
import { Button, ButtonProps } from "@chakra-ui/react";

export const TokenAddButton = ({
  address,
  symbol,
  decimals,
  image,
  ...props
}: {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  image?: string;
} & ButtonProps) => {
  const { data: walletClient } = useWalletClient();
  const { t } = useTranslation();
  return walletClient ? (
    <Button
      {...props}
      onClick={() => {
        try {
          walletClient.watchAsset({
            type: "ERC20",
            options: {
              address,
              symbol,
              decimals,
              image,
            },
          });
        } catch (error) {
          console.error(error);
        }
      }}
    >
      <AddIcon mr={1} /> {t("airdrop.addTokenToWallet")}
    </Button>
  ) : null;
};
