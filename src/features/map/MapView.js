import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Исправление бага с иконками маркеров (стандарт в React + Leaflet)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Хук для исправления размера карты (решает проблему "серой" или невидимой карты)
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
}

function MapSelector({ mode, waypoints, setWaypoints }) {
  useMapEvents({
    click(e) {
      if (mode === "ADDING_STOPS") {
        setWaypoints([...waypoints, e.latlng]);
      }
    }
  });
  return null;
}

export function MapView({
  selectedTrip,
  mode,
  waypoints,
  setWaypoints
}) {
  return (
    <main style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        center={[50, 20]}
        zoom={5}
        style={{ height: '100%', width: '100%', position: 'absolute' }}
      >
        <MapResizer />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {mode === "ADDING_STOPS" && (
          <MapSelector
            mode={mode}
            waypoints={waypoints}
            setWaypoints={setWaypoints}
          />
        )}

        {/* Маркеры текущего процесса создания маршрута */}
        {waypoints.map((wp, idx) => (
          <Marker key={`new-${idx}`} position={[wp.lat, wp.lng]} />
        ))}

        {/* Линия текущего маршрута */}
        {waypoints.length >= 2 && (
          <Polyline
            positions={waypoints.map(wp => [wp.lat, wp.lng])}
            color="red"
            dashArray="5, 10"
          />
        )}

        {/* Просмотр существующего рейса из базы (waypoints — JSONB) */}
        {selectedTrip && mode === "IDLE" && selectedTrip.waypoints && (
          <>
            {selectedTrip.waypoints.map((wp, idx) => (
              <Marker key={`trip-${idx}`} position={[wp.lat, wp.lng]} />
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
  );
}