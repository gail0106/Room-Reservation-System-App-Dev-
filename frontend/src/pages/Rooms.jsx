import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";

export default function Rooms() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [rooms, setRooms]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [startTime, setStartTime]       = useState("");
  const [endTime, setEndTime]           = useState("");
  const [purpose, setPurpose]           = useState("");
  const [message, setMessage]           = useState("");
  const [formError, setFormError]       = useState("");
  const [submitting, setSubmitting]     = useState(false);

  // ── Search state — initialized from URL params (voice search) ────────────
  const [searchName,     setSearchName]     = useState(searchParams.get("room")      ?? "");
  const [searchCapacity, setSearchCapacity] = useState(searchParams.get("capacity")  ?? "");
  const [searchLocation, setSearchLocation] = useState(searchParams.get("location")  ?? "");
  const isVoiceSearch = searchParams.get("room") || searchParams.get("capacity") || searchParams.get("location");

  // Sync search state when URL params change (e.g. from voice assistant)
  useEffect(() => {
    setSearchName(searchParams.get("room")      ?? "");
    setSearchCapacity(searchParams.get("capacity")  ?? "");
    setSearchLocation(searchParams.get("location")  ?? "");
  }, [searchParams]);

  // ── Real-time availability ────────────────────────────────────────────────
  const [availability, setAvailability] = useState(null);
  const debounceTimer = useRef(null);

  const getFloorNumber = (location = "") => {
    const match = location.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 999;
  };

  const fetchRooms = useCallback(async () => {
    try {
      const response = await API.get("/rooms/");
      const data = response.data?.data ?? response.data ?? [];
      const sorted = [...data].sort((a, b) =>
        getFloorNumber(a.location) - getFloorNumber(b.location)
      );
      setRooms(sorted);
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

  // ── Real-time availability check ──────────────────────────────────────────
  useEffect(() => {
    if (!selectedRoom || !startTime || !endTime) { setAvailability(null); return; }
    const start = new Date(startTime);
    const end   = new Date(endTime);
    if (end <= start) { setAvailability(null); return; }

    setAvailability("checking");
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        const toISO = (val) => {
          const date   = new Date(val);
          const offset = -date.getTimezoneOffset();
          const sign   = offset >= 0 ? "+" : "-";
          const pad    = (n) => String(Math.floor(Math.abs(n))).padStart(2, "0");
          return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00${sign}${pad(offset/60)}:${pad(offset%60)}`;
        };
        const res      = await API.get("/reservations/", {
          params: { room: selectedRoom.id, start_time: toISO(startTime), end_time: toISO(endTime) }
        });
        const existing = res.data?.data ?? res.data ?? [];
        const s        = new Date(startTime);
        const e        = new Date(endTime);
        const conflict = existing.some(r => {
          if (r.room !== selectedRoom.id && r.room_id !== selectedRoom.id) return false;
          if (["cancelled", "rejected"].includes(r.status)) return false;
          const rStart = new Date(r.start_time);
          const rEnd   = new Date(r.end_time);
          return s < rEnd && e > rStart;
        });
        setAvailability(conflict ? "unavailable" : "available");
      } catch {
        setAvailability(null);
      }
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [startTime, endTime, selectedRoom]);

  const handleRoomClick = (room) => {
    if (selectedRoom?.id === room.id) { setSelectedRoom(null); setAvailability(null); return; }
    setSelectedRoom(room);
    setStartTime(""); setEndTime(""); setPurpose("");
    setMessage(""); setFormError(""); setAvailability(null);
  };

  const HOUR_MIN = 6;
  const HOUR_MAX = 22;

  const isWithinAllowedHours = (datetimeStr) => {
    if (!datetimeStr) return true;
    const d = new Date(datetimeStr);
    const h = d.getHours();
    return (h >= HOUR_MIN) && (h < HOUR_MAX);
  };

  const toLocalInputStr = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const todayAt = (hour, minute = 0) => {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return toLocalInputStr(d);
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    setMessage(""); setFormError("");
    if (!isWithinAllowedHours(startTime)) { setFormError("Start time must be between 6:00 AM and 10:00 PM."); return; }
    if (!isWithinAllowedHours(endTime))   { setFormError("End time must be between 6:00 AM and 10:00 PM."); return; }
    setSubmitting(true);
    try {
      const toISO = (val) => {
        const date   = new Date(val);
        const offset = -date.getTimezoneOffset();
        const sign   = offset >= 0 ? "+" : "-";
        const pad    = (n) => String(Math.floor(Math.abs(n))).padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00${sign}${pad(offset/60)}:${pad(offset%60)}`;
      };
      await API.post("/reservations/", {
        room:       selectedRoom.id,
        start_time: toISO(startTime),
        end_time:   toISO(endTime),
        purpose:    purpose.trim(),
      });
      setMessage("Reservation submitted! Waiting for approval.");
      setStartTime(""); setEndTime(""); setPurpose(""); setAvailability(null);
      fetchRooms();
    } catch (err) {
      setFormError(err.response?.data?.error ?? err.response?.data?.detail ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const clearSearch = () => {
    setSearchName(""); setSearchCapacity(""); setSearchLocation("");
    setSearchParams({});
  };

  // ── Filter rooms based on search state ───────────────────────────────────
  const filteredRooms = rooms.filter((r) => {
    const matchName     = searchName
      ? r.name.toLowerCase().includes(searchName.toLowerCase())
      : true;
    const matchCapacity = searchCapacity
      ? r.capacity >= parseInt(searchCapacity, 10)
      : true;
    const matchLocation = searchLocation
      ? r.location.toLowerCase().includes(searchLocation.toLowerCase())
      : true;
    return matchName && matchCapacity && matchLocation;
  });

  const groupedRooms = filteredRooms.reduce((acc, room) => {
    const floor = room.location || "Other";
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});

  const availabilityBadge = {
    checking:    { bg: "#F0EFFF", color: "#5A52A8", border: "#C0BDEF", icon: "ti-loader-2",    label: "Checking..." },
    available:   { bg: "#EDFAF3", color: "#1E7D4B", border: "#A8DFC1", icon: "ti-circle-check", label: "Available for this slot" },
    unavailable: { bg: "#FCEBEB", color: "#A32D2D", border: "#F7C1C1", icon: "ti-circle-x",    label: "Not available for this slot" },
  };

  const inputStyle = {
    width: "100%", padding: "7px 10px 7px 32px", fontSize: 13,
    border: "0.5px solid #D9C9A0", borderRadius: 8, outline: "none",
    boxSizing: "border-box", background: "#FFFFFF", color: "#3A2000",
    fontFamily: "'Poppins', sans-serif",
  };

  const hasSearch = searchName || searchCapacity || searchLocation;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", minHeight: "100vh", background: "#F7F3EE" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        * { font-family: 'Poppins', sans-serif; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; display: inline-block; }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        background: "#8B0000", borderBottom: "3px solid #C9991A",
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

      {/* ── Page body ── */}
      <div style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>

        <div style={{ marginBottom: "1rem" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 2px", color: "#5A0000" }}>
            Available Rooms
          </h1>
          <p style={{ fontSize: 13, color: "#7A6030", margin: 0 }}>
            Click a room to make a reservation.
          </p>
        </div>

        {/* ── Search bar ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8, marginBottom: 10,
        }}>
          {/* Room name */}
          <div style={{ position: "relative" }}>
            <i className="ti ti-search" style={{
              position: "absolute", left: 10, top: "50%",
              transform: "translateY(-50%)", fontSize: 14, color: "#B0A080",
            }} />
            <input
              type="text"
              placeholder="Search room name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = "#C9991A"}
              onBlur={e  => e.currentTarget.style.borderColor = "#D9C9A0"}
            />
          </div>

          {/* Min capacity */}
          <div style={{ position: "relative" }}>
            <i className="ti ti-users" style={{
              position: "absolute", left: 10, top: "50%",
              transform: "translateY(-50%)", fontSize: 14, color: "#B0A080",
            }} />
            <input
              type="number"
              placeholder="Min capacity..."
              value={searchCapacity}
              onChange={(e) => setSearchCapacity(e.target.value)}
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = "#C9991A"}
              onBlur={e  => e.currentTarget.style.borderColor = "#D9C9A0"}
            />
          </div>

          {/* Floor / location */}
          <div style={{ position: "relative" }}>
            <i className="ti ti-building" style={{
              position: "absolute", left: 10, top: "50%",
              transform: "translateY(-50%)", fontSize: 14, color: "#B0A080",
            }} />
            <input
              type="text"
              placeholder="Floor... e.g. 2nd Floor"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = "#C9991A"}
              onBlur={e  => e.currentTarget.style.borderColor = "#D9C9A0"}
            />
          </div>
        </div>

        {/* ── Active filter row ── */}
        {hasSearch && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: 12,
          }}>
            {/* Voice badge */}
            {isVoiceSearch && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#FDF0CC", border: "0.5px solid #D9C070",
                borderRadius: 8, padding: "5px 10px",
                fontSize: 12, color: "#7A6030",
              }}>
                <i className="ti ti-microphone" style={{ fontSize: 13, color: "#C9991A" }} />
                Voice search active
              </div>
            )}

            {/* Result count */}
            <span style={{ fontSize: 12, color: "#B0A080" }}>
              {filteredRooms.length} room{filteredRooms.length !== 1 ? "s" : ""} found
            </span>

            {/* Clear */}
            <button
              onClick={clearSearch}
              style={{
                marginLeft: "auto",
                display: "flex", alignItems: "center", gap: 4,
                background: "#F5E8E8", border: "0.5px solid #D9A0A0",
                borderRadius: 8, padding: "5px 12px",
                fontSize: 12, color: "#8B0000", cursor: "pointer",
                fontFamily: "'Poppins', sans-serif", fontWeight: 500,
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#EDD0D0"}
              onMouseLeave={e => e.currentTarget.style.background = "#F5E8E8"}
            >
              <i className="ti ti-x" style={{ fontSize: 12 }} /> Clear filters
            </button>
          </div>
        )}

        {/* ── Loading skeletons ── */}
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

        {/* ── Fetch error ── */}
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

        {/* ── Room list grouped by floor ── */}
        {!loading && Object.entries(groupedRooms).map(([floor, floorRooms]) => (
          <div key={floor} style={{ marginBottom: "1.5rem" }}>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6, background: "#8B0000",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <i className="ti ti-building" style={{ fontSize: 14, color: "#F5D98A" }} />
              </div>
              <p style={{
                fontSize: 11, fontWeight: 600, color: "#8B0000",
                textTransform: "uppercase", letterSpacing: "0.06em", margin: 0,
              }}>
                {floor}
              </p>
              <div style={{ flex: 1, height: "0.5px", background: "#D9C9A0" }} />
              <span style={{ fontSize: 11, color: "#B0A080" }}>
                {floorRooms.length} room{floorRooms.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {floorRooms.map(room => {
                const isSelected = selectedRoom?.id === room.id;
                const isOccupied = room.status === "occupied";

                return (
                  <div key={room.id} style={{
                    background: "#FFFFFF",
                    border: `0.5px solid ${isSelected ? "#8B0000" : "#D9C9A0"}`,
                    borderLeft: isSelected ? "3px solid #C9991A" : "3px solid transparent",
                    borderRadius: 12, overflow: "hidden",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    boxShadow: isSelected ? "0 2px 8px rgba(139,0,0,0.10)" : "none",
                  }}>

                    {/* Room row */}
                    <div
                      onClick={() => handleRoomClick(room)}
                      style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between",
                        padding: "1rem 1.25rem", cursor: "pointer",
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.parentElement.style.borderColor = "#C9991A"; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.parentElement.style.borderColor = "#D9C9A0"; }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 38, height: 38,
                          background: isOccupied ? "#F5E8E8" : "#EDFAF3",
                          borderRadius: 8,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <i className="ti ti-door" style={{
                            fontSize: 20, color: isOccupied ? "#8B0000" : "#1E7D4B",
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
                              <> &nbsp;·&nbsp;
                                <i className="ti ti-map-pin" style={{ fontSize: 11, marginRight: 4 }} />
                                {room.location}
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 500, padding: "3px 8px",
                          borderRadius: 20,
                          background: isOccupied ? "#F5E8E8" : "#EDFAF3",
                          color: isOccupied ? "#8B0000" : "#1E7D4B",
                          border: `0.5px solid ${isOccupied ? "#D9A0A0" : "#A8DFC1"}`,
                        }}>
                          {isOccupied ? "Occupied" : "Available"}
                        </span>
                        <i
                          className={`ti ${isSelected ? "ti-chevron-up" : "ti-chevron-down"}`}
                          style={{ fontSize: 16, color: "#C9991A" }}
                        />
                      </div>
                    </div>

                    {/* Reservation form */}
                    {isSelected && (
                      <div style={{
                        borderTop: "0.5px solid #EDE4D4",
                        padding: "1rem 1.25rem",
                        background: "#FFFDF5",
                      }}>
                        <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 12px", color: "#5A0000" }}>
                          Reserve — {room.name}
                        </p>

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
                            gap: 10, marginBottom: 10,
                          }}>
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
                                min={todayAt(HOUR_MIN)}
                                max={todayAt(HOUR_MAX - 1, 59)}
                                style={{
                                  width: "100%", padding: "7px 10px", fontSize: 13,
                                  border: "0.5px solid #D9C9A0", borderRadius: 8,
                                  outline: "none", boxSizing: "border-box",
                                  background: "#FFFFFF", color: "#3A2000",
                                  fontFamily: "'Poppins', sans-serif",
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = "#C9991A"}
                                onBlur={e  => e.currentTarget.style.borderColor = "#D9C9A0"}
                              />
                            </div>
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
                                min={startTime || todayAt(HOUR_MIN)}
                                max={todayAt(HOUR_MAX)}
                                style={{
                                  width: "100%", padding: "7px 10px", fontSize: 13,
                                  border: "0.5px solid #D9C9A0", borderRadius: 8,
                                  outline: "none", boxSizing: "border-box",
                                  background: "#FFFFFF", color: "#3A2000",
                                  fontFamily: "'Poppins', sans-serif",
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = "#C9991A"}
                                onBlur={e  => e.currentTarget.style.borderColor = "#D9C9A0"}
                              />
                            </div>
                          </div>

                          <div style={{
                            display: "flex", alignItems: "center", gap: 6,
                            marginBottom: 10, marginTop: -2,
                          }}>
                            <i className="ti ti-clock-hour-6" style={{ fontSize: 13, color: "#C9991A" }} />
                            <span style={{ fontSize: 11, color: "#9A7840" }}>
                              Reservations allowed from <strong>6:00 AM</strong> to <strong>10:00 PM</strong> only.
                            </span>
                          </div>

                          <div style={{ marginBottom: 12 }}>
                            <label style={{
                              display: "block", fontSize: 12, fontWeight: 500,
                              color: "#5A0000", marginBottom: 5,
                            }}>
                              Purpose <span style={{ color: "#C9991A" }}>*</span>
                            </label>
                            <div style={{ position: "relative" }}>
                              <i className="ti ti-notes" style={{
                                position: "absolute", left: 10, top: 9,
                                fontSize: 15, color: "#B0A080", pointerEvents: "none",
                              }} />
                              <textarea
                                value={purpose}
                                onChange={e => setPurpose(e.target.value)}
                                required
                                rows={2}
                                placeholder="e.g. Group study session, Faculty meeting..."
                                style={{
                                  width: "100%", padding: "7px 10px 7px 32px", fontSize: 13,
                                  border: "0.5px solid #D9C9A0", borderRadius: 8,
                                  outline: "none", boxSizing: "border-box",
                                  background: "#FFFFFF", color: "#3A2000",
                                  fontFamily: "'Poppins', sans-serif",
                                  resize: "vertical", lineHeight: 1.5,
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = "#C9991A"}
                                onBlur={e  => e.currentTarget.style.borderColor = "#D9C9A0"}
                              />
                            </div>
                          </div>

                          {availability && (() => {
                            const badge = availabilityBadge[availability];
                            return (
                              <div style={{
                                display: "flex", alignItems: "center", gap: 8,
                                background: badge.bg, border: `0.5px solid ${badge.border}`,
                                borderRadius: 8, padding: "8px 12px", marginBottom: 12,
                                transition: "all 0.2s ease",
                              }}>
                                <i
                                  className={`ti ${badge.icon}${availability === "checking" ? " spin" : ""}`}
                                  style={{ fontSize: 15, color: badge.color, flexShrink: 0 }}
                                />
                                <span style={{ fontSize: 12, fontWeight: 500, color: badge.color }}>
                                  {badge.label}
                                </span>
                              </div>
                            );
                          })()}

                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              type="submit"
                              disabled={submitting || availability === "unavailable"}
                              style={{
                                padding: "8px 16px",
                                background: submitting
                                  ? "#C9991A99"
                                  : availability === "unavailable"
                                    ? "#D9C9A0"
                                    : "#8B0000",
                                color: availability === "unavailable" ? "#9A8060" : "#FFFFFF",
                                border: "none", borderRadius: 8,
                                fontSize: 13, fontWeight: 600,
                                cursor: (submitting || availability === "unavailable") ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", gap: 6,
                                fontFamily: "'Poppins', sans-serif", transition: "background 0.15s",
                              }}
                              onMouseEnter={e => { if (!submitting && availability !== "unavailable") e.currentTarget.style.background = "#C9991A"; }}
                              onMouseLeave={e => { if (!submitting && availability !== "unavailable") e.currentTarget.style.background = "#8B0000"; }}
                            >
                              <i className="ti ti-calendar-plus" />
                              {submitting ? "Submitting..." : "Reserve Room"}
                            </button>

                            <button
                              type="button"
                              onClick={() => { setSelectedRoom(null); setAvailability(null); }}
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
          </div>
        ))}

        {/* ── Empty state ── */}
        {!loading && filteredRooms.length === 0 && !error && (
          <div style={{
            textAlign: "center", padding: "3rem 1rem",
            color: "#B0A080", fontSize: 13,
          }}>
            <i className="ti ti-building-off" style={{
              fontSize: 32, display: "block", marginBottom: 8, color: "#C9991A",
            }} />
            {hasSearch
              ? "No rooms match your search criteria."
              : "No rooms available right now."
            }
          </div>
        )}
      </div>
    </div>
  );
}