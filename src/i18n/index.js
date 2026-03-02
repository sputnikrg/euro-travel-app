import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import de from './locales/de/translation.json'
import ru from './locales/ru/translation.json'
import ua from './locales/ua/translation.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      ru: { translation: ru },
      ua: { translation: ua }
    },
    lng: 'de',
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n