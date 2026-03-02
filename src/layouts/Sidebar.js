import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

export function Sidebar({
  trips,
  selectedTrip,
  onSelect,
  loading,
  onAddTrip
}) {
  const { t } = useTranslation()

  return (
    <aside style={{ width: 380, padding: 20, overflowY: 'auto', background: 'white' }}>
      
      <h2>{t('title')}</h2>

      <LanguageSwitcher />

      {/* КНОПКА ДОБАВЛЕНИЯ */}
      <button
        onClick={onAddTrip}
        style={{
          margin: '15px 0',
          padding: '10px 15px',
          borderRadius: 8,
          border: 'none',
          background: '#3498db',
          color: 'white',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        {t('addTrip')}
      </button>

      {loading && <p>{t('loading')}</p>}

      {trips.map(trip => (
        <div
          key={trip.id}
          onClick={() => onSelect(trip)}
          style={{
            padding: 15,
            marginBottom: 10,
            borderRadius: 10,
            border: selectedTrip?.id === trip.id
              ? '2px solid #3498db'
              : '1px solid #ddd',
            cursor: 'pointer'
          }}
        >
          <strong>{trip.from_city} → {trip.to_city}</strong>
          <div>{trip.price} €</div>
          <div>{trip.departure_date}</div>
        </div>
      ))}
    </aside>
  )
}