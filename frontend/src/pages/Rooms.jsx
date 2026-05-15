import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const roomTypeColors = {
  default: { bg: "#E6F1FB", color: "#185FA5", icon: "ti-door" },
  lab:     { bg: "#E1F5EE", color: "#0F6E56", icon: "ti-microscope" },
  lecture: { bg: "#FAEEDA", color: "#854F0B", icon: "ti-presentation" },
  computer:{ bg: "#EEEDFE", color: "#534AB7", icon: "ti-device-desktop" },
};

function getRoomStyle(name = "") {
  const n = name.toLowerCase();
  if (n.includes("lab") && n.includes("comp")) return roomTypeColors.computer;
  if (n.includes("lab"))     return roomTypeColors.lab;
  if (n.includes("lecture")) return roomTypeColors.lecture;
  if (n.includes("computer"))return roomTypeColors.computer;
  return roomTypeColors.default;
}

export default function Rooms() {
  const [rooms, setRooms]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [startTime, setStartTime]       = useState("");
  const [endTime, setEndTime]           = useState("");
  const [message, setMessage]           = useState("");
  const [formError, setFormError]       = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [search, setSearch]             = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await API.get("/rooms/");
        setRooms(response.data);
      } catch {
        setError("Failed to load rooms.");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleRoomClick = (room) => {
    if (selectedRoom?.id === room.id) { setSelectedRoom(null); return; }
    setSelectedRoom(room);
    setStartTime(""); setEndTime(""); setMessage(""); setFormError("");
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    setMessage(""); setFormError(""); setSubmitting(true);
    try {
      await API.post("/reservations/", {
        room: selectedRoom.id,
        start_time: startTime,
        end_time: endTime,
      });
      setMessage("Reservation submitted successfully!");
      setStartTime(""); setEndTime("");
    } catch (err) {
      setFormError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = rooms.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.location?.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    border: "0.5px solid #e0e0da", borderRadius: 8,
    padding: "8px 10px", fontSize: 13, color: "#222",
    background: "#f5f5f3", outline: "none",
    fontFamily: "sans-serif",
  };

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#f5f5f3" }}>

      {/* ── Header ── */}
      <header style={{
        background: "#fff", borderBottom: "0.5px solid #e0e0da",
        padding: "0.85rem 1.5rem", display: "flex",
        alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: "#E6F1FB", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="ti ti-school" style={{ fontSize: 20, color: "#185FA5" }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>PUPSantaRosa</div>
            <div style={{ fontSize: 11, color: "#888" }}>Room Reservation System</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => navigate("/notifications")}
            style={{
              width: 36, height: 36, background: "#f5f5f3",
              border: "0.5px solid #e0e0da", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            <i className="ti ti-bell" style={{ fontSize: 18, color: "#666" }} />
          </button>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", background: "#E6F1FB",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 500, color: "#185FA5", cursor: "pointer",
          }}>
            US
          </div>
        </div>
      </header>

      <div style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>

        {/* ── Page title + back ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "0.5px solid #ccc",
              borderRadius: 8, padding: "6px 12px",
              fontSize: 12, color: "#666", cursor: "pointer",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f0f0ee"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
          >
            <i className="ti ti-arrow-left" /> Back
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>View Rooms</h1>
            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>Browse and reserve available spaces.</p>
          </div>
        </div>

        {/* ── Search bar ── */}
        <div style={{ position: "relative", marginBottom: "1.25rem" }}>
          <i className="ti ti-search" style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            fontSize: 15, color: "#aaa", pointerEvents: "none",
          }} />
          <input
            type="text"
            placeholder="Search by name or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 32 }}
          />
        </div>

        {/* ── Loading state ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "2rem", color: "#888", fontSize: 13 }}>
            <i className="ti ti-loader-2" style={{ fontSize: 22, display: "block", marginBottom: 6 }} />
            Loading rooms…
          </div>
        )}

        {/* ── Error state ── */}
        {error && (
          <div style={{
            background: "#FCEBEB", border: "0.5px solid #F7C1C1",
            borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#A32D2D",
            marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8,
          }}>
            <i className="ti ti-alert-circle" /> {error}
          </div>
        )}

        {/* ── Section label ── */}
        {!loading && !error && (
          <p style={{
            fontSize: 11, fontWeight: 500, color: "#888",
            textTransform: "uppercase", letterSpacing: "0.05em",
            margin: "0 0 10px",
          }}>
            {filtered.length} room{filtered.length !== 1 ? "s" : ""} available
          </p>
        )}

        {/* ── Room cards ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((room) => {
            const style = getRoomStyle(room.name);
            const isSelected = selectedRoom?.id === room.id;
            return (
              <div
                key={room.id}
                style={{
                  background: "#fff",
                  border: isSelected ? "1px solid #185FA5" : "0.5px solid #e0e0da",
                  borderRadius: 12,
                  overflow: "hidden",
                  transition: "border-color 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = "#bbb"; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = "#e0e0da"; }}
              >
                {/* Card header row */}
                <div
                  onClick={() => handleRoomClick(room)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "1rem 1.1rem" }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 8,
                    background: style.bg, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <i className={`ti ${style.icon}`} style={{ fontSize: 20, color: style.color }} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 2px" }}>{room.name}</p>
                    <p style={{ fontSize: 12, color: "#888", margin: 0, display: "flex", gap: 10 }}>
                      <span><i className="ti ti-map-pin" style={{ fontSize: 11 }} /> {room.location}</span>
                      <span><i className="ti ti-users" style={{ fontSize: 11 }} /> {room.capacity}</span>
                    </p>
                  </div>

                  <div style={{
                    fontSize: 11, padding: "3px 9px", borderRadius: 20,
                    background: "#E1F5EE", color: "#0F6E56", fontWeight: 500,
                  }}>
                    Available
                  </div>

                  <i
                    className={`ti ${isSelected ? "ti-chevron-up" : "ti-chevron-down"}`}
                    style={{ fontSize: 16, color: "#aaa", flexShrink: 0 }}
                  />
                </div>

                {/* ── Reservation form (expanded) ── */}
                {isSelected && (
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{
                      borderTop: "0.5px solid #e0e0da",
                      padding: "1.1rem 1.25rem",
                      background: "#fafaf8",
                    }}
                  >
                    <p style={{
                      fontSize: 11, fontWeight: 500, color: "#888",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                      margin: "0 0 12px",
                    }}>
                      Reserve this room
                    </p>

                    {message && (
                      <div style={{
                        background: "#E1F5EE", border: "0.5px solid #A8DECA",
                        borderRadius: 8, padding: "9px 12px", fontSize: 13,
                        color: "#0F6E56", marginBottom: 12,
                        display: "flex", alignItems: "center", gap: 8,
                      }}>
                        <i className="ti ti-circle-check" /> {message}
                      </div>
                    )}

                    {formError && (
                      <div style={{
                        background: "#FCEBEB", border: "0.5px solid #F7C1C1",
                        borderRadius: 8, padding: "9px 12px", fontSize: 13,
                        color: "#A32D2D", marginBottom: 12,
                        display: "flex", alignItems: "center", gap: 8,
                      }}>
                        <i className="ti ti-alert-circle" /> {formError}
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                      <div>
                        <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 5 }}>
                          Start time
                        </label>
                        <input
                          type="datetime-local"
                          value={startTime}
                          onChange={e => setStartTime(e.target.value)}
                          required
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 5 }}>
                          End time
                        </label>
                        <input
                          type="datetime-local"
                          value={endTime}
                          onChange={e => setEndTime(e.target.value)}
                          required
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={handleReserve}
                        disabled={submitting || !startTime || !endTime}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          background: "#185FA5", color: "#fff",
                          border: "none", borderRadius: 8,
                          padding: "8px 16px", fontSize: 13,
                          cursor: submitting || !startTime || !endTime ? "not-allowed" : "pointer",
                          opacity: submitting || !startTime || !endTime ? 0.6 : 1,
                          fontFamily: "sans-serif",
                        }}
                      >
                        <i className="ti ti-calendar-plus" />
                        {submitting ? "Submitting…" : "Reserve Room"}
                      </button>
                      <button
                        onClick={() => setSelectedRoom(null)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          background: "none", border: "0.5px solid #ccc",
                          borderRadius: 8, padding: "8px 14px",
                          fontSize: 13, color: "#666", cursor: "pointer",
                          fontFamily: "sans-serif",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#f0f0ee"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Empty state ── */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{
            background: "#fff", border: "0.5px solid #e0e0da",
            borderRadius: 12, padding: "2rem", textAlign: "center", color: "#888",
          }}>
            <i className="ti ti-building-off" style={{ fontSize: 28, display: "block", marginBottom: 8 }} />
            <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 4px", color: "#444" }}>No rooms found</p>
            <p style={{ fontSize: 12, margin: 0 }}>Try a different search term.</p>
          </div>
        )}

      </div>
    </div>
  );
}