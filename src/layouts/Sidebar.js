import { useState, useEffect } from 'react'; // Добавляем useEffect и useState
import { useAuth } from '../features/auth/AuthContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';

export const Sidebar = ({ trips, onAddTrip, fetchTrips, loading, onSelect, selectedTrip }) => {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  
  // Состояние для хранения заявок
  const [bookings, setBookings] = useState({});

  // Функция для загрузки заявок для конкретного рейса
  const fetchBookingsForTrip = async (tripId) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('trip_id', tripId);
    
    if (!error) {
      setBookings(prev => ({ ...prev, [tripId]: data }));
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleBooking = async (tripId) => {
    const name = prompt(t('booking.enter_name'));
    const phone = prompt(t('booking.enter_phone'));
    if (!name || !phone) return;

    const { error } = await supabase
      .from('bookings')
      .insert([{ trip_id: tripId, passenger_name: name, passenger_phone: phone }]);

    if (error) alert(t('booking.error') + ": " + error.message);
    else alert(t('booking.success'));
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>EuroWays</h2>
        <div style={styles.langSwitcher}>
          <button onClick={() => changeLanguage('de')} style={styles.langBtn}>DE</button>
          <button onClick={() => changeLanguage('ru')} style={styles.langBtn}>RU</button>
          <button onClick={() => changeLanguage('ua')} style={styles.langBtn}>UA</button>
        </div>
      </div>
      
      <div style={styles.userBox}>
        <span>{user?.email}</span>
        <button onClick={() => signOut()} style={styles.logoutBtn}>{t('auth.logout')}</button>
      </div>

      <div style={styles.filterButtons}>
        <button style={styles.filterBtn} onClick={() => fetchTrips()}>{t('filters.all_trips')}</button>
        <button style={styles.filterBtn} onClick={() => fetchTrips(user.id)}>{t('filters.my_trips')}</button>
      </div>

      <button onClick={onAddTrip} style={styles.addBtn}>{t('actions.add_trip')}</button>

      <div style={styles.list}>
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : (
          trips.map(trip => {
            const isOwner = trip.user_id === user.id; // Проверяем, твой ли это рейс
            const tripBookings = bookings[trip.id] || [];

            return (
              <div 
                key={trip.id} 
                onClick={() => {
                  onSelect(trip);
                  if (isOwner) fetchBookingsForTrip(trip.id); // Грузим брони, если мы хозяева
                }}
                style={{
                  ...styles.card,
                  borderColor: selectedTrip?.id === trip.id ? '#3498db' : '#eee'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{trip.from_city} → {trip.to_city}</div>
                <div style={styles.tripDetails}>
                  <span>📅 {trip.departure_date}</span>
                  {trip.distance && <span> 🛣 {trip.distance} {t('units.km')}</span>}
                </div>
                
                <div style={styles.cardFooter}>
                  <div style={styles.price}>{trip.price} €</div>
                  {!isOwner && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleBooking(trip.id); }}
                      style={styles.bookBtn}
                    >{t('actions.book')}</button>
                  )}
                </div>

                {/* СПИСОК ПАССАЖИРОВ (только для владельца) */}
                {isOwner && tripBookings.length > 0 && (
                  <div style={styles.bookingsList}>
                    <div style={styles.bookingTitle}>👥 Пассажиры ({tripBookings.length}):</div>
                    {tripBookings.map(b => (
                      <div key={b.id} style={styles.bookingItem}>
                        {b.passenger_name} — <b>{b.passenger_phone}</b>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const styles = {
  // ... твои предыдущие стили ...
  sidebar: { width: '400px', padding: '20px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box', backgroundColor: '#fafafa' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  langSwitcher: { display: 'flex', gap: '5px' },
  langBtn: { padding: '4px 8px', fontSize: '11px', cursor: 'pointer', background: '#fff', border: '1px solid #ddd', borderRadius: '4px' },
  userBox: { marginBottom: '20px', padding: '10px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', fontSize: '12px', display: 'flex', justifyContent: 'space-between' },
  filterButtons: { display: 'flex', gap: '10px', marginBottom: '15px' },
  filterBtn: { flex: 1, padding: '8px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', fontSize: '12px' },
  addBtn: { padding: '12px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' },
  logoutBtn: { background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' },
  list: { overflowY: 'auto', flex: 1 },
  card: { padding: '15px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #eee', cursor: 'pointer', backgroundColor: '#fff' },
  tripDetails: { fontSize: '12px', color: '#666', marginBottom: '10px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: '16px', color: '#2ecc71', fontWeight: 'bold' },
  bookBtn: { padding: '6px 12px', background: '#f39c12', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
  
  // НОВЫЕ СТИЛИ ДЛЯ СПИСКА БРОНИРОВАНИЙ
  bookingsList: { marginTop: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '5px', borderTop: '1px dashed #ddd' },
  bookingTitle: { fontSize: '11px', fontWeight: 'bold', color: '#555', marginBottom: '5px' },
  bookingItem: { fontSize: '12px', color: '#333', padding: '2px 0' }
};