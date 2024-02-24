import i18next from "i18next";
import { InitOptions } from "i18next";

import en from "./locales/en.json";
import ja from "./locales/ja.json";

const resources = {
  ja: {
    translation: ja,
  },
  en: {
    translation: en,
  },
};

export const i18nextInitOptions: InitOptions = {
  lng: "en",
  fallbackLng: "en",
  supportedLngs: ["en", "ja"],
  resources,
};

i18next.init(i18nextInitOptions);

export default i18next;
