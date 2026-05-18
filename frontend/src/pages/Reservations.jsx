import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  approved: { bg: "#EDFAF3", color: "#1E7D4B", border: "#A8DFC1", dot: "#1D9E75", label: "Confirmed" },
  pending:   { bg: "#FAEEDA", color: "#854F0B", border: "#F0CA8A", dot: "#BA7517", label: "Pending"   },
  completed: { bg: "#E6F1FB", color: "#185FA5", border: "#A8C8F0", dot: "#378ADD", label: "Completed" },
  rejected: { bg: "#FCEBEB", color: "#A32D2D", border: "#F7C1C1", dot: "#D94F4F", label: "Cancelled" },
  cancelled: { bg: "#E6F1FB", color: "#A32D2D", border: "#F7C1C1", dot: "#D94F4F", label: "Cancelled" },

};

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    try {
      const res = await API.get("/reservations/");
      setReservations(res.data);
    } catch (err) {
      setError("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
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
        <button
          onClick={() => navigate("/dashboard")}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "0.5px solid #e0e0da", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#666", cursor: "pointer" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f5f5f3"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
        >
          <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
          Back to Dashboard
        </button>
      </header>

      <div style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>

        {/* Page title */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 2px" }}>My Reservations</h1>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>View and track all your room bookings.</p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#888", fontSize: 13 }}>
            <i className="ti ti-loader" style={{ fontSize: 16 }} />
            Loading reservations...
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
        {!loading && !error && reservations.length === 0 && (
          <div style={{ background: "#fff", border: "0.5px solid #e0e0da", borderRadius: 12, padding: "3rem 1.5rem", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, background: "#E6F1FB", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <i className="ti ti-clipboard-list" style={{ fontSize: 24, color: "#185FA5" }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 4px" }}>No reservations yet</p>
            <p style={{ fontSize: 12, color: "#888", margin: "0 0 1.25rem" }}>You haven't made any room bookings.</p>
            <button
              onClick={() => navigate("/rooms")}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
            >
              <i className="ti ti-building" />
              Browse Rooms
            </button>
          </div>
        )}

        {/* Reservations list */}
        {!loading && reservations.length > 0 && (
          <div style={{ background: "#fff", border: "0.5px solid #e0e0da", borderRadius: 12, overflow: "hidden" }}>
            {reservations.map((res, i) => {
              const status = statusConfig[res.status] ?? statusConfig.pending;
              return (
                <div
                  key={res.id}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "1rem 1.25rem", borderBottom: i < reservations.length - 1 ? "0.5px solid #e0e0da" : "none" }}
                >
                  {/* Icon */}
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="ti ti-building" style={{ fontSize: 18, color: "#185FA5" }} />
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {res.room_name || `Room ${res.room}`}
                    </p>
                    <p style={{ fontSize: 11, color: "#888", margin: 0 }}>
                      <i className="ti ti-clock" style={{ fontSize: 11, marginRight: 4 }} />
                      {new Date(res.start_time).toLocaleString()} — {new Date(res.end_time).toLocaleString()}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span style={{ fontSize: 11, fontWeight: 500, background: status.bg, color: status.color, border: `0.5px solid ${status.border}`, borderRadius: 20, padding: "3px 10px", flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: status.dot, display: "inline-block" }} />
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {!loading && reservations.length > 0 && (
          <p style={{ fontSize: 11, color: "#aaa", marginTop: "1rem", textAlign: "right" }}>
            {reservations.length} reservation{reservations.length !== 1 ? "s" : ""} total
          </p>
        )}

      </div>
    </div>
  );
}