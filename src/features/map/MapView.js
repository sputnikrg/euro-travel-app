import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function MapSelector({ mode, setMode, setFrom, setTo }) {
  useMapEvents({
    click(e) {
      if (mode === "SELECTING_FROM") {
        setFrom(e.latlng)
        setMode("SELECTING_TO")
      } else if (mode === "SELECTING_TO") {
        setTo(e.latlng)
        setMode("READY")
      }
    }
  })

  return null
}

export function MapView({
  selectedTrip,
  mode,
  setMode,
  from,
  to,
  setFrom,
  setTo
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

        {/* Режим добавления */}
        {mode !== "IDLE" && (
          <MapSelector
            mode={mode}
            setMode={setMode}
            setFrom={setFrom}
            setTo={setTo}
          />
        )}

        {/* ВЫБРАННЫЕ ТОЧКИ ПРИ ДОБАВЛЕНИИ */}
        {from && <Marker position={[from.lat, from.lng]} />}
        {to && <Marker position={[to.lat, to.lng]} />}

        {from && to && (
          <Polyline
            positions={[
              [from.lat, from.lng],
              [to.lat, to.lng]
            ]}
            color="red"
          />
        )}

        {/* ПРОСМОТР СУЩЕСТВУЮЩЕГО РЕЙСА */}
        {selectedTrip && mode === "IDLE" && (
          <>
            <Marker position={[selectedTrip.start_lat, selectedTrip.start_lng]} />
            <Marker position={[selectedTrip.end_lat, selectedTrip.end_lng]} />
            <Polyline
              positions={[
                [selectedTrip.start_lat, selectedTrip.start_lng],
                [selectedTrip.end_lat, selectedTrip.end_lng]
              ]}
              color="#3498db"
            />
          </>
        )}

      </MapContainer>
    </main>
  )
}