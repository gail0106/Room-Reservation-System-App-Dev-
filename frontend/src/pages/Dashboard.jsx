import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

import VoiceAssistant from "../components/VoiceAssistant";
import logo from "../assets/RoomMate.png";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faClipboardList,
  faCalendar,
  faShieldHalved,
  faPlus,
  faRightFromBracket,
  faBell,
} from "@fortawesome/free-solid-svg-icons";

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
  const email = localStorage.getItem("email") || "No email";
  const initials = username.slice(0, 2).toUpperCase();

  const isAdmin = role === "admin";

  const [stats, setStats] = useState({ available: 0, myReservations: 0, pending: 0, todayBookings: 0 });
  const [recent, setRecent] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, resRes, notificationsRes] = await Promise.all([
          API.get("/rooms/"),
          API.get("/reservations/"),
          API.get("/notifications/"),
        ]);

        const rooms = roomsRes.data?.data ?? roomsRes.data ?? [];
        const reservations = resRes.data?.data ?? resRes.data ?? [];
        const notifications = notificationsRes.data?.data ?? notificationsRes.data ?? [];

        setUnreadNotifications(notifications.filter(n => !n.is_read).length);

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
          myRes.slice(-5).reverse().map(r => ({
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

  useEffect(() => {
    const handleClickOutside = () => setShowProfileMenu(false);
    if (showProfileMenu) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showProfileMenu]);

  function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return "Yesterday";
  }

  const navItems = [
    { label: "View Rooms",        desc: "Browse available spaces",       icon: faBuilding,            color: "blue",  path: "/rooms" },
    { label: "My Bookings",       desc: "Manage your bookings",           icon: faClipboardList,       color: "teal",  path: "/reservations" },
    { label: "Calendar",          desc: "Monthly overview",               icon: faCalendar,            color: "amber", path: "/calendar" },
    ...(isAdmin ? [
      { label: "Manage Reservations", desc: "Approve or reject requests", icon: faShieldHalved,        color: "red",   path: "/admin/reservations" },
      { label: "Manage Rooms",        desc: "Add, edit or remove rooms",  icon: faPlus,  color: "green", path: "/admin/rooms" },
    ] : []),
  ];

  const statCards = [
    { label: "Available rooms", value: stats.available },
    { label: isAdmin ? "All reservations" : "My reservations", value: stats.myReservations },
    { label: "Pending", value: stats.pending },
    { label: "Today's bookings", value: stats.todayBookings },
  ];

  const handleLogoutConfirm = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", minHeight: "100vh", background: "#F7F3EE" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        * { font-family: 'Poppins', sans-serif; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div
          onClick={() => setShowLogoutModal(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(30, 10, 10, 0.45)",
            backdropFilter: "blur(3px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, animation: "fadeIn 0.18s ease",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#FFFFFF", borderRadius: 16,
              padding: "2rem 1.75rem 1.5rem",
              width: "100%", maxWidth: 360, margin: "0 1rem",
              boxShadow: "0 8px 32px rgba(139,0,0,0.15), 0 1.5px 6px rgba(0,0,0,0.08)",
              border: "0.5px solid #D9C9A0",
              animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            {/* Icon */}
            <div style={{
              width: 52, height: 52,
              background: "#FBF0F0", border: "1.5px solid #E8C0C0",
              borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "1.1rem",
            }}>
              <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 24, color: "#8B0000" }} />
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#5A0000", margin: "0 0 6px" }}>
              Sign out
            </h2>
            <p style={{ fontSize: 13, color: "#7A6030", margin: "0 0 1.5rem", lineHeight: 1.55 }}>
              Are you sure you want to sign out of your account? Any unsaved changes will be lost.
            </p>

            <div style={{ height: "0.5px", background: "#EDE4D4", marginBottom: "1.1rem" }} />

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 8,
                  border: "0.5px solid #D9C9A0", background: "#F7F3EE",
                  color: "#5A3A00", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'Poppins', sans-serif",
                  transition: "background 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#EDE4D4"; e.currentTarget.style.borderColor = "#C9991A"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#F7F3EE"; e.currentTarget.style.borderColor = "#D9C9A0"; }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 8, border: "none",
                  background: "#8B0000", color: "#FFFFFF",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Poppins', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#6A0000"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(139,0,0,0.30)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#8B0000"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 13 }} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header style={{
        background: "#8B0000", borderBottom: "3px solid #C9991A",
        padding: "0.85rem 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={logo}
            alt="RoomMate logo"
            style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF" }}>RoomMate</div>
            <div style={{ fontSize: 11, color: "#F5D98A" }}>Room Reservation System</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Bell */}
          <div style={{ position: "relative" }}>
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
              <FontAwesomeIcon icon={faBell} style={{ fontSize: 16, color: "#F5D98A" }} />
            </button>

            {unreadNotifications > 0 && (
              <div style={{
                position: "absolute", top: -8, right: -10,
                minWidth: 26, height: 20, padding: "0 6px",
                borderRadius: 999, background: "#FF4D4F",
                color: "#FFFFFF", fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid #8B0000", boxSizing: "border-box",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}>
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </div>
            )}
          </div>

          {/* Profile */}
          <div style={{ position: "relative" }}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowProfileMenu(!showProfileMenu); }}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: isAdmin ? "#C9991A" : "#FFFFFF",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700,
                color: isAdmin ? "#FFFFFF" : "#8B0000",
                border: "2px solid #C9991A",
                cursor: "pointer", padding: 0,
              }}
            >
              {initials}
            </button>

            {showProfileMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute", top: 48, right: 0,
                  width: 280, background: "#FFFFFF",
                  border: "0.5px solid #D9C9A0", borderRadius: 12,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  overflow: "hidden", zIndex: 999,
                }}
              >
                {/* Profile header */}
                <div style={{
                  background: "#8B0000", color: "#FFFFFF",
                  padding: "1rem", display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%",
                    background: "#FFFFFF", color: "#8B0000",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700,
                  }}>
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{username}</div>
                    <div style={{ fontSize: 11, opacity: 0.85 }}>{role}</div>
                  </div>
                </div>

                {/* Profile details */}
                <div style={{ padding: "1rem" }}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Username</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#333" }}>{username}</div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Email</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#333", wordBreak: "break-word" }}>{email}</div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Role</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#333", textTransform: "capitalize" }}>{role}</div>
                  </div>

                  <div style={{ height: 1, background: "#EDE4D4", margin: "12px 0" }} />

                  <button
                    onClick={() => { setShowProfileMenu(false); setShowLogoutModal(true); }}
                    style={{
                      width: "100%", background: "#8B0000", color: "#FFFFFF",
                      border: "none", borderRadius: 8, padding: "10px",
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      fontFamily: "'Poppins', sans-serif",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#6A0000"}
                    onMouseLeave={e => e.currentTarget.style.background = "#8B0000"}
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 13 }} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
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
              border: "0.5px solid #C9991A", letterSpacing: "0.04em",
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
                  background: "#EDE4D4", borderRadius: 8,
                  padding: "0.85rem 1rem", height: 60,
                }} />
              ))
            : statCards.map(({ label, value }) => (
                <div key={label} style={{
                  background: "#FFFFFF", border: "0.5px solid #D9C9A0",
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
                background: "#FFFFFF", border: "0.5px solid #D9C9A0",
                borderRadius: 12, padding: "1.25rem 1rem",
                cursor: "pointer", display: "flex", flexDirection: "column", gap: 10,
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
              }}>
                <FontAwesomeIcon icon={icon} style={{ fontSize: 18, color: iconColors[color].color }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 2px", color: "#1A5CA8" }}>
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
          background: "#FFFFFF", border: "0.5px solid #D9C9A0",
          borderRadius: 12, overflow: "hidden", marginBottom: "1.5rem",
        }}>
          {recent.length === 0 ? (
            <div style={{ padding: "1.25rem 1rem", fontSize: 13, color: "#B0A080", textAlign: "center" }}>
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
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 1px", color: "#3A2000" }}>{room}</p>
                <p style={{ fontSize: 11, color: "#7A6030", margin: 0 }}>{meta}</p>
              </div>
              <span style={{ fontSize: 11, color: "#B0A080" }}>{time}</span>
            </div>
          ))}
        </div>

      </div>

      <VoiceAssistant />
    </div>
  );
}