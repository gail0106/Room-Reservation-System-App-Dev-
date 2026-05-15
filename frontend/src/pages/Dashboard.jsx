import { useNavigate } from "react-router-dom";

const navItems = [
  {
    label: "View Rooms",
    desc: "Browse available spaces",
    icon: "ti-building",
    color: "blue",
    path: "/rooms",
  },
  {
    label: "My Reservations",
    desc: "Manage your bookings",
    icon: "ti-clipboard-list",
    color: "teal",
    path: "/reservations",
  },
  {
    label: "Calendar",
    desc: "Monthly overview",
    icon: "ti-calendar",
    color: "amber",
    path: "/calendar",
  },
  {
    label: "Notifications",
    desc: "Updates & alerts",
    icon: "ti-bell",
    color: "purple",
    path: "/notifications",
    badge: 2,
  },
];

const iconColors = {
  blue:   { bg: "#E6F1FB", color: "#185FA5" },
  teal:   { bg: "#E1F5EE", color: "#0F6E56" },
  amber:  { bg: "#FAEEDA", color: "#854F0B" },
  purple: { bg: "#EEEDFE", color: "#534AB7" },
};

const recentActivity = [
  { room: "Room 201 — Confirmed", meta: "Science Lab · May 14, 10:00 AM",  dot: "#1D9E75", time: "2h ago" },
  { room: "Room 105 — Pending",   meta: "Lecture Hall · May 14, 2:00 PM",  dot: "#BA7517", time: "5h ago" },
  { room: "Room 304 — Completed", meta: "Computer Lab · May 13, 9:00 AM",  dot: "#378ADD", time: "Yesterday" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "var(--color-background-tertiary, #f5f5f3)" }}>
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
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: "#185FA5", cursor: "pointer" }}>
            US
          </div>
        </div>
      </header>

      <div style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
        {/* Welcome */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 2px" }}>Good day, User 👋</h1>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>Here's a summary of today's reservations and activity.</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: "1.5rem" }}>
          {[["Available rooms", 12], ["My reservations", 3], ["Pending", 1], ["Today's bookings", 8]].map(([label, val]) => (
            <div key={label} style={{ background: "#f5f5f3", borderRadius: 8, padding: "0.85rem 1rem" }}>
              <p style={{ fontSize: 11, color: "#888", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
              <p style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Nav Cards */}
        <p style={{ fontSize: 11, fontWeight: 500, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px" }}>Navigation</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
          {navItems.map(({ label, desc, icon, color, path, badge }) => (
            <div key={label} onClick={() => navigate(path)}
              style={{ background: "#fff", border: "0.5px solid #e0e0da", borderRadius: 12, padding: "1.25rem 1rem", cursor: "pointer", display: "flex", flexDirection: "column", gap: 10, transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#bbb"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e0e0da"}
            >
              <div style={{ width: 38, height: 38, borderRadius: 8, background: iconColors[color].bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: iconColors[color].color }}>
                <i className={`ti ${icon}`} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 2px" }}>{label} {badge && <span style={{ fontSize: 10, background: "#FCEBEB", color: "#A32D2D", borderRadius: 20, padding: "2px 6px" }}>{badge}</span>}</p>
                <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <p style={{ fontSize: 11, fontWeight: 500, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px" }}>Recent activity</p>
        <div style={{ background: "#fff", border: "0.5px solid #e0e0da", borderRadius: 12, overflow: "hidden", marginBottom: "1.5rem" }}>
          {recentActivity.map(({ room, meta, dot, time }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.85rem 1rem", borderBottom: i < recentActivity.length - 1 ? "0.5px solid #e0e0da" : "none" }}>
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
        <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "0.5px solid #ccc", borderRadius: 8, padding: "8px 14px", fontSize: 13, color: "#666", cursor: "pointer" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#FCEBEB"; e.currentTarget.style.color = "#A32D2D"; e.currentTarget.style.borderColor = "#F7C1C1"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "#ccc"; }}
        >
          <i className="ti ti-logout" /> Sign out
        </button>
      </div>
    </div>
  );
}