import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function MyReservations() {

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await API.get("/reservations/");
      setReservations(res.data);
    } catch (err) {
      setError("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>

      <button onClick={() => navigate("/dashboard")}>← Back</button>

      <h1>My Reservations</h1>

      {loading && <p>Loading reservations...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && reservations.length === 0 && (
        <p>No reservations yet.</p>
      )}

      <div style={{ display: "grid", gap: "10px" }}>
        {reservations.map((res) => (
          <div
            key={res.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <h3>{res.room_name || `Room ${res.room}`}</h3>
            <p>Start: {new Date(res.start_time).toLocaleString()}</p>
            <p>End: {new Date(res.end_time).toLocaleString()}</p>
            <p>Status: {res.status}</p>
          </div>
        ))}
      </div>

    </div>
  );
}