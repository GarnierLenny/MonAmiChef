import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  fr: {
    translation: frTranslations,
  },
};

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Default language
    debug: false, // Set to true for development debugging

    interpolation: {
      escapeValue: false, // React already escapes by default
    },

    detection: {
      // Detection order: saved preference → browser language → HTML lang → fallback
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],

      // Cache the detected/selected language in localStorage
      caches: ['localStorage'],

      // Only detect languages we actually support
      checkWhitelist: true,

      // Convert browser language codes to our supported languages
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,

      // Convert common browser language codes to our supported languages
      convertDetectedLanguage: (lng: string) => {
        // Handle browser languages like 'en-US', 'fr-FR', 'fr-CA', etc.
        if (lng.startsWith('en')) return 'en';
        if (lng.startsWith('fr')) return 'fr';
        return lng;
      }
    },

    // Whitelist supported languages for detection
    supportedLngs: ['en', 'fr'],
  });

export default i18n;