import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const iconColors = {
  blue:   { bg: "#E6F1FB", color: "#185FA5" },
  teal:   { bg: "#E1F5EE", color: "#0F6E56" },
  amber:  { bg: "#FAEEDA", color: "#854F0B" },
  purple: { bg: "#EEEDFE", color: "#534AB7" },
  red:    { bg: "#FCEBEB", color: "#A32D2D" },
};

const statusDot = { confirmed: "#1D9E75", pending: "#BA7517", rejected: "#A32D2D", completed: "#378ADD" };
const statusLabel = { confirmed: "Confirmed", pending: "Pending", rejected: "Rejected", completed: "Completed" };

export default function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "student";
  const username = localStorage.getItem("username") || "User";
  const initials = username.slice(0, 2).toUpperCase();

  const isAdmin = role === "admin";

  const [stats, setStats] = useState({ available: 0, myReservations: 0, pending: 0, todayBookings: 0 });
  const [recent, setRecent] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, resRes] = await Promise.all([
          API.get("/rooms/"),
          API.get("/reservations/"),
        ]);

        const rooms = roomsRes.data?.data ?? roomsRes.data ?? [];
        const reservations = resRes.data?.data ?? resRes.data ?? [];

        const today = new Date().toDateString();
        const myRes = isAdmin ? reservations : reservations.filter(r => r.user === username);
        const pending = myRes.filter(r => r.status === "pending").length;
        const todayBookings = reservations.filter(r => new Date(r.start_time).toDateString() === today).length;

        setStats({
          available: rooms.filter(r => r.is_available !== false).length,
          myReservations: myRes.length,
          pending,
          todayBookings,
        });

        setRecent(
          myRes
            .slice(-5)
            .reverse()
            .map(r => ({
              room: `${r.room_name ?? r.room} — ${statusLabel[r.status] ?? r.status}`,
              meta: r.start_time ? new Date(r.start_time).toLocaleString() : "",
              dot: statusDot[r.status] ?? "#888",
              time: r.created_at ? timeAgo(r.created_at) : "",
            }))
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchData();
  }, []);

  function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return "Yesterday";
  }

  const navItems = [
    { label: "View Rooms", desc: "Browse available spaces", icon: "ti-building", color: "blue", path: "/rooms" },
    { label: "My Reservations", desc: "Manage your bookings", icon: "ti-clipboard-list", color: "teal", path: "/reservations" },
    { label: "Calendar", desc: "Monthly overview", icon: "ti-calendar", color: "amber", path: "/calendar" },
    { label: "Notifications", desc: "Updates & alerts", icon: "ti-bell", color: "purple", path: "/notifications" },
    ...(isAdmin ? [{ label: "Manage Reservations", desc: "Approve or reject requests", icon: "ti-shield-check", color: "red", path: "/admin/reservations" }] : []),
  ];

  const statCards = [
    { label: "Available rooms", value: stats.available },
    { label: isAdmin ? "All reservations" : "My reservations", value: stats.myReservations },
    { label: "Pending", value: stats.pending },
    { label: "Today's bookings", value: stats.todayBookings },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate("/notifications")} style={{ width: 36, height: 36, background: "#f5f5f3", border: "0.5px solid #e0e0da", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <i className="ti ti-bell" style={{ fontSize: 18, color: "#666" }} />
          </button>
          <div title={`${username} (${role})`} style={{ width: 36, height: 36, borderRadius: "50%", background: isAdmin ? "#FCEBEB" : "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: isAdmin ? "#A32D2D" : "#185FA5", cursor: "default" }}>
            {initials}
          </div>
        </div>
      </header>

      <div style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
        {/* Welcome */}
        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 2px" }}>Good day, {username} 👋</h1>
            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
              {isAdmin ? "You're logged in as Admin. Manage all reservations below." : "Here's a summary of your reservations and activity."}
            </p>
          </div>
          {isAdmin && (
            <span style={{ fontSize: 11, fontWeight: 600, background: "#FCEBEB", color: "#A32D2D", borderRadius: 20, padding: "4px 10px", border: "0.5px solid #F7C1C1" }}>
              Admin
            </span>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: "1.5rem" }}>
          {loadingStats
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} style={{ background: "#f0f0ee", borderRadius: 8, padding: "0.85rem 1rem", height: 60, animation: "pulse 1.5s infinite" }} />
              ))
            : statCards.map(({ label, value }) => (
                <div key={label} style={{ background: "#fff", border: "0.5px solid #e0e0da", borderRadius: 8, padding: "0.85rem 1rem" }}>
                  <p style={{ fontSize: 11, color: "#888", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
                  <p style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>{value}</p>
                </div>
              ))
          }
        </div>

        {/* Nav Cards */}
        <p style={{ fontSize: 11, fontWeight: 500, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px" }}>Navigation</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
          {navItems.map(({ label, desc, icon, color, path }) => (
            <div key={label} onClick={() => navigate(path)}
              style={{ background: "#fff", border: "0.5px solid #e0e0da", borderRadius: 12, padding: "1.25rem 1rem", cursor: "pointer", display: "flex", flexDirection: "column", gap: 10, transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#bbb"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e0e0da"}
            >
              <div style={{ width: 38, height: 38, borderRadius: 8, background: iconColors[color].bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: iconColors[color].color }}>
                <i className={`ti ${icon}`} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 2px" }}>{label}</p>
                <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <p style={{ fontSize: 11, fontWeight: 500, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px" }}>Recent activity</p>
        <div style={{ background: "#fff", border: "0.5px solid #e0e0da", borderRadius: 12, overflow: "hidden", marginBottom: "1.5rem" }}>
          {recent.length === 0 ? (
            <div style={{ padding: "1.25rem 1rem", fontSize: 13, color: "#aaa", textAlign: "center" }}>No recent activity.</div>
          ) : recent.map(({ room, meta, dot, time }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.85rem 1rem", borderBottom: i < recent.length - 1 ? "0.5px solid #e0e0da" : "none" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 1px" }}>{room}</p>
                <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{meta}</p>
              </div>
              <span style={{ fontSize: 11, color: "#aaa" }}>{time}</span>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "0.5px solid #ccc", borderRadius: 8, padding: "8px 14px", fontSize: 13, color: "#666", cursor: "pointer" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#FCEBEB"; e.currentTarget.style.color = "#A32D2D"; e.currentTarget.style.borderColor = "#F7C1C1"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "#ccc"; }}
        >
          <i className="ti ti-logout" /> Sign out
        </button>
      </div>
    </div>
  );
}
