import { useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';

export const Sidebar = ({ trips, onAddTrip, fetchTrips, loading, onSelect, selectedTrip }) => {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [bookingTripId, setBookingTripId] = useState(null);
  const [passengerData, setPassengerData] = useState({ name: '', phone: '', seats: 1 });
  const [bookings, setBookings] = useState({});

  const changeLanguage = (lng) => i18n.changeLanguage(lng);

  const filteredTrips = trips.filter(trip => 
    (trip.from_city || "").toLowerCase().includes(searchFrom.toLowerCase()) &&
    (trip.to_city || "").toLowerCase().includes(searchTo.toLowerCase())
  );

  const fetchBookingsForTrip = async (tripId) => {
    console.log("Загрузка заявок для рейса:", tripId);
    const { data, error } = await supabase.from('bookings').select('*').eq('trip_id', tripId);
    if (!error) setBookings(prev => ({ ...prev, [tripId]: data }));
    else console.error("Ошибка загрузки заявок:", error);
  };

  const updateStatus = async (e, bookingId, newStatus, tripId) => {
    e.stopPropagation(); // ВАЖНО: чтобы не срабатывал клик по карточке
    console.log("Обновление статуса заявки:", bookingId);
    
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);
      
    if (!error) {
      console.log("Статус обновлен успешно");
      await fetchBookingsForTrip(tripId);
    } else {
      console.error("Ошибка обновления статуса:", error);
    }
  };

  const submitBooking = async (tripId, maxAvailable) => {
    if (!passengerData.name || !passengerData.phone) {
      alert(t('booking.error'));
      return;
    }

    const { error } = await supabase.from('bookings').insert([{ 
      trip_id: tripId, 
      passenger_name: passengerData.name, 
      passenger_phone: passengerData.phone, 
      seats_reserved: parseInt(passengerData.seats), 
      status: 'pending' 
    }]);

    if (!error) {
      alert(t('booking.success'));
      setBookingTripId(null);
      setPassengerData({ name: '', phone: '', seats: 1 });
      fetchTrips(); 
    }
  };

  return (
    <div className="sidebar" style={styles.sidebar}>
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>EuroWays</h2>
        <div style={styles.langSwitcher}>
          <button onClick={() => changeLanguage('de')} style={styles.langBtn}>DE</button>
          <button onClick={() => changeLanguage('ru')} style={styles.langBtn}>RU</button>
          <button onClick={() => changeLanguage('ua')} style={styles.langBtn}>UA</button>
        </div>
      </div>

      <div style={styles.searchBox}>
        <input 
          placeholder={t('search.from')} 
          value={searchFrom} 
          onChange={(e) => setSearchFrom(e.target.value)} 
          style={styles.searchInput}
        />
        <input 
          placeholder={t('search.to')} 
          value={searchTo} 
          onChange={(e) => setSearchTo(e.target.value)} 
          style={styles.searchInput}
        />
      </div>
      
      <div style={styles.userBox}>
        <span style={styles.emailText}>{user?.email}</span>
        <button onClick={() => signOut()} style={styles.logoutBtn}>Выйти</button>
      </div>

      <div style={styles.filterButtons}>
        <button style={styles.filterBtn} onClick={() => fetchTrips()}>Все рейсы</button>
        <button style={styles.filterBtn} onClick={() => fetchTrips(user.id)}>Мои рейсы</button>
      </div>

      <button onClick={onAddTrip} style={styles.addBtn}>{t('actions.add_trip')}</button>

      <div style={styles.list}>
        {loading ? <p>Загрузка...</p> : filteredTrips.map(trip => {
          const isOwner = trip.user_id === user.id;
          const tripBookings = bookings[trip.id] || [];
          const taken = tripBookings.reduce((sum, b) => sum + (b.seats_reserved || 1), 0);
          const left = (trip.total_seats || 0) - taken;

          return (
            <div key={trip.id} 
              onClick={() => { 
                onSelect(trip); 
                if (isOwner) fetchBookingsForTrip(trip.id); 
              }}
              style={{ ...styles.card, borderColor: selectedTrip?.id === trip.id ? '#3498db' : '#eee' }}>
              
              <div style={styles.tripTitle}>
                {trip.from_city} → {trip.to_city}
                {trip.intermediate_cities && <span style={styles.smallCities}> ({trip.intermediate_cities})</span>}
              </div>

              <div style={styles.tripDetails}>
                📅 {trip.departure_date} | 🚗 {trip.car_model || '---'} 
                {trip.is_regular && <span style={styles.regBadge}>REG</span>}
              </div>

              <div style={{ fontSize: '12px', color: left > 0 ? '#2ecc71' : '#e74c3c', marginBottom: '8px' }}>
                {t('seats.available')}: <b>{left} / {trip.total_seats || 0}</b>
              </div>

              <div style={styles.cardFooter}>
                <div style={styles.price}>{trip.price} €</div>
                {!isOwner && left > 0 && bookingTripId !== trip.id && (
                  <button onClick={(e) => { e.stopPropagation(); setBookingTripId(trip.id); }} style={styles.bookBtn}>
                    {t('actions.book')}
                  </button>
                )}
              </div>

              {/* Форма бронирования */}
              {!isOwner && bookingTripId === trip.id && (
                <div style={styles.inlineForm} onClick={(e) => e.stopPropagation()}>
                  <input placeholder={t('booking.name')} style={styles.formInput} onChange={(e) => setPassengerData({...passengerData, name: e.target.value})} />
                  <input placeholder={t('booking.phone')} style={styles.formInput} onChange={(e) => setPassengerData({...passengerData, phone: e.target.value})} />
                  <input type="number" max={left} min="1" placeholder="Мест" style={styles.formInput} onChange={(e) => setPassengerData({...passengerData, seats: e.target.value})} />
                  <div style={{display:'flex', gap: '5px'}}>
                    <button onClick={() => submitBooking(trip.id, left)} style={styles.submitBtn}>Ок</button>
                    <button onClick={() => setBookingTripId(null)} style={styles.cancelBtn}>✕</button>
                  </div>
                </div>
              )}

              {/* Список пассажиров для владельца */}
              {isOwner && tripBookings.length > 0 && (
                <div style={styles.bookingsList}>
                  {tripBookings.map(b => (
                    <div key={b.id} style={styles.bookingItem} onClick={(e) => e.stopPropagation()}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                         <span style={{fontSize: '12px'}}>👤 {b.passenger_name} (<b>x{b.seats_reserved}</b>)</span>
                         <span style={{fontSize: '14px'}}>{b.status === 'confirmed' ? '✅' : '⏳'}</span>
                      </div>
                      <div style={{fontSize:'11px', color: '#666'}}>📞 {b.passenger_phone}</div>
                      {b.status === 'pending' && (
                        <button 
                          onClick={(e) => updateStatus(e, b.id, 'confirmed', trip.id)} 
                          style={styles.confirmBtn}
                        >
                          {t('actions.confirm')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  sidebar: { width: '400px', maxWidth: '100vw', padding: '20px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fafafa', boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  langSwitcher: { display: 'flex', gap: '4px' },
  langBtn: { padding: '4px 6px', fontSize: '10px', cursor: 'pointer', background: '#fff', border: '1px solid #ccc', borderRadius: '4px' },
  searchBox: { display: 'flex', gap: '5px', marginBottom: '15px' },
  searchInput: { flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px', background: '#fff' },
  userBox: { marginBottom: '15px', padding: '10px', background: '#fff', borderRadius: '8px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  emailText: { fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' },
  filterButtons: { display: 'flex', gap: '8px', marginBottom: '15px' },
  filterBtn: { flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', fontSize: '11px', background: '#fff' },
  addBtn: { padding: '12px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', marginBottom: '15px', cursor: 'pointer' },
  list: { overflowY: 'auto', flex: 1, paddingRight: '5px' },
  card: { padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '2px solid #eee', cursor: 'pointer', background: '#fff', boxSizing: 'border-box' },
  tripTitle: { fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' },
  tripDetails: { fontSize: '11px', color: '#666', marginBottom: '6px' },
  price: { fontSize: '16px', color: '#2ecc71', fontWeight: 'bold' },
  bookBtn: { padding: '6px 12px', background: '#f39c12', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '12px' },
  inlineForm: { marginTop: '10px', padding: '10px', background: '#f0f7ff', borderRadius: '8px', border: '1px solid #d0e7ff' },
  formInput: { width: '100%', padding: '6px', marginBottom: '5px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px', boxSizing: 'border-box' },
  submitBtn: { flex: 1, padding: '6px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { padding: '6px 10px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  regBadge: { background: '#ebf5ff', color: '#007bff', padding: '1px 4px', borderRadius: '3px', fontSize: '9px', fontWeight: 'bold', marginLeft: '5px' },
  smallCities: { fontWeight: 'normal', color: '#999', fontSize: '11px', marginLeft: '4px' },
  bookingsList: { marginTop: '8px', borderTop: '1px dashed #ddd', paddingTop: '8px' },
  bookingItem: { background: '#f9f9f9', padding: '6px', borderRadius: '5px', marginBottom: '5px', border: '1px solid #eee', cursor: 'default' },
  confirmBtn: { marginTop: '4px', padding: '6px', width: '100%', background: '#3498db', color: 'white', border: 'none', borderRadius: '3px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' },
  logoutBtn: { background: 'none', border: 'none', color: '#e74c3c', textDecoration: 'underline', cursor: 'pointer', fontSize: '11px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
};