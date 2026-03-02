import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function AddTripForm({ from, to, onSaved }) {
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");
  const [cityFrom, setCityFrom] = useState("");
  const [cityTo, setCityTo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!from || !to) {
      alert("Select points first");
      return;
    }

    setLoading(true);

    // Получаем текущего пользователя
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("User not authenticated");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("trips").insert([
      {
        user_id: user.id,
        from_city: cityFrom,
        to_city: cityTo,
        price,
        departure_date: date,
        start_lat: from.lat,
        start_lng: from.lng,
        end_lat: to.lat,
        end_lng: to.lng
      }
    ]);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    onSaved();
  };

  return (
    <div
      style={{
        position: "absolute",
        right: 20,
        top: 20,
        background: "white",
        padding: 20,
        borderRadius: 10,
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        zIndex: 1000,
        width: 300
      }}
    >
      <h3>Add Trip</h3>

      <input
        placeholder="From city"
        value={cityFrom}
        onChange={(e) => setCityFrom(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        placeholder="To city"
        value={cityTo}
        onChange={(e) => setCityTo(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ width: "100%", marginBottom: 15 }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 6,
          border: "none",
          background: "#3498db",
          color: "white",
          cursor: "pointer"
        }}
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}