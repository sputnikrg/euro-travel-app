import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Импортируем JSON файлы напрямую по вашему физическому пути
import translationRU from './locales/ru/translation.json';
import translationDE from './locales/de/translation.json';
import translationUA from './locales/ua/translation.json';

const resources = {
  ru: { translation: translationRU },
  de: { translation: translationDE },
  ua: { translation: translationUA }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru', 
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;