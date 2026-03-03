import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../auth/AuthContext";

export default function AddTripForm({ waypoints, distance, onSaved }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [cityFrom, setCityFrom] = useState("");
  const [cityTo, setCityTo] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");
  
  // Новые поля
  const [carModel, setCarModel] = useState("");
  const [totalSeats, setTotalSeats] = useState(8);
  const [isRegular, setIsRegular] = useState(false);
  const [intermediateCities, setIntermediateCities] = useState("");

  const handleSubmit = async () => {
    if (waypoints.length < 2) {
      alert("Маршрут должен содержать минимум 2 точки");
      return;
    }
    setLoading(true);

    const { error } = await supabase.from("trips").insert([
      {
        user_id: user.id,
        from_city: cityFrom,
        to_city: cityTo,
        price: parseFloat(price) || 0,
        departure_date: date,
        waypoints: waypoints, 
        distance: parseFloat(distance),
        car_model: carModel,
        total_seats: parseInt(totalSeats),
        is_regular: isRegular,
        intermediate_cities: intermediateCities
      }
    ]);

    setLoading(false);
    if (error) alert(error.message);
    else onSaved();
  };

  return (
    <div className="add-trip-form-container" style={styles.container}>
      <h3 style={{marginTop: 0}}>Новый рейс</h3>
      
      <div style={styles.infoBox}>
        📏 Дистанция: <b>{distance} км</b>
      </div>

      <input placeholder="Город отправления" value={cityFrom} onChange={(e) => setCityFrom(e.target.value)} style={styles.input} />
      <input placeholder="Город прибытия" value={cityTo} onChange={(e) => setCityTo(e.target.value)} style={styles.input} />
      <input placeholder="Промежуточные города (через запятую)" value={intermediateCities} onChange={(e) => setIntermediateCities(e.target.value)} style={styles.input} />
      
      <input placeholder="Марка машины (напр. VW Crafter)" value={carModel} onChange={(e) => setCarModel(e.target.value)} style={styles.input} />
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input type="number" placeholder="Цена €" value={price} onChange={(e) => setPrice(e.target.value)} style={styles.input} />
        <input type="number" placeholder="Мест" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} style={styles.input} />
      </div>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={styles.input} />

      <label style={{ display: 'block', marginBottom: '15px', fontSize: '13px', cursor: 'pointer' }}>
        <input type="checkbox" checked={isRegular} onChange={(e) => setIsRegular(e.target.checked)} /> Регулярный рейс
      </label>

      <button onClick={handleSubmit} disabled={loading} style={styles.button}>
        {loading ? "Сохранение..." : "Опубликовать"}
      </button>
    </div>
  );
}

const styles = {
  container: { background: "white", padding: 20, borderRadius: 10, boxShadow: "0 4px 15px rgba(0,0,0,0.2)", width: 300 },
  input: { width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ddd", boxSizing: "border-box" },
  button: { width: "100%", padding: "12px", background: "#2ecc71", color: "white", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" },
  infoBox: { padding: "10px", background: "#f0f7ff", borderRadius: "5px", marginBottom: "15px", fontSize: "13px" }
};