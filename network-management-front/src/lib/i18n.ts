import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { ar } from "@/locales/ar";
import { en } from "@/locales/en";

export const LANG_STORAGE_KEY = "wewifi-lang";

export type AppLanguage = "ar" | "en";

function getSavedLanguage(): AppLanguage {
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  return saved === "en" ? "en" : "ar";
}

export function applyDocumentLanguage(lang: AppLanguage) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

const initialLang = getSavedLanguage();
applyDocumentLanguage(initialLang);

void i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: initialLang,
  fallbackLng: "ar",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lang) => {
  applyDocumentLanguage(lang as AppLanguage);
  localStorage.setItem(LANG_STORAGE_KEY, lang);
});

export default i18n;
