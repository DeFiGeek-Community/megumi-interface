"use client";
import { FC, ReactNode, useEffect } from "react";
import { setCookie } from "cookies-next";
import { I18nextProvider } from "react-i18next";
import i18next from "@/lib/i18nConfig";

i18next.on("languageChanged", (lang: string) => {
  setCookie("locale", lang);
});

type ProviderProps = {
  children: ReactNode;
  locale: string;
};

const I18nProvider: FC<ProviderProps> = ({ children, locale }) => {
  useEffect(() => {
    if (i18next.options.supportedLngs && i18next.options.supportedLngs.includes(locale)) {
      i18next.changeLanguage(locale);
    }
  }, [locale]);
  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
};

export default I18nProvider;
