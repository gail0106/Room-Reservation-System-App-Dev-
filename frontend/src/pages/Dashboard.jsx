import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";


const iconColors = {
  blue:   { bg: "#E8EEF7", color: "#1A5CA8" },
  teal:   { bg: "#FBF5E6", color: "#8B6000" },
  amber:  { bg: "#FDF0CC", color: "#C9991A" },
  purple: { bg: "#F5E8E8", color: "#8B0000" },
  red:    { bg: "#F5E8E8", color: "#8B0000" },
  green:  { bg: "#EDFAF3", color: "#1E7D4B" },
};

const statusDot = {
  approved:  "#C9991A",
  pending:   "#E0B030",
  rejected:  "#8B0000",
  completed: "#1A5CA8",
  cancelled: "#A04040",
};
const statusLabel = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
  completed: "Completed",
  cancelled: "Cancelled",
};

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
        const myRes = reservations;
        const pending = reservations.filter(r => r.status === "pending").length;
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
    { label: "My Bookings", desc: "Manage your bookings", icon: "ti-clipboard-list", color: "teal", path: "/reservations" },
    { label: "Calendar", desc: "Monthly overview", icon: "ti-calendar", color: "amber", path: "/calendar" },
    { label: "Notifications", desc: "Updates & alerts", icon: "ti-bell", color: "purple", path: "/notifications" },
    ...(isAdmin ? [
      { label: "Manage Reservations", desc: "Approve or reject requests", icon: "ti-shield-check", color: "red", path: "/admin/reservations" },
      { label: "Manage Rooms", desc: "Add, edit or remove rooms", icon: "ti-building-plus", color: "green", path: "/admin/rooms" },
    ] : []),
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
    <div style={{
      fontFamily: "'Poppins', sans-serif",
      minHeight: "100vh",
      background: "#F7F3EE",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        * { font-family: 'Poppins', sans-serif; }
      `}</style>

      {/* Header */}
      <header style={{
        background: "#8B0000",
        borderBottom: "3px solid #C9991A",
        padding: "0.85rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: "#C9991A",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="ti ti-school" style={{ fontSize: 20, color: "#FFFFFF" }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF" }}>PUPSantaRosa</div>
            <div style={{ fontSize: 11, color: "#F5D98A" }}>Room Reservation System</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => navigate("/notifications")}
            style={{
              width: 36, height: 36,
              background: "rgba(255,255,255,0.12)",
              border: "0.5px solid rgba(201,153,26,0.5)",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <i className="ti ti-bell" style={{ fontSize: 18, color: "#F5D98A" }} />
          </button>

          <div
            title={`${username} (${role})`}
            style={{
              width: 36, height: 36,
              borderRadius: "50%",
              background: isAdmin ? "#C9991A" : "#FFFFFF",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700,
              color: isAdmin ? "#FFFFFF" : "#8B0000",
              cursor: "default",
              border: "2px solid #C9991A",
            }}
          >
            {initials}
          </div>
        </div>
      </header>

      <div style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
        {/* Welcome */}
        <div style={{
          marginBottom: "1.5rem",
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", flexWrap: "wrap", gap: 8,
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 2px", color: "#5A0000" }}>
              Good day, {username} 👋
            </h1>
            <p style={{ fontSize: 13, color: "#7A6030", margin: 0 }}>
              {isAdmin
                ? "You're logged in as Admin. Manage all reservations below."
                : "Here's a summary of your reservations and activity."}
            </p>
          </div>
          {isAdmin && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              background: "#8B0000", color: "#FFFFFF",
              borderRadius: 20, padding: "4px 12px",
              border: "0.5px solid #C9991A",
              letterSpacing: "0.04em",
            }}>
              Admin
            </span>
          )}
        </div>


        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 10, marginBottom: "1.5rem",
        }}>
          {loadingStats
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} style={{
                  background: "#EDE4D4",
                  borderRadius: 8, padding: "0.85rem 1rem",
                  height: 60, animation: "pulse 1.5s infinite",
                }} />
              ))
            : statCards.map(({ label, value }) => (
                <div key={label} style={{
                  background: "#FFFFFF",
                  border: "0.5px solid #D9C9A0",
                  borderRadius: 8, padding: "0.85rem 1rem",
                  borderLeft: "3px solid #C9991A",
                }}>
                  <p style={{
                    fontSize: 11, color: "#7A6030", margin: "0 0 4px",
                    textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500,
                  }}>
                    {label}
                  </p>
                  <p style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#8B0000" }}>
                    {value}
                  </p>
                </div>
              ))}
        </div>

        {/* Nav Cards */}
        <p style={{
          fontSize: 11, fontWeight: 600, color: "#8B0000",
          textTransform: "uppercase", letterSpacing: "0.06em",
          margin: "0 0 10px",
        }}>
          Navigation
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12, marginBottom: "1.5rem",
        }}>
          {navItems.map(({ label, desc, icon, color, path }) => (
            <div
              key={label}
              onClick={() => navigate(path)}
              style={{
                background: "#FFFFFF",
                border: "0.5px solid #D9C9A0",
                borderRadius: 12,
                padding: "1.25rem 1rem",
                cursor: "pointer",
                display: "flex", flexDirection: "column", gap: 10,
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#C9991A";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(139,0,0,0.10)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#D9C9A0";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 8,
                background: iconColors[color].bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, color: iconColors[color].color,
              }}>
                <i className={`ti ${icon}`} />
              </div>
              <div>
                <p style={{
                  fontSize: 13, fontWeight: 600, margin: "0 0 2px",
                  color: "#1A5CA8",
                }}>
                  {label}
                </p>
                <p style={{ fontSize: 11, color: "#7A6030", margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <p style={{
          fontSize: 11, fontWeight: 600, color: "#8B0000",
          textTransform: "uppercase", letterSpacing: "0.06em",
          margin: "0 0 10px",
        }}>
          Recent activity
        </p>
        <div style={{
          background: "#FFFFFF",
          border: "0.5px solid #D9C9A0",
          borderRadius: 12, overflow: "hidden",
          marginBottom: "1.5rem",
        }}>
          {recent.length === 0 ? (
            <div style={{
              padding: "1.25rem 1rem", fontSize: 13,
              color: "#B0A080", textAlign: "center",
            }}>
              No recent activity.
            </div>
          ) : recent.map(({ room, meta, dot, time }, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "0.85rem 1rem",
                borderBottom: i < recent.length - 1 ? "0.5px solid #EDE4D4" : "none",
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: dot, flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 1px", color: "#3A2000" }}>
                  {room}
                </p>
                <p style={{ fontSize: 11, color: "#7A6030", margin: 0 }}>{meta}</p>
              </div>
              <span style={{ fontSize: 11, color: "#B0A080" }}>{time}</span>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "none",
            border: "0.5px solid #C9991A",
            borderRadius: 8, padding: "8px 14px",
            fontSize: 13, color: "#8B0000",
            cursor: "pointer", fontFamily: "'Poppins', sans-serif",
            fontWeight: 500,
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#8B0000";
            e.currentTarget.style.color = "#FFFFFF";
            e.currentTarget.style.borderColor = "#8B0000";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "#8B0000";
            e.currentTarget.style.borderColor = "#C9991A";
          }}
        >
          <i className="ti ti-logout" /> Sign out
        </button>
      </div>
    </div>
  );
}