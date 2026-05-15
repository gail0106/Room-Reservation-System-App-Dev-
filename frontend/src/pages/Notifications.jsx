import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const typeConfig = {
  confirmed: { bg: "#EDFAF3", border: "#A8DFC1", color: "#1E7D4B", dot: "#1D9E75", icon: "ti-circle-check" },
  pending:   { bg: "#FAEEDA", border: "#F0CA8A", color: "#854F0B", dot: "#BA7517", icon: "ti-clock"        },
  cancelled: { bg: "#FCEBEB", border: "#F7C1C1", color: "#A32D2D", dot: "#D94F4F", icon: "ti-circle-x"    },
  info:      { bg: "#E6F1FB", border: "#A8C8F0", color: "#185FA5", dot: "#378ADD", icon: "ti-info-circle"  },
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return "Just now";
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
      } catch (err) {
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

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
        <button
          onClick={() => navigate("/dashboard")}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "0.5px solid #e0e0da", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#666", cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = "#f5f5f3"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >
          <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
          Back to Dashboard
        </button>
      </header>

      <div style={{ padding: "1.5rem", maxWidth: 700, margin: "0 auto" }}>

        {/* Page title */}
        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 2px" }}>Notifications</h1>
            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>Updates and alerts on your reservations.</p>
          </div>
          {notifications.length > 0 && (
            <span style={{ fontSize: 11, background: "#E6F1FB", color: "#185FA5", border: "0.5px solid #A8C8F0", borderRadius: 20, padding: "3px 10px", fontWeight: 500 }}>
              {notifications.length} total
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#888", fontSize: 13 }}>
            <i className="ti ti-loader" style={{ fontSize: 16 }} />
            Loading notifications...
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FCEBEB", border: "0.5px solid #F7C1C1", borderRadius: 8, padding: "8px 12px", marginBottom: "1rem" }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 16, color: "#A32D2D", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#A32D2D" }}>{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && notifications.length === 0 && (
          <div style={{ background: "#fff", border: "0.5px solid #e0e0da", borderRadius: 12, padding: "3rem 1.5rem", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, background: "#E6F1FB", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <i className="ti ti-bell-off" style={{ fontSize: 24, color: "#185FA5" }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 4px" }}>No notifications yet</p>
            <p style={{ fontSize: 12, color: "#888", margin: 0 }}>You're all caught up! Check back later.</p>
          </div>
        )}

        {/* Notifications list */}
        {!loading && notifications.length > 0 && (
          <div style={{ background: "#fff", border: "0.5px solid #e0e0da", borderRadius: 12, overflow: "hidden" }}>
            {notifications.map((notif, i) => {
              const type = typeConfig[notif.type] ?? typeConfig.info;
              return (
                <div
                  key={notif.id}
                  style={{ display: "flex", gap: 14, padding: "1rem 1.25rem", borderBottom: i < notifications.length - 1 ? "0.5px solid #e0e0da" : "none", alignItems: "flex-start" }}
                >
                  {/* Icon */}
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: type.bg, border: `0.5px solid ${type.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <i className={`ti ${type.icon}`} style={{ fontSize: 16, color: type.color }} />
                  </div>

                  {/* Content */}
<div style={{ flex: 1, minWidth: 0 }}>

  {/* Title + time ago */}
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
    <p style={{ fontSize: 13, fontWeight: 500, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
      {notif.title}
    </p>
    <span style={{ fontSize: 11, color: "#aaa", flexShrink: 0 }}>{timeAgo(notif.created_at)}</span>
  </div>

  {/* Message */}
  <p style={{ fontSize: 12, color: "#666", margin: "0 0 8px", lineHeight: 1.5 }}>{notif.message}</p>

  {/* Reservation details */}
  {(notif.room_name || notif.start_time || notif.end_time) && (
    <div style={{ background: "#f5f5f3", border: "0.5px solid #e0e0da", borderRadius: 8, padding: "0.6rem 0.85rem", marginBottom: 8, display: "flex", flexDirection: "column", gap: 5 }}>

      {notif.room_name && (
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <i className="ti ti-building" style={{ fontSize: 12, color: "#888", flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: "#444" }}>{notif.room_name}</span>
        </div>
      )}

      {notif.start_time && (
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <i className="ti ti-calendar" style={{ fontSize: 12, color: "#888", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "#555" }}>
            {new Date(notif.start_time).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
          </span>
        </div>
      )}

      {notif.start_time && notif.end_time && (
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <i className="ti ti-clock" style={{ fontSize: 12, color: "#888", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "#555" }}>
            {new Date(notif.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            {" — "}
            {new Date(notif.end_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
      )}

    </div>
  )}

  {/* Status badge */}
  <span style={{ fontSize: 10, fontWeight: 500, background: type.bg, color: type.color, border: `0.5px solid ${type.border}`, borderRadius: 20, padding: "2px 8px", display: "inline-flex", alignItems: "center", gap: 4 }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: type.dot, display: "inline-block" }} />
    {(notif.type ?? "info").charAt(0).toUpperCase() + (notif.type ?? "info").slice(1)}
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