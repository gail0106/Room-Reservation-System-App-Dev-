import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

// Status colors retained as-is (semantic meaning)
const STATUS_STYLES = {
  pending:   { bg: "#FFF4E5", color: "#854F0B", border: "#F5D9A8", label: "Pending" },
  approved:  { bg: "#EDFAF3", color: "#1E7D4B", border: "#A8DFC1", label: "Approved" },
  rejected:  { bg: "#FCEBEB", color: "#A32D2D", border: "#F7C1C1", label: "Rejected" },
  completed: { bg: "#E6F1FB", color: "#185FA5", border: "#A8CCF0", label: "Completed" },
  cancelled: { bg: "#E6F1FB", color: "#A32D2D", border: "#F7C1C1", label: "Cancelled" },
};

const TABS = ["all", "pending", "approved", "rejected"];

export default function AdminReservations() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "admin") navigate("/dashboard", { replace: true });
  }, []);

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get("/reservations/");
      const data = response.data?.data ?? response.data ?? [];
      setReservations(data);
    } catch {
      setError("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleAction = async (id, status) => {
    setActionLoading(id + status);
    try {
      await API.patch(`/reservations/${id}/approve/`, { status });
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.detail ?? "Action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = activeTab === "all"
    ? reservations
    : reservations.filter(r => r.status === activeTab);

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === "all" ? reservations.length : reservations.filter(r => r.status === t).length;
    return acc;
  }, {});

  if (role !== "admin") return null;

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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 600,
            background: "#C9991A", color: "#FFFFFF",
            borderRadius: 20, padding: "4px 10px",
            border: "0.5px solid rgba(255,255,255,0.3)",
            letterSpacing: "0.04em",
          }}>
            Admin
          </span>
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
        </div>
      </header>

      <div style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>

        {/* Title */}
        <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 2px", color: "#5A0000" }}>Manage Reservations</h1>
            <p style={{ fontSize: 13, color: "#7A6030", margin: 0 }}>Review, approve, or reject reservation requests.</p>
          </div>
          <button
            onClick={fetchReservations}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "0.5px solid #D9C9A0",
              borderRadius: 8, padding: "6px 12px",
              fontSize: 13, color: "#8B0000", cursor: "pointer",
              fontFamily: "'Poppins', sans-serif", fontWeight: 500,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#FDF5DF"; e.currentTarget.style.borderColor = "#C9991A"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "#D9C9A0"; }}
          >
            <i className="ti ti-refresh" /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12,
                fontWeight: 600, cursor: "pointer", border: "0.5px solid",
                background: activeTab === tab ? "#8B0000" : "#FFFFFF",
                color: activeTab === tab ? "#FFFFFF" : "#8B0000",
                borderColor: activeTab === tab ? "#8B0000" : "#D9C9A0",
                display: "flex", alignItems: "center", gap: 6,
                fontFamily: "'Poppins', sans-serif",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={e => {
                if (activeTab !== tab) {
                  e.currentTarget.style.background = "#FDF5DF";
                  e.currentTarget.style.borderColor = "#C9991A";
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== tab) {
                  e.currentTarget.style.background = "#FFFFFF";
                  e.currentTarget.style.borderColor = "#D9C9A0";
                }
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span style={{
                fontSize: 10,
                background: activeTab === tab ? "rgba(255,255,255,0.25)" : "#F0EAE0",
                borderRadius: 10, padding: "1px 6px",
                color: activeTab === tab ? "#FFFFFF" : "#8B0000",
              }}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#F5E8E8", border: "0.5px solid #D9A0A0",
            borderRadius: 8, padding: "10px 14px", marginBottom: 12,
          }}>
            <i className="ti ti-alert-circle" style={{ color: "#8B0000" }} />
            <span style={{ fontSize: 13, color: "#8B0000" }}>{error}</span>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div style={{ display: "grid", gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: "#EDE4D4", border: "0.5px solid #D9C9A0",
                borderRadius: 12, padding: "1rem", height: 90,
              }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#B0A080", fontSize: 13 }}>
            <i className="ti ti-clipboard-off" style={{ fontSize: 32, display: "block", marginBottom: 8, color: "#C9991A" }} />
            No {activeTab === "all" ? "" : activeTab} reservations found.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {filtered.map((res) => {
              const s = STATUS_STYLES[res.status] ?? STATUS_STYLES.pending;
              const isPending = res.status === "pending";
              return (
                <div key={res.id} style={{
                  background: "#FFFFFF",
                  border: "0.5px solid #D9C9A0",
                  borderLeft: `3px solid ${s.border}`,
                  borderRadius: 12, padding: "1rem 1.25rem",
                  transition: "box-shadow 0.15s",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{
                          width: 32, height: 32, background: "#FDF5DF",
                          borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                          border: "0.5px solid #D9C070",
                        }}>
                          <i className="ti ti-door" style={{ fontSize: 16, color: "#C9991A" }} />
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "#1A5CA8" }}>
                            {res.room_name ?? `Room #${res.room}`}
                          </p>
                          <p style={{ fontSize: 11, color: "#7A6030", margin: 0 }}>
                            by <strong style={{ color: "#5A0000" }}>{res.user_username ?? res.user}</strong>
                            &nbsp;·&nbsp;
                            {res.start_time ? new Date(res.start_time).toLocaleString() : "—"}
                            {res.end_time ? ` → ${new Date(res.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status + Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      {/* Status badge — retains semantic color */}
                      <span style={{
                        fontSize: 11, fontWeight: 500, padding: "3px 8px",
                        borderRadius: 20, background: s.bg, color: s.color,
                        border: `0.5px solid ${s.border}`,
                      }}>
                        {s.label}
                      </span>

                      {/* Action buttons — retains green/red for approve/reject */}
                      {isPending && (
                        <>
                          <button
                            disabled={actionLoading === res.id + "approved"}
                            onClick={() => handleAction(res.id, "approved")}
                            style={{
                              padding: "6px 12px", background: "#EDFAF3",
                              color: "#1E7D4B", border: "0.5px solid #A8DFC1",
                              borderRadius: 8, fontSize: 12, fontWeight: 500,
                              cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                              fontFamily: "'Poppins', sans-serif",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#d4f5e5"}
                            onMouseLeave={e => e.currentTarget.style.background = "#EDFAF3"}
                          >
                            <i className="ti ti-check" /> Approve
                          </button>
                          <button
                            disabled={actionLoading === res.id + "rejected"}
                            onClick={() => handleAction(res.id, "rejected")}
                            style={{
                              padding: "6px 12px", background: "#FCEBEB",
                              color: "#A32D2D", border: "0.5px solid #F7C1C1",
                              borderRadius: 8, fontSize: 12, fontWeight: 500,
                              cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                              fontFamily: "'Poppins', sans-serif",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#fad8d8"}
                            onMouseLeave={e => e.currentTarget.style.background = "#FCEBEB"}
                          >
                            <i className="ti ti-x" /> Reject
                          </button>
                        </>
                      )}
                    </div>
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