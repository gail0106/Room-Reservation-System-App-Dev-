import { useEffect, useState, useCallback } from "react";
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

  const fetchRooms = useCallback(async () => {
    try {
      const response = await API.get("/rooms/");
      const data = response.data?.data ?? response.data ?? [];
      setRooms(data);
    } catch {
      setError("Failed to load rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(() => { fetchRooms(); }, 30000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

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
      fetchRooms();
    } catch (err) {
      setFormError(
        err.response?.data?.error ??
          err.response?.data?.detail ??
          "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isOccupied = (room) => room.status === "occupied";

  const badgeStyles = (room) => ({
    fontSize: 11,
    fontWeight: 500,
    padding: "3px 8px",
    borderRadius: 20,
    background: isOccupied(room) ? "#F5E8E8" : "#EDFAF3",
    color: isOccupied(room) ? "#8B0000" : "#1E7D4B",
    border: `0.5px solid ${isOccupied(room) ? "#D9A0A0" : "#A8DFC1"}`,
  });

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", minHeight: "100vh", background: "#F7F3EE" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'); * { font-family: 'Poppins', sans-serif; }`}</style>

      {/* Header */}
      <header style={{
        background: "#8B0000",
        borderBottom: "3px solid #C9991A",
        padding: "0.85rem 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: "#C9991A",
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="ti ti-school" style={{ fontSize: 20, color: "#FFFFFF" }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF" }}>PUPSantaRosa</div>
            <div style={{ fontSize: 11, color: "#F5D98A" }}>Room Reservation System</div>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.12)",
            border: "0.5px solid rgba(201,153,26,0.5)",
            borderRadius: 8, padding: "6px 12px",
            fontSize: 13, color: "#FFFFFF", cursor: "pointer",
            fontFamily: "'Poppins', sans-serif", fontWeight: 500,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#C9991A"; e.currentTarget.style.borderColor = "#C9991A"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(201,153,26,0.5)"; }}
        >
          <i className="ti ti-arrow-left" /> Dashboard
        </button>
      </header>

      {/* Page body */}
      <div style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 2px", color: "#5A0000" }}>
            Available Rooms
          </h1>
          <p style={{ fontSize: 13, color: "#7A6030", margin: 0 }}>
            Click a room to make a reservation.
          </p>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: "grid", gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: "#EDE4D4", border: "0.5px solid #D9C9A0",
                borderRadius: 12, padding: "1rem", height: 80,
              }} />
            ))}
          </div>
        )}

        {/* Fetch error */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#F5E8E8", border: "0.5px solid #D9A0A0",
            borderRadius: 8, padding: "10px 14px",
          }}>
            <i className="ti ti-alert-circle" style={{ color: "#8B0000" }} />
            <span style={{ fontSize: 13, color: "#8B0000" }}>{error}</span>
          </div>
        )}

        {/* Room list */}
        <div style={{ display: "grid", gap: 10 }}>
          {rooms.map(room => {
            const isSelected = selectedRoom?.id === room.id;

            return (
              <div key={room.id} style={{
                background: "#FFFFFF",
                border: `0.5px solid ${isSelected ? "#8B0000" : "#D9C9A0"}`,
                borderLeft: isSelected ? "3px solid #C9991A" : "3px solid transparent",
                borderRadius: 12, overflow: "hidden",
                transition: "border-color 0.15s, box-shadow 0.15s",
                boxShadow: isSelected ? "0 2px 8px rgba(139,0,0,0.10)" : "none",
              }}>
                {/* Room row (clickable) */}
                <div
                  onClick={() => handleRoomClick(room)}
                  style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem 1.25rem", cursor: "pointer",
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.parentElement.style.borderColor = "#C9991A";
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.parentElement.style.borderColor = "#D9C9A0";
                  }}
                >
                  {/* Room info */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 38, height: 38,
                      background: isOccupied(room) ? "#F5E8E8" : "#EDFAF3",
                      borderRadius: 8,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <i className="ti ti-door" style={{ 
                        fontSize: 20, 
                        color: isOccupied(room) ? "#8B0000" : "#1E7D4B" 
                      }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 2px", color: "#1A5CA8" }}>
                        {room.name}
                      </p>
                      <p style={{ fontSize: 12, color: "#7A6030", margin: 0 }}>
                        <i className="ti ti-users" style={{ fontSize: 11, marginRight: 4 }} />
                        Capacity: {room.capacity}
                        {room.location && (
                          <> &nbsp;·&nbsp; <i className="ti ti-map-pin" style={{ fontSize: 11, marginRight: 4 }} />{room.location}</>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Status badge + chevron */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={badgeStyles(room)}>
                      {isOccupied(room) ? "Occupied" : "Available"}
                    </span>
                    <i
                      className={`ti ${isSelected ? "ti-chevron-up" : "ti-chevron-down"}`}
                      style={{ fontSize: 16, color: "#C9991A" }}
                    />
                  </div>
                </div>

                {/* Inline reservation form */}
                {isSelected && (
                  <div style={{
                    borderTop: "0.5px solid #EDE4D4",
                    padding: "1rem 1.25rem",
                    background: "#FFFDF5",
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 12px", color: "#5A0000" }}>
                      Reserve — {room.name}
                    </p>

                    {/* Success message */}
                    {message && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: "#EDFAF3", border: "0.5px solid #A8DFC1",
                        borderRadius: 8, padding: "8px 12px", marginBottom: 12,
                      }}>
                        <i className="ti ti-circle-check" style={{ color: "#1E7D4B" }} />
                        <span style={{ fontSize: 12, color: "#1E7D4B" }}>{message}</span>
                      </div>
                    )}

                    {/* Form error */}
                    {formError && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: "#F5E8E8", border: "0.5px solid #D9A0A0",
                        borderRadius: 8, padding: "8px 12px", marginBottom: 12,
                      }}>
                        <i className="ti ti-alert-circle" style={{ color: "#8B0000" }} />
                        <span style={{ fontSize: 12, color: "#8B0000" }}>{formError}</span>
                      </div>
                    )}

                    <form onSubmit={handleReserve}>
                      <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr",
                        gap: 10, marginBottom: 12,
                      }}>
                        {/* Start Time */}
                        <div>
                          <label style={{
                            display: "block", fontSize: 12, fontWeight: 500,
                            color: "#5A0000", marginBottom: 5,
                          }}>
                            Start Time
                          </label>
                          <input
                            type="datetime-local"
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
                            required
                            style={{
                              width: "100%", padding: "7px 10px", fontSize: 13,
                              border: "0.5px solid #D9C9A0", borderRadius: 8,
                              outline: "none", boxSizing: "border-box",
                              background: "#FFFFFF", color: "#3A2000",
                              fontFamily: "'Poppins', sans-serif",
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = "#C9991A"}
                            onBlur={e => e.currentTarget.style.borderColor = "#D9C9A0"}
                          />
                        </div>
                        {/* End Time */}
                        <div>
                          <label style={{
                            display: "block", fontSize: 12, fontWeight: 500,
                            color: "#5A0000", marginBottom: 5,
                          }}>
                            End Time
                          </label>
                          <input
                            type="datetime-local"
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                            required
                            style={{
                              width: "100%", padding: "7px 10px", fontSize: 13,
                              border: "0.5px solid #D9C9A0", borderRadius: 8,
                              outline: "none", boxSizing: "border-box",
                              background: "#FFFFFF", color: "#3A2000",
                              fontFamily: "'Poppins', sans-serif",
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = "#C9991A"}
                            onBlur={e => e.currentTarget.style.borderColor = "#D9C9A0"}
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="submit"
                          disabled={submitting}
                          style={{
                            padding: "8px 16px",
                            background: submitting ? "#C9991A99" : "#8B0000",
                            color: "#FFFFFF",
                            border: "none", borderRadius: 8,
                            fontSize: 13, fontWeight: 600,
                            cursor: submitting ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", gap: 6,
                            fontFamily: "'Poppins', sans-serif",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#C9991A"; }}
                          onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = "#8B0000"; }}
                        >
                          <i className="ti ti-calendar-plus" />
                          {submitting ? "Submitting..." : "Reserve Room"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedRoom(null)}
                          style={{
                            padding: "8px 14px", background: "none",
                            border: "0.5px solid #D9C9A0", borderRadius: 8,
                            fontSize: 13, color: "#8B0000", cursor: "pointer",
                            fontFamily: "'Poppins', sans-serif", fontWeight: 500,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#F5E8E8"; e.currentTarget.style.borderColor = "#D9A0A0"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "#D9C9A0"; }}
                        >
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

        {/* Empty state */}
        {!loading && rooms.length === 0 && !error && (
          <div style={{
            textAlign: "center", padding: "3rem 1rem",
            color: "#B0A080", fontSize: 13,
          }}>
            <i className="ti ti-building-off" style={{ fontSize: 32, display: "block", marginBottom: 8, color: "#C9991A" }} />
            No rooms available right now.
          </div>
        )}
      </div>
    </div>
  );
}