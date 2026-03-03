import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../auth/AuthContext";

export default function AddTripForm({ waypoints, distance, onSaved }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Дополнительные поля для описания рейса
  const [cityFrom, setCityFrom] = useState("");
  const [cityTo, setCityTo] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = async () => {
    if (waypoints.length < 2) {
      alert("Маршрут должен содержать минимум 2 точки");
      return;
    }

    setLoading(true);

    // Подготовка данных для отправки
    const { error } = await supabase.from("trips").insert([
      {
        user_id: user.id,
        from_city: cityFrom,
        to_city: cityTo,
        price: parseFloat(price) || 0,
        departure_date: date,
        // Сохраняем массив точек в колонку JSONB
        waypoints: waypoints, 
        // Сохраняем общую дистанцию
        distance: parseFloat(distance),
        // Сохраняем координаты начала и конца отдельно для быстрой выборки (по желанию)
        start_lat: waypoints[0].lat,
        start_lng: waypoints[0].lng,
        end_lat: waypoints[waypoints.length - 1].lat,
        end_lng: waypoints[waypoints.length - 1].lng
      }
    ]);

    setLoading(false);

    if (error) {
      alert("Ошибка базы данных: " + error.message);
    } else {
      onSaved();
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={{ marginTop: 0 }}>Данные маршрута</h3>
      
      <div style={styles.infoBox}>
        <div>🛣 Дистанция: <b>{distance} км</b></div>
        <div>📍 Остановок: <b>{waypoints.length}</b></div>
      </div>

      <input
        placeholder="Город отправления"
        value={cityFrom}
        onChange={(e) => setCityFrom(e.target.value)}
        style={styles.input}
      />

      <input
        placeholder="Город прибытия"
        value={cityTo}
        onChange={(e) => setCityTo(e.target.value)}
        style={styles.input}
      />

      <input
        type="number"
        placeholder="Цена (€)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        style={styles.input}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={styles.input}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={styles.button}
      >
        {loading ? "Сохранение..." : "Опубликовать маршрут"}
      </button>
    </div>
  );
}

const styles = {
  container: {
    position: "absolute", right: 20, top: 20, background: "white",
    padding: 20, borderRadius: 10, boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    zIndex: 1000, width: 300
  },
  infoBox: {
    padding: "10px", background: "#f0f7ff", borderRadius: "6px",
    marginBottom: "15px", fontSize: "14px", color: "#2c3e50"
  },
  input: {
    width: "100%", padding: "10px", marginBottom: "10px",
    borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box"
  },
  button: {
    width: "100%", padding: "12px", borderRadius: "6px", border: "none",
    background: "#2ecc71", color: "white", fontWeight: "bold", cursor: "pointer"
  }
};