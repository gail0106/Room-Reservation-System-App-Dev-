import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Rooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await API.get("/rooms/");
        const data = response.data?.data ?? response.data ?? [];
        setRooms(data);
      } catch {
        setError("Failed to load rooms. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleRoomClick = (room) => {
    if (selectedRoom?.id === room.id) {
      setSelectedRoom(null);
      return;
    }
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
    setSubmitting(true);
    try {
      await API.post("/reservations/", {
        room: selectedRoom.id,
        start_time: startTime,
        end_time: endTime,
      });
      setMessage("Reservation submitted! Waiting for approval.");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      setFormError(err.response?.data?.error ?? err.response?.data?.detail ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#f5f5f3" }}>
      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "0.5px solid #e0e0da", padding: "0.85rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "#E6F1FB", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-school" style={{ fontSize: 20, color: "#185FA5" }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>PUPSantaRosa</div>
            <div style={{ fontSize: 11, color: "#888" }}>Room Reservation System</div>
          </div>
        </div>
        <button onClick={() => navigate("/dashboard")}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "0.5px solid #e0e0da", borderRadius: 8, padding: "6px 12px", fontSize: 13, color: "#666", cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#bbb"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#e0e0da"}
        >
          <i className="ti ti-arrow-left" /> Dashboard
        </button>
      </header>

      <div style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 2px" }}>Available Rooms</h1>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>Click a room to make a reservation.</p>
        </div>

        {loading && (
          <div style={{ display: "grid", gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: "#fff", border: "0.5px solid #e0e0da", borderRadius: 12, padding: "1rem", height: 80 }} />
            ))}
          </div>
        )}

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FCEBEB", border: "0.5px solid #F7C1C1", borderRadius: 8, padding: "10px 14px" }}>
            <i className="ti ti-alert-circle" style={{ color: "#A32D2D" }} />
            <span style={{ fontSize: 13, color: "#A32D2D" }}>{error}</span>
          </div>
        )}

        <div style={{ display: "grid", gap: 10 }}>
          {rooms.map((room) => {
            const isSelected = selectedRoom?.id === room.id;
            return (
              <div key={room.id}
                style={{ background: "#fff", border: `0.5px solid ${isSelected ? "#185FA5" : "#e0e0da"}`, borderRadius: 12, overflow: "hidden", transition: "border-color 0.15s" }}
              >
                {/* Room row */}
                <div onClick={() => handleRoomClick(room)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", cursor: "pointer" }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.parentElement.style.borderColor = "#bbb"; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.parentElement.style.borderColor = "#e0e0da"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, background: "#E6F1FB", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="ti ti-door" style={{ fontSize: 20, color: "#185FA5" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 2px" }}>{room.name}</p>
                      <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
                        <i className="ti ti-users" style={{ fontSize: 11, marginRight: 4 }} />Capacity: {room.capacity}
                        {room.location && <> &nbsp;·&nbsp; <i className="ti ti-map-pin" style={{ fontSize: 11, marginRight: 4 }} />{room.location}</>}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 20, background: room.is_available === false ? "#FFF4E5" : "#EDFAF3", color: room.is_available === false ? "#854F0B" : "#1E7D4B", border: `0.5px solid ${room.is_available === false ? "#F5D9A8" : "#A8DFC1"}` }}>
                      {room.is_available === false ? "Unavailable" : "Available"}
                    </span>
                    <i className={`ti ${isSelected ? "ti-chevron-up" : "ti-chevron-down"}`} style={{ fontSize: 16, color: "#aaa" }} />
                  </div>
                </div>

                {/* Reservation form */}
                {isSelected && (
                  <div style={{ borderTop: "0.5px solid #e0e0da", padding: "1rem 1.25rem", background: "#fafaf9" }}>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 12px" }}>Reserve — {room.name}</p>

                    {message && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#EDFAF3", border: "0.5px solid #A8DFC1", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
                        <i className="ti ti-circle-check" style={{ color: "#1E7D4B" }} />
                        <span style={{ fontSize: 12, color: "#1E7D4B" }}>{message}</span>
                      </div>
                    )}
                    {formError && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FCEBEB", border: "0.5px solid #F7C1C1", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
                        <i className="ti ti-alert-circle" style={{ color: "#A32D2D" }} />
                        <span style={{ fontSize: 12, color: "#A32D2D" }}>{formError}</span>
                      </div>
                    )}

                    <form onSubmit={handleReserve}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 5 }}>Start Time</label>
                          <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required
                            style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "0.5px solid #ccc", borderRadius: 8, outline: "none", boxSizing: "border-box", background: "#fff" }} />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 5 }}>End Time</label>
                          <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required
                            style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "0.5px solid #ccc", borderRadius: 8, outline: "none", boxSizing: "border-box", background: "#fff" }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button type="submit" disabled={submitting}
                          style={{ padding: "8px 16px", background: submitting ? "#85B7EB" : "#185FA5", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                          <i className="ti ti-calendar-plus" />
                          {submitting ? "Submitting..." : "Reserve Room"}
                        </button>
                        <button type="button" onClick={() => setSelectedRoom(null)}
                          style={{ padding: "8px 14px", background: "none", border: "0.5px solid #ccc", borderRadius: 8, fontSize: 13, color: "#666", cursor: "pointer" }}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!loading && rooms.length === 0 && !error && (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#aaa", fontSize: 13 }}>
            <i className="ti ti-building-off" style={{ fontSize: 32, display: "block", marginBottom: 8 }} />
            No rooms available right now.
          </div>
        )}
      </div>
    </div>
  );
}
