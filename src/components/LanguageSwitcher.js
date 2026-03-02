import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <button onClick={() => changeLanguage('de')}>DE</button>
      <button onClick={() => changeLanguage('ru')} style={{ marginLeft: 5 }}>RU</button>
      <button onClick={() => changeLanguage('ua')} style={{ marginLeft: 5 }}>UA</button>
    </div>
  )
}