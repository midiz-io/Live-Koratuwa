import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language resources
import en from './locales/en.json';
import si from './locales/si.json';
import zh from './locales/zh.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ja from './locales/ja.json';
import ru from './locales/ru.json';
import hi from './locales/hi.json';
import ar from './locales/ar.json';
import es from './locales/es.json';

const resources = {
  en: { translation: en },
  si: { translation: si },
  zh: { translation: zh },
  fr: { translation: fr },
  de: { translation: de },
  ja: { translation: ja },
  ru: { translation: ru },
  hi: { translation: hi },
  ar: { translation: ar },
  es: { translation: es }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
