import { useState } from 'react'
import { useTrips } from './features/trips/useTrips'
import { Sidebar } from './layouts/Sidebar'
import { MapView } from './features/map/MapView'
import AddTripForm from './features/trips/AddTripForm'
import { useAuth } from './features/auth/AuthContext' 
import Login from './features/auth/Login'
import L from 'leaflet' // Импортируем для расчета дистанции

function App() {
  const { user } = useAuth(); 
  const { trips, loading, fetchTrips } = useTrips()

  const [selectedTrip, setSelectedTrip] = useState(null)
  const [mode, setMode] = useState("IDLE")
  
  // Теперь храним все точки в одном массиве
  const [waypoints, setWaypoints] = useState([])

  if (!user) {
    return <Login />
  }

  // Функция для расчета общего расстояния маршрута
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
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        trips={trips}
        selectedTrip={selectedTrip}
        onSelect={setSelectedTrip}
        loading={loading}
        fetchTrips={fetchTrips} 
        onAddTrip={() => {
          setSelectedTrip(null)
          setWaypoints([]) // Сбрасываем старые точки
          setMode("ADDING_STOPS") // Новый режим для нескольких точек
        }}
      />

      {mode !== "IDLE" && (
        <div style={styles.overlayInfo}>
           <div>Точек выбрано: {waypoints.length}</div>
           {waypoints.length >= 2 && (
             <div style={{ fontWeight: 'bold', color: '#2ecc71' }}>
               Расстояние: {distance} км
             </div>
           )}
           <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
             Кликайте на карту, чтобы добавить остановку
           </div>
           
           <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
             <button 
               onClick={() => setMode("READY")}
               disabled={waypoints.length < 2}
               style={styles.saveBtn}
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

      {mode === "READY" && (
        <AddTripForm
          waypoints={waypoints} // Передаем весь массив
          distance={distance}   // Передаем посчитанное расстояние
          onSaved={async () => {
            await fetchTrips()
            setMode("IDLE")
            setWaypoints([])
          }}
        />
      )}
    </div>
  )
}

const styles = {
    overlayInfo: {
        position: 'absolute', top: 20, left: 420, zIndex: 1000, 
        background: 'white', padding: 15, borderRadius: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        minWidth: '200px'
    },
    saveBtn: { background: '#3498db', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' },
    cancelBtn: { background: '#eee', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }
}

export default App