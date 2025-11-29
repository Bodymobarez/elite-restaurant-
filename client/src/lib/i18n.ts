import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from '../locales/en/translation.json';
import arTranslation from '../locales/ar/translation.json';

const resources = {
  en: { translation: enTranslation },
  ar: { translation: arTranslation }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export function updateDocumentDirection(lang: string) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
});

updateDocumentDirection(i18n.language || 'en');

export default i18n;
