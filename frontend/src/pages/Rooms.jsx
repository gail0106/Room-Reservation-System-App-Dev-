import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Rooms() {

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await API.get("/rooms/");
        setRooms(response.data);
      } catch (err) {
        setError("Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setStartTime("");
    setEndTime("");
    setMessage("");
    setFormError("");
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    setMessage("");
    setFormError("");

    try {
      await API.post("/reservations/", {
        room: selectedRoom.id,
        start_time: startTime,
        end_time: endTime,
      });
      setMessage("Reservation submitted successfully!");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      setFormError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div style={{ padding: "20px" }}>

      <button onClick={() => navigate("/dashboard")}>← Back</button>

      <h1>Rooms</h1>

      {loading && <p>Loading rooms...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "grid", gap: "10px" }}>
        {rooms.map((room) => (
          <div
            key={room.id}
            onClick={() => handleRoomClick(room)}
            style={{
              border: selectedRoom?.id === room.id ? "2px solid blue" : "1px solid #ccc",
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <h3>{room.name}</h3>
            <p>Capacity: {room.capacity}</p>
            <p>Location: {room.location}</p>

            {/* RESERVATION FORM — shown only for selected room */}
            {selectedRoom?.id === room.id && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ marginTop: "10px", borderTop: "1px solid #eee", paddingTop: "10px" }}
              >
                <h4>Reserve this Room</h4>

                {message && <p style={{ color: "green" }}>{message}</p>}
                {formError && <p style={{ color: "red" }}>{formError}</p>}

                <form onSubmit={handleReserve}>

                  <label htmlFor="startTime">Start Time:</label>
                  <br />
                  <input
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />

                  <br /><br />

                  <label htmlFor="endTime">End Time:</label>
                  <br />
                  <input
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />

                  <br /><br />

                  <button type="submit">Reserve Room</button>
                  <button
                    type="button"
                    onClick={() => setSelectedRoom(null)}
                    style={{ marginLeft: "10px" }}
                  >
                    Cancel
                  </button>

                </form>
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}