import { useState } from 'react'
import { useTrips } from './features/trips/useTrips'
import { Sidebar } from './layouts/Sidebar'
import { MapView } from './features/map/MapView'
import AddTripForm from './features/trips/AddTripForm'
import { useAuth } from './features/auth/AuthContext' 
import Login from './features/auth/Login'
import L from 'leaflet' // Импортируем для расчета дистанции
import './App.css' // Не забудьте создать этот файл для мобильной адаптации

function App() {
  const { user } = useAuth(); 
  const { trips, loading, fetchTrips } = useTrips()

  const [selectedTrip, setSelectedTrip] = useState(null)
  const [mode, setMode] = useState("IDLE")
  
  // Состояние для хранения всех точек маршрута
  const [waypoints, setWaypoints] = useState([])

  if (!user) {
    return <Login />
  }

  // Функция для расчета общего расстояния маршрута через все точки
  const calculateDistance = (points) => {
    if (points.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = L.latLng(points[i].lat, points[i].lng);
      const p2 = L.latLng(points[i+1].lat, points[i+1].lng);
      total += p1.distanceTo(p2);
    }
    return (total / 1000).toFixed(1); // Дистанция в километрах
  }

  const distance = calculateDistance(waypoints);

  return (
    <div className="app-main" style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        trips={trips}
        selectedTrip={selectedTrip}
        onSelect={setSelectedTrip}
        loading={loading}
        fetchTrips={fetchTrips} 
        onAddTrip={() => {
          setSelectedTrip(null)
          setWaypoints([]) // Очистка при создании нового рейса
          setMode("ADDING_STOPS") // Включение режима выбора точек
        }}
      />

      <div className="map-wrapper" style={{ flex: 1, position: 'relative' }}>
        {/* Информационная панель при создании маршрута */}
        {mode !== "IDLE" && (
          <div className="overlay-info" style={styles.overlayInfo}>
             <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
               Точек выбрано: {waypoints.length}
             </div>
             
             {waypoints.length >= 2 && (
               <div style={{ fontWeight: 'bold', color: '#2ecc71', fontSize: '16px' }}>
                 Расстояние: {distance} км
               </div>
             )}
             
             <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
               Кликайте на карту, чтобы добавить остановку
             </div>
             
             <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
               <button 
                 onClick={() => setMode("READY")}
                 disabled={waypoints.length < 2}
                 style={{
                   ...styles.saveBtn,
                   opacity: waypoints.length < 2 ? 0.5 : 1,
                   cursor: waypoints.length < 2 ? 'not-allowed' : 'pointer'
                 }}
               >
                 Готово
               </button>
               <button 
                 onClick={() => { setMode("IDLE"); setWaypoints([]); }}
                 style={styles.cancelBtn}
               >
                 Отмена
               </button>
             </div>
          </div>
        )}

        <MapView
          selectedTrip={selectedTrip}
          mode={mode}
          waypoints={waypoints}
          setWaypoints={setWaypoints}
        />

        {/* Форма сохранения данных рейса */}
        {mode === "READY" && (
          <div className="add-trip-form-container">
            <AddTripForm
              waypoints={waypoints}
              distance={distance}
              onSaved={async () => {
                await fetchTrips()
                setMode("IDLE")
                setWaypoints([])
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
    overlayInfo: {
        position: 'absolute', 
        top: 20, 
        left: 20, 
        zIndex: 1000, 
        background: 'white', 
        padding: '15px', 
        borderRadius: '10px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        minWidth: '220px'
    },
    saveBtn: { 
        background: '#3498db', 
        color: 'white', 
        border: 'none', 
        padding: '8px 15px', 
        borderRadius: '5px', 
        fontWeight: 'bold'
    },
    cancelBtn: { 
        background: '#eee', 
        border: 'none', 
        padding: '8px 15px', 
        borderRadius: '5px', 
        cursor: 'pointer',
        color: '#333'
    }
}

export default App