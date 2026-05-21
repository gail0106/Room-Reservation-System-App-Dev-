import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

// Status colors retained as-is (semantic meaning)
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'); * { font-family: 'Poppins', sans-serif; }`}</style>

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
            <p style={{ fontSize: 13, color: "#7A6030", margin: 0 }}>Updates and alerts on your reservations.</p>
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
                  style={{
                    display: "flex", gap: 14,
                    padding: "1rem 1.25rem",
                    borderBottom: i < notifications.length - 1 ? "0.5px solid #EDE4D4" : "none",
                    alignItems: "flex-start",
                    borderLeft: `3px solid ${cfg.dot}`,
                  }}
                >
                  {/* Icon — retains status color */}
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

                    {/* Title + time ago */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: "#3A2000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {notif.title}
                      </p>
                      <span style={{ fontSize: 11, color: "#B0A080", flexShrink: 0 }}>{timeAgo(notif.created_at)}</span>
                    </div>

                    {/* Message */}
                    <p style={{ fontSize: 12, color: "#7A6030", margin: "0 0 8px", lineHeight: 1.5 }}>{notif.message}</p>

                    {/* Reservation details */}
                    {(notif.room_name || notif.start_time || notif.end_time) && (
                      <div style={{
                        background: "#FDF5DF", border: "0.5px solid #EDE4D4",
                        borderRadius: 8, padding: "0.6rem 0.85rem",
                        marginBottom: 8, display: "flex", flexDirection: "column", gap: 5,
                      }}>
                        {notif.room_name && (
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <i className="ti ti-building" style={{ fontSize: 12, color: "#C9991A", flexShrink: 0 }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#1A5CA8" }}>{notif.room_name}</span>
                          </div>
                        )}
                        {notif.start_time && (
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <i className="ti ti-calendar" style={{ fontSize: 12, color: "#C9991A", flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: "#5A3000" }}>
                              {new Date(notif.start_time).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                            </span>
                          </div>
                        )}
                        {notif.start_time && notif.end_time && (
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <i className="ti ti-clock" style={{ fontSize: 12, color: "#C9991A", flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: "#5A3000" }}>
                              {new Date(notif.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                              {" — "}
                              {new Date(notif.end_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status badge — retains status color */}
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
    </div>
  );
}