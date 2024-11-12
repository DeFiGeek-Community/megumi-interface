"use client";
import { Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function Card() {
  const { t } = useTranslation();
  return (
    <>
      <Text>{t("airdrop.title")}</Text>
    </>
  );
}
