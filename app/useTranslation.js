import { useLanguage } from "../context/LanguageContext";
import { translateText } from "../utils/libreTranslate";

export const useTranslation = () => {
  const { language } = useLanguage();

  const translate = async (text) => {
    if (language === "es") return text; // Si está en español, no traducir
    const translated = await translateText(text, language);
    return translated;
  };

  return { translate };
};
