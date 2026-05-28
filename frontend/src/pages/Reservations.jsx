import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  approved:  { bg: "#EDFAF3", color: "#1E7D4B", border: "#A8DFC1", dot: "#1D9E75", label: "Approved"  },
  pending:   { bg: "#FFF4E5", color: "#854F0B", border: "#F5D9A8", dot: "#BA7517", label: "Pending"   },
  completed: { bg: "#E6F1FB", color: "#185FA5", border: "#A8C8F0", dot: "#378ADD", label: "Completed" },
  rejected:  { bg: "#FCEBEB", color: "#A32D2D", border: "#F7C1C1", dot: "#D94F4F", label: "Rejected"  },
  cancelled: { bg: "#F3F3F3", color: "#666666", border: "#D0D0D0", dot: "#999999", label: "Cancelled" },
};

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    try {
      const res = await API.get("/reservations/");
      const data = res.data?.data ?? res.data ?? [];
      const sorted = [...data].sort(
        (a, b) => new Date(b.start_time) - new Date(a.start_time)
      );
      setReservations(sorted);
    } catch {
      setError("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      await API.patch(`/reservations/${id}/cancel/`);
      // Update status locally — no need for a full refetch
      setReservations(prev =>
        prev.map(r => r.id === id ? { ...r, status: "cancelled" } : r)
      );
    } catch (err) {
      alert(
        err.response?.data?.error ??
        err.response?.data?.detail ??
        "Failed to cancel reservation."
      );
    } finally {
      setCancellingId(null);
      setConfirmId(null);
    }
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

  const canCancel = (status) => status === "pending" || status === "approved";

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", minHeight: "100vh", background: "#F7F3EE" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'); * { font-family: 'Poppins', sans-serif; }`}</style>

      {/* Header */}
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

      <div style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>

        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 2px", color: "#5A0000" }}>My Bookings</h1>
          <p style={{ fontSize: 13, color: "#7A6030", margin: 0 }}>View and track all your room bookings.</p>
        </div>

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#7A6030", fontSize: 13 }}>
            <i className="ti ti-loader" style={{ fontSize: 16, color: "#C9991A" }} />
            Loading reservations...
          </div>
        )}

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

        {!loading && !error && reservations.length === 0 && (
          <div style={{
            background: "#FFFFFF", border: "0.5px solid #D9C9A0",
            borderRadius: 12, padding: "3rem 1.5rem", textAlign: "center",
          }}>
            <div style={{
              width: 48, height: 48, background: "#FDF5DF", borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1rem", border: "0.5px solid #D9C070",
            }}>
              <i className="ti ti-clipboard-list" style={{ fontSize: 24, color: "#C9991A" }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px", color: "#5A0000" }}>No reservations yet</p>
            <p style={{ fontSize: 12, color: "#7A6030", margin: "0 0 1.25rem" }}>You haven't made any room bookings.</p>
            <button
              onClick={() => navigate("/rooms")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "#8B0000", color: "#FFFFFF",
                border: "none", borderRadius: 8, padding: "8px 16px",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Poppins', sans-serif", transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#C9991A"}
              onMouseLeave={e => e.currentTarget.style.background = "#8B0000"}
            >
              <i className="ti ti-building" />
              Browse Rooms
            </button>
          </div>
        )}

        {!loading && reservations.length > 0 && (
          <div style={{
            background: "#FFFFFF", border: "0.5px solid #D9C9A0",
            borderRadius: 12, overflow: "hidden",
          }}>
            {reservations.map((res, i) => {
              const status = statusConfig[res.status] ?? statusConfig.pending;
              const isConfirming = confirmId === res.id;
              const isCancelling = cancellingId === res.id;

              return (
                <div key={res.id}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "1rem 1.25rem",
                    borderBottom: (i < reservations.length - 1 && !isConfirming)
                      ? "0.5px solid #EDE4D4" : "none",
                    borderLeft: `3px solid ${status.dot}`,
                  }}>
                    {/* Icon */}
                    <div style={{
                      width: 38, height: 38, borderRadius: 8,
                      background: status.bg, border: `0.5px solid ${status.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <i className="ti ti-building" style={{ fontSize: 18, color: status.color }} />
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 13, fontWeight: 600, margin: "0 0 3px", color: "#1A5CA8",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {res.room_name || `Room ${res.room}`}
                      </p>
                      <p style={{ fontSize: 11, color: "#7A6030", margin: 0 }}>
                        <i className="ti ti-clock" style={{ fontSize: 11, marginRight: 4 }} />
                        {formatLocal(res.start_time)} — {formatLocalTime(res.end_time)}
                      </p>
                    </div>

                    {/* Right side: status badge + cancel button */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 500,
                        background: status.bg, color: status.color,
                        border: `0.5px solid ${status.border}`,
                        borderRadius: 20, padding: "3px 10px",
                        display: "flex", alignItems: "center", gap: 5,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: status.dot, display: "inline-block" }} />
                        {status.label}
                      </span>

                      {/* Cancel button — only for pending/approved */}
                      {canCancel(res.status) && (
                        <button
                          onClick={() => setConfirmId(isConfirming ? null : res.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 4,
                            background: "none",
                            border: "0.5px solid #D9A0A0",
                            borderRadius: 8, padding: "4px 10px",
                            fontSize: 11, color: "#8B0000", cursor: "pointer",
                            fontFamily: "'Poppins', sans-serif", fontWeight: 500,
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#F5E8E8"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                        >
                          <i className="ti ti-x" style={{ fontSize: 12 }} />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline confirmation row */}
                  {isConfirming && (
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 1.25rem 10px calc(1.25rem + 3px)",
                      background: "#FFF8F8",
                      borderLeft: "3px solid #D9A0A0",
                      borderBottom: i < reservations.length - 1 ? "0.5px solid #EDE4D4" : "none",
                      gap: 12,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <i className="ti ti-alert-triangle" style={{ fontSize: 15, color: "#8B0000", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "#8B0000" }}>
                          Are you sure you want to cancel this reservation?
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => handleCancel(res.id)}
                          disabled={isCancelling}
                          style={{
                            display: "flex", alignItems: "center", gap: 4,
                            background: isCancelling ? "#D9A0A0" : "#8B0000",
                            border: "none", borderRadius: 8,
                            padding: "5px 12px", fontSize: 11,
                            color: "#FFFFFF", cursor: isCancelling ? "not-allowed" : "pointer",
                            fontFamily: "'Poppins', sans-serif", fontWeight: 600,
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => { if (!isCancelling) e.currentTarget.style.background = "#C9991A"; }}
                          onMouseLeave={e => { if (!isCancelling) e.currentTarget.style.background = "#8B0000"; }}
                        >
                          <i className="ti ti-circle-check" style={{ fontSize: 12 }} />
                          {isCancelling ? "Cancelling..." : "Yes, cancel"}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          disabled={isCancelling}
                          style={{
                            background: "none", border: "0.5px solid #D9C9A0",
                            borderRadius: 8, padding: "5px 12px",
                            fontSize: 11, color: "#7A6030", cursor: "pointer",
                            fontFamily: "'Poppins', sans-serif", fontWeight: 500,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#F5E8E8"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                        >
                          Keep it
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && reservations.length > 0 && (
          <p style={{ fontSize: 11, color: "#B0A080", marginTop: "1rem", textAlign: "right" }}>
            {reservations.length} reservation{reservations.length !== 1 ? "s" : ""} total
          </p>
        )}

      </div>
    </div>
  );
}