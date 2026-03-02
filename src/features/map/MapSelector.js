import { useMapEvents, Marker } from "react-leaflet";
import { useState } from "react";

export default function MapSelector({ mode, onSelect }) {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  useMapEvents({
    click(e) {
      if (mode === "SELECTING_FROM") {
        setFrom(e.latlng);
        onSelect("from", e.latlng);
      }

      if (mode === "SELECTING_TO") {
        setTo(e.latlng);
        onSelect("to", e.latlng);
      }
    },
  });

  return (
    <>
      {from && <Marker position={from} />}
      {to && <Marker position={to} />}
    </>
  );
}