import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

import logo from "../assets/RoomMate.png";
import VoiceAssistant from "../components/VoiceAssistant";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faDoorOpen,
} from "@fortawesome/free-solid-svg-icons";

const STATUS_STYLES = {
  pending:   { bg: "#FFF4E5", color: "#854F0B", border: "#F5D9A8", label: "Pending" },
  approved:  { bg: "#EDFAF3", color: "#1E7D4B", border: "#A8DFC1", label: "Approved" },
  rejected:  { bg: "#FCEBEB", color: "#A32D2D", border: "#F7C1C1", label: "Rejected" },
  completed: { bg: "#E6F1FB", color: "#185FA5", border: "#A8CCF0", label: "Completed" },
  cancelled: { bg: "#F3F3F3", color: "#666666", border: "#D0D0D0", label: "Cancelled" },
};

const TABS = ["all", "pending", "approved", "rejected", "cancelled", "completed"];

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
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get("/reservations/");
      const data = response.data?.data ?? response.data ?? [];
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setReservations(sorted);
    } catch {
      setError("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleApproveConfirm = async () => {
    if (!approveTarget) return;
    setApproveLoading(true);
    try {
      await API.patch(`/reservations/${approveTarget.id}/approve/`, { status: "approved" });
      setApproveTarget(null);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.detail ?? "Failed to approve reservation.");
    } finally {
      setApproveLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    setRejectLoading(true);
    try {
      await API.patch(`/reservations/${rejectTarget.id}/approve/`, { status: "rejected" });
      setRejectTarget(null);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.detail ?? "Failed to reject reservation.");
    } finally {
      setRejectLoading(false);
    }
  };

  const handleCancel = async (id) => {
    setCancelLoading(id);
    try {
      await API.patch(`/reservations/${id}/cancel/`);
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
      setCancelLoading(null);
      setConfirmCancelId(null);
    }
  };

  const filtered = activeTab === "all"
    ? reservations
    : reservations.filter(r => r.status === activeTab);

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === "all" ? reservations.length : reservations.filter(r => r.status === t).length;
    return acc;
  }, {});

  // Reusable reservation summary card — shown in approve/reject modals
  const ReservationSummary = ({ res }) => (
    <div style={{
      background: "#FDF5DF", border: "0.5px solid #D9C9A0",
      borderRadius: 10, padding: "0.85rem 1rem",
      marginBottom: 16, display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <FontAwesomeIcon icon={faDoorOpen} style={{ fontSize: 14, color: "#C9991A", flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1A5CA8" }}>
          {res.room_name ?? `Room #${res.room}`}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <i className="ti ti-user" style={{ fontSize: 14, color: "#C9991A", flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "#5A0000" }}>
          {res.user_username ?? res.user}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <i className="ti ti-clock" style={{ fontSize: 14, color: "#C9991A", flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "#5A0000" }}>
          {res.start_time ? new Date(res.start_time).toLocaleString() : "—"}
          {res.end_time ? ` → ${new Date(res.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
        </span>
      </div>
      {res.purpose && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <i className="ti ti-notes" style={{ fontSize: 14, color: "#C9991A", flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: "#5A0000", lineHeight: 1.5 }}>
            {res.purpose}
          </span>
        </div>
      )}
    </div>
  );

  if (role !== "admin") return null;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", minHeight: "100vh", background: "#F7F3EE" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        * { font-family: 'Poppins', sans-serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, background: "#C9991A", color: "#FFFFFF",
            borderRadius: 20, padding: "4px 10px",
            border: "0.5px solid rgba(255,255,255,0.3)", letterSpacing: "0.04em",
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
            <>
            <FontAwesomeIcon icon={faArrowLeft} />
              {" "}Dashboard
            </>
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
              onClick={() => { setActiveTab(tab); setConfirmCancelId(null); }}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12,
                fontWeight: 600, cursor: "pointer", border: "0.5px solid",
                background: activeTab === tab ? "#8B0000" : "#FFFFFF",
                color: activeTab === tab ? "#FFFFFF" : "#8B0000",
                borderColor: activeTab === tab ? "#8B0000" : "#D9C9A0",
                display: "flex", alignItems: "center", gap: 6,
                fontFamily: "'Poppins', sans-serif", transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={e => { if (activeTab !== tab) { e.currentTarget.style.background = "#FDF5DF"; e.currentTarget.style.borderColor = "#C9991A"; } }}
              onMouseLeave={e => { if (activeTab !== tab) { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.borderColor = "#D9C9A0"; } }}
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
              const isApproved = res.status === "approved";
              const isConfirming = confirmCancelId === res.id;
              const isCancelling = cancelLoading === res.id;

              return (
                <div key={res.id} style={{
                  background: "#FFFFFF",
                  border: `0.5px solid ${isConfirming ? "#D9A0A0" : "#D9C9A0"}`,
                  borderLeft: `3px solid ${isConfirming ? "#D9A0A0" : s.border}`,
                  borderRadius: 12, overflow: "hidden",
                  transition: "border-color 0.15s",
                }}>
                  {/* Main row */}
                  <div style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <div style={{
                            width: 32, height: 32, background: "#FDF5DF",
                            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                            border: "0.5px solid #D9C070",
                          }}>
                            <FontAwesomeIcon icon={faDoorOpen} style={{ fontSize: 16, color: "#C9991A" }} />
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

                        {/* Purpose pill */}
                        {res.purpose && (
                          <div style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            background: "#F0EEFF", border: "0.5px solid #C4B8F7",
                            borderRadius: 6, padding: "3px 8px",
                            marginTop: 2,
                          }}>
                            <i className="ti ti-notes" style={{ fontSize: 11, color: "#5B3FD4" }} />
                            <span style={{
                              fontSize: 11, color: "#5B3FD4", fontWeight: 500,
                              maxWidth: 340, overflow: "hidden",
                              textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                              {res.purpose}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status + Actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 500, padding: "3px 8px",
                          borderRadius: 20, background: s.bg, color: s.color,
                          border: `0.5px solid ${s.border}`,
                        }}>
                          {s.label}
                        </span>

                        {isPending && (
                          <>
                            <button
                              onClick={() => setApproveTarget(res)}
                              style={{
                                padding: "6px 12px", background: "#EDFAF3",
                                color: "#1E7D4B", border: "0.5px solid #A8DFC1",
                                borderRadius: 8, fontSize: 12, fontWeight: 500,
                                cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                                fontFamily: "'Poppins', sans-serif", transition: "background 0.15s",
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = "#d4f5e5"}
                              onMouseLeave={e => e.currentTarget.style.background = "#EDFAF3"}
                            >
                              <i className="ti ti-check" /> Approve
                            </button>
                            <button
                              onClick={() => setRejectTarget(res)}
                              style={{
                                padding: "6px 12px", background: "#FCEBEB",
                                color: "#A32D2D", border: "0.5px solid #F7C1C1",
                                borderRadius: 8, fontSize: 12, fontWeight: 500,
                                cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                                fontFamily: "'Poppins', sans-serif", transition: "background 0.15s",
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = "#fad8d8"}
                              onMouseLeave={e => e.currentTarget.style.background = "#FCEBEB"}
                            >
                              <i className="ti ti-x" /> Reject
                            </button>
                          </>
                        )}

                        {isApproved && (
                          <button
                            onClick={() => setConfirmCancelId(isConfirming ? null : res.id)}
                            style={{
                              padding: "6px 12px",
                              background: isConfirming ? "#F5E8E8" : "none",
                              color: "#8B0000", border: "0.5px solid #D9A0A0",
                              borderRadius: 8, fontSize: 12, fontWeight: 500,
                              cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                              fontFamily: "'Poppins', sans-serif", transition: "background 0.15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#F5E8E8"; }}
                            onMouseLeave={e => { if (!isConfirming) e.currentTarget.style.background = "none"; }}
                          >
                            <i className="ti ti-ban" style={{ fontSize: 13 }} /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Inline cancel confirmation strip */}
                  {isConfirming && (
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 1.25rem",
                      background: "#FFF8F8",
                      borderTop: "0.5px solid #F7C1C1",
                      gap: 12, flexWrap: "wrap",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <i className="ti ti-alert-triangle" style={{ fontSize: 15, color: "#8B0000", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "#8B0000" }}>
                          Cancel this approved reservation for <strong>{res.room_name ?? `Room #${res.room}`}</strong>? This cannot be undone.
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
                            padding: "5px 14px", fontSize: 12,
                            color: "#FFFFFF", cursor: isCancelling ? "not-allowed" : "pointer",
                            fontFamily: "'Poppins', sans-serif", fontWeight: 600,
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => { if (!isCancelling) e.currentTarget.style.background = "#C9991A"; }}
                          onMouseLeave={e => { if (!isCancelling) e.currentTarget.style.background = "#8B0000"; }}
                        >
                          <i className="ti ti-circle-check" style={{ fontSize: 13 }} />
                          {isCancelling ? "Cancelling..." : "Yes, cancel it"}
                        </button>
                        <button
                          onClick={() => setConfirmCancelId(null)}
                          disabled={isCancelling}
                          style={{
                            background: "none", border: "0.5px solid #D9C9A0",
                            borderRadius: 8, padding: "5px 12px",
                            fontSize: 12, color: "#7A6030", cursor: "pointer",
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
      </div>

      {/* ── Approve Confirmation Modal ── */}
      {approveTarget && (
        <div
          onClick={() => { if (!approveLoading) setApproveTarget(null); }}
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
              boxShadow: "0 8px 32px rgba(30,125,75,0.15)",
              border: "0.5px solid #A8DFC1",
              animation: "fadeIn 0.18s ease",
              overflow: "hidden",
            }}
          >
            <div style={{
              background: "#1E7D4B", borderRadius: "16px 16px 0 0",
              padding: "1rem 1.25rem",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className="ti ti-circle-check" style={{ fontSize: 18, color: "#FFFFFF" }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF" }}>Approve Reservation</span>
              </div>
              <button
                onClick={() => { if (!approveLoading) setApproveTarget(null); }}
                style={{
                  background: "rgba(255,255,255,0.15)", border: "none",
                  borderRadius: 6, width: 28, height: 28,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#FFFFFF",
                }}
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <div style={{ padding: "1.25rem" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "#EDFAF3", margin: "0 auto 14px",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "0.5px solid #A8DFC1",
              }}>
                <i className="ti ti-circle-check" style={{ fontSize: 26, color: "#1E7D4B" }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, textAlign: "center", margin: "0 0 6px", color: "#1E4D35" }}>
                Approve this reservation?
              </p>
              <p style={{ fontSize: 12, color: "#7A6030", textAlign: "center", margin: "0 0 16px", lineHeight: 1.6 }}>
                This will confirm the booking for
              </p>
              <ReservationSummary res={approveTarget} />
              <p style={{ fontSize: 11, color: "#B0A080", textAlign: "center", margin: "0 0 16px" }}>
                The user will be notified about this approval.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleApproveConfirm}
                  disabled={approveLoading}
                  style={{
                    flex: 1, padding: "9px 0",
                    background: approveLoading ? "#A8DFC1" : "#1E7D4B",
                    color: "#FFFFFF", border: "none", borderRadius: 8,
                    fontSize: 13, fontWeight: 600,
                    cursor: approveLoading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    fontFamily: "'Poppins', sans-serif", transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { if (!approveLoading) e.currentTarget.style.background = "#155C38"; }}
                  onMouseLeave={e => { if (!approveLoading) e.currentTarget.style.background = "#1E7D4B"; }}
                >
                  <i className="ti ti-circle-check" />
                  {approveLoading ? "Approving..." : "Yes, Approve"}
                </button>
                <button
                  onClick={() => { if (!approveLoading) setApproveTarget(null); }}
                  disabled={approveLoading}
                  style={{
                    flex: 1, padding: "9px 0", background: "none",
                    border: "0.5px solid #D9C9A0", borderRadius: 8,
                    fontSize: 13, color: "#7A6030", cursor: "pointer",
                    fontFamily: "'Poppins', sans-serif", fontWeight: 500,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#EDFAF3"; e.currentTarget.style.borderColor = "#A8DFC1"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "#D9C9A0"; }}
                >
                  Keep Pending
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Confirmation Modal ── */}
      {rejectTarget && (
        <div
          onClick={() => { if (!rejectLoading) setRejectTarget(null); }}
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
              border: "0.5px solid #F7C1C1",
              animation: "fadeIn 0.18s ease",
              overflow: "hidden",
            }}
          >
            <div style={{
              background: "#8B0000", borderRadius: "16px 16px 0 0",
              padding: "1rem 1.25rem",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className="ti ti-circle-x" style={{ fontSize: 18, color: "#F5D98A" }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF" }}>Reject Reservation</span>
              </div>
              <button
                onClick={() => { if (!rejectLoading) setRejectTarget(null); }}
                style={{
                  background: "rgba(255,255,255,0.12)", border: "none",
                  borderRadius: 6, width: 28, height: 28,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#FFFFFF",
                }}
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <div style={{ padding: "1.25rem" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "#FCEBEB", margin: "0 auto 14px",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "0.5px solid #F7C1C1",
              }}>
                <i className="ti ti-alert-triangle" style={{ fontSize: 26, color: "#A32D2D" }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, textAlign: "center", margin: "0 0 6px", color: "#5A0000" }}>
                Reject this reservation?
              </p>
              <p style={{ fontSize: 12, color: "#7A6030", textAlign: "center", margin: "0 0 16px", lineHeight: 1.6 }}>
                This will deny the booking for
              </p>
              <ReservationSummary res={rejectTarget} />
              <p style={{ fontSize: 11, color: "#B0A080", textAlign: "center", margin: "0 0 16px" }}>
                The user will be notified about this rejection.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleRejectConfirm}
                  disabled={rejectLoading}
                  style={{
                    flex: 1, padding: "9px 0",
                    background: rejectLoading ? "#D9A0A0" : "#8B0000",
                    color: "#FFFFFF", border: "none", borderRadius: 8,
                    fontSize: 13, fontWeight: 600,
                    cursor: rejectLoading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    fontFamily: "'Poppins', sans-serif", transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { if (!rejectLoading) e.currentTarget.style.background = "#C9991A"; }}
                  onMouseLeave={e => { if (!rejectLoading) e.currentTarget.style.background = "#8B0000"; }}
                >
                  <i className="ti ti-circle-x" />
                  {rejectLoading ? "Rejecting..." : "Yes, Reject"}
                </button>
                <button
                  onClick={() => { if (!rejectLoading) setRejectTarget(null); }}
                  disabled={rejectLoading}
                  style={{
                    flex: 1, padding: "9px 0", background: "none",
                    border: "0.5px solid #D9C9A0", borderRadius: 8,
                    fontSize: 13, color: "#8B0000", cursor: "pointer",
                    fontFamily: "'Poppins', sans-serif", fontWeight: 500,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#F5E8E8"; e.currentTarget.style.borderColor = "#D9A0A0"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "#D9C9A0"; }}
                >
                  Keep Pending
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <VoiceAssistant />
    </div>
  );
}