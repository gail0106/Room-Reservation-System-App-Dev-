import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const typeConfig = {
  pending: {
    bg: "#FFF8EC", border: "#F5D9A8", color: "#854F0B", dot: "#E59A1A",
    icon: "ti-clock", label: "Pending",
  },
  approved: {
    bg: "#EDFAF3", border: "#A8DFC1", color: "#1E7D4B", dot: "#1D9E75",
    icon: "ti-circle-check", label: "Approved",
  },
  rejected: {
    bg: "#FCEBEB", border: "#F7C1C1", color: "#A32D2D", dot: "#D94F4F",
    icon: "ti-circle-x", label: "Rejected",
  },
  cancelled: {
    bg: "#F3F3F3", border: "#D0D0D0", color: "#666666", dot: "#999999",
    icon: "ti-ban", label: "Cancelled",
  },
  completed: {
    bg: "#E6F1FB", border: "#A8C8F0", color: "#185FA5", dot: "#378ADD",
    icon: "ti-rosette-discount-check", label: "Completed",
  },
  info: {
    bg: "#F0EEFF", border: "#C4B8F7", color: "#5B3FD4", dot: "#7C5CE8",
    icon: "ti-info-circle", label: "Info",
  },
};

const formatLocal = (dateStr) =>
  new Date(dateStr).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

const formatLocalTime = (dateStr) =>
  new Date(dateStr).toLocaleTimeString("en-PH", {
    timeZone: "Asia/Manila",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

const formatLocalDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNotif, setSelectedNotif] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get("/notifications/");
        setNotifications(res.data);
      } catch {
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", minHeight: "100vh", background: "#F7F3EE" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        * { font-family: 'Poppins', sans-serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <header style={{
        background: "#8B0000",
        borderBottom: "3px solid #C9991A",
        padding: "0.85rem 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "#C9991A", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
            fontSize: 12, color: "#FFFFFF", cursor: "pointer",
            fontFamily: "'Poppins', sans-serif", fontWeight: 500,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#C9991A"; e.currentTarget.style.borderColor = "#C9991A"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(201,153,26,0.5)"; }}
        >
          <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
          Back to Dashboard
        </button>
      </header>

      <div style={{ padding: "1.5rem", maxWidth: 700, margin: "0 auto" }}>

        {/* Page title */}
        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 2px", color: "#5A0000" }}>Notifications</h1>
            <p style={{ fontSize: 13, color: "#7A6030", margin: 0 }}>
              Tap a notification to view reservation details.
            </p>
          </div>
          {notifications.length > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              background: "#8B0000", color: "#FFFFFF",
              border: "0.5px solid #C9991A",
              borderRadius: 20, padding: "3px 10px",
            }}>
              {notifications.length} total
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#7A6030", fontSize: 13 }}>
            <i className="ti ti-loader" style={{ fontSize: 16, color: "#C9991A" }} />
            Loading notifications...
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#F5E8E8", border: "0.5px solid #D9A0A0",
            borderRadius: 8, padding: "8px 12px", marginBottom: "1rem",
          }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 16, color: "#8B0000", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#8B0000" }}>{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && notifications.length === 0 && (
          <div style={{
            background: "#FFFFFF", border: "0.5px solid #D9C9A0",
            borderRadius: 12, padding: "3rem 1.5rem", textAlign: "center",
          }}>
            <div style={{
              width: 48, height: 48, background: "#FDF5DF",
              borderRadius: 12, display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 1rem",
              border: "0.5px solid #D9C070",
            }}>
              <i className="ti ti-bell-off" style={{ fontSize: 24, color: "#C9991A" }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px", color: "#5A0000" }}>No notifications yet</p>
            <p style={{ fontSize: 12, color: "#7A6030", margin: 0 }}>You're all caught up! Check back later.</p>
          </div>
        )}

        {/* Notifications list */}
        {!loading && notifications.length > 0 && (
          <div style={{
            background: "#FFFFFF", border: "0.5px solid #D9C9A0",
            borderRadius: 12, overflow: "hidden",
          }}>
            {notifications.map((notif, i) => {
              const statusKey = notif.notif_type ?? notif.type ?? "info";
              const cfg = typeConfig[statusKey] ?? typeConfig.info;

              return (
                <div
                  key={notif.id}
                  onClick={() => setSelectedNotif(notif)}
                  style={{
                    display: "flex", gap: 14,
                    padding: "1rem 1.25rem",
                    borderBottom: i < notifications.length - 1 ? "0.5px solid #EDE4D4" : "none",
                    alignItems: "flex-start",
                    borderLeft: `3px solid ${cfg.dot}`,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#FDF9F0"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: cfg.bg, border: `0.5px solid ${cfg.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 1,
                  }}>
                    <i className={`ti ${cfg.icon}`} style={{ fontSize: 16, color: cfg.color }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: "#3A2000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {notif.title}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: "#B0A080" }}>{timeAgo(notif.created_at)}</span>
                        <i className="ti ti-chevron-right" style={{ fontSize: 13, color: "#C9991A" }} />
                      </div>
                    </div>

                    <p style={{ fontSize: 12, color: "#7A6030", margin: "0 0 8px", lineHeight: 1.5 }}>
                      {notif.message}
                    </p>

                    {/* Status badge */}
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      background: cfg.bg, color: cfg.color,
                      border: `0.5px solid ${cfg.border}`,
                      borderRadius: 20, padding: "2px 8px",
                      display: "inline-flex", alignItems: "center", gap: 4,
                      textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Reservation Details Modal ── */}
      {selectedNotif && (
        <div
          onClick={() => setSelectedNotif(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: "1rem",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#FFFFFF", borderRadius: 16,
              width: "100%", maxWidth: 420,
              boxShadow: "0 8px 32px rgba(139,0,0,0.15)",
              border: "0.5px solid #D9C9A0",
              animation: "fadeIn 0.18s ease",
              overflow: "hidden",
            }}
          >
            {/* Modal header */}
            <div style={{
              background: "#8B0000", borderRadius: "16px 16px 0 0",
              padding: "1rem 1.25rem",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className="ti ti-clipboard-list" style={{ fontSize: 18, color: "#F5D98A" }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF" }}>
                  Reservation Details
                </span>
              </div>
              <button
                onClick={() => setSelectedNotif(null)}
                style={{
                  background: "rgba(255,255,255,0.12)", border: "none",
                  borderRadius: 6, width: 28, height: 28,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#FFFFFF", fontSize: 16,
                }}
              >
                <i className="ti ti-x" />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "1.25rem" }}>

              <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px", color: "#5A0000" }}>
                {selectedNotif.title}
              </p>
              <p style={{ fontSize: 12, color: "#7A6030", margin: "0 0 16px", lineHeight: 1.6 }}>
                {selectedNotif.message}
              </p>

              {/* Details card */}
              <div style={{
                background: "#FDF5DF", border: "0.5px solid #D9C9A0",
                borderRadius: 10, padding: "1rem",
                display: "flex", flexDirection: "column", gap: 12,
              }}>
                {/* Room */}
                {selectedNotif.room_name && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "#E8EEF7", border: "0.5px solid #C0D0E8",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <i className="ti ti-building" style={{ fontSize: 15, color: "#1A5CA8" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: "#B0A080", margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Room</p>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: "#1A5CA8" }}>{selectedNotif.room_name}</p>
                    </div>
                  </div>
                )}

                {/* Date */}
                {selectedNotif.start_time && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "#FDF0CC", border: "0.5px solid #D9C070",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <i className="ti ti-calendar" style={{ fontSize: 15, color: "#C9991A" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: "#B0A080", margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Date</p>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: "#3A2000" }}>{formatLocalDate(selectedNotif.start_time)}</p>
                    </div>
                  </div>
                )}

                {/* Time */}
                {selectedNotif.start_time && selectedNotif.end_time && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "#EDFAF3", border: "0.5px solid #A8DFC1",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <i className="ti ti-clock" style={{ fontSize: 15, color: "#1E7D4B" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: "#B0A080", margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Time</p>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: "#3A2000" }}>
                        {formatLocalTime(selectedNotif.start_time)} — {formatLocalTime(selectedNotif.end_time)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Purpose */}
                {selectedNotif.purpose && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "#F0EEFF", border: "0.5px solid #C4B8F7",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <i className="ti ti-notes" style={{ fontSize: 15, color: "#5B3FD4" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, color: "#B0A080", margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Purpose</p>
                      <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: "#3A2000", lineHeight: 1.5 }}>
                        {selectedNotif.purpose}
                      </p>
                    </div>
                  </div>
                )}

                {/* Fallback */}
                {!selectedNotif.room_name && !selectedNotif.start_time && (
                  <p style={{ fontSize: 12, color: "#B0A080", margin: 0, textAlign: "center" }}>
                    No reservation details available.
                  </p>
                )}
              </div>

              {/* Received timestamp */}
              <p style={{ fontSize: 11, color: "#B0A080", margin: "12px 0 0", textAlign: "right" }}>
                Received {formatLocal(selectedNotif.created_at)}
              </p>

              {/* Close button */}
              <button
                onClick={() => setSelectedNotif(null)}
                style={{
                  width: "100%", marginTop: 14,
                  padding: "9px 0", background: "#8B0000",
                  color: "#FFFFFF", border: "none", borderRadius: 8,
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Poppins', sans-serif",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#C9991A"}
                onMouseLeave={e => e.currentTarget.style.background = "#8B0000"}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}