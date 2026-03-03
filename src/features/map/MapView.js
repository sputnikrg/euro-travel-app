import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function MapSelector({ mode, waypoints, setWaypoints }) {
  useMapEvents({
    click(e) {
      if (mode === "ADDING_STOPS") {
        // Добавляем новую координату в массив
        setWaypoints([...waypoints, e.latlng])
      }
    }
  })
  return null
}

export function MapView({
  selectedTrip,
  mode,
  waypoints,
  setWaypoints
}) {
  return (
    <main style={{ flex: 1 }}>
      <MapContainer
        center={[50, 20]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mode === "ADDING_STOPS" && (
          <MapSelector
            mode={mode}
            waypoints={waypoints}
            setWaypoints={setWaypoints}
          />
        )}

        {/* Отрисовка маркеров для создаваемого рейса */}
        {waypoints.map((wp, idx) => (
          <Marker key={idx} position={[wp.lat, wp.lng]} />
        ))}

        {/* Отрисовка линии через все выбранные точки */}
        {waypoints.length >= 2 && (
          <Polyline
            positions={waypoints.map(wp => [wp.lat, wp.lng])}
            color="red"
            dashArray="5, 10" // Пунктирная линия для процесса создания
          />
        )}

        {/* ПРОСМОТР СУЩЕСТВУЮЩЕГО РЕЙСА (если в базе уже есть массив) */}
        {selectedTrip && mode === "IDLE" && selectedTrip.waypoints && (
          <>
            {selectedTrip.waypoints.map((wp, idx) => (
              <Marker key={idx} position={[wp.lat, wp.lng]} />
            ))}
            <Polyline
              positions={selectedTrip.waypoints.map(wp => [wp.lat, wp.lng])}
              color="#3498db"
              weight={4}
            />
          </>
        )}
      </MapContainer>
    </main>
  )
}