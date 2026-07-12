import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { de } from "./locales/de";
import { en } from "./locales/en";
import { hr } from "./locales/hr";

export const SUPPORTED_LANGUAGES = ["hr", "en", "de"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

// Croatian is the default; a stored choice (language switcher) overrides it.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hr: { translation: hr },
      de: { translation: de },
    },
    fallbackLng: "hr",
    supportedLngs: [...SUPPORTED_LANGUAGES],
    detection: {
      order: ["localStorage"],
      caches: ["localStorage"],
      lookupLocalStorage: "lng",
    },
    interpolation: { escapeValue: false },
    initAsync: false,
  });

export default i18n;
