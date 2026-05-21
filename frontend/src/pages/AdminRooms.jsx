import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function AdminRooms() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null); // null = add mode

  // Form fields
  const [form, setForm] = useState({ name: "", capacity: "", location: "", is_available: true });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [deletingRoom, setDeletingRoom] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      const response = await API.get("/rooms/");
      const data = response.data?.data ?? response.data ?? [];
      setRooms(data);
    } catch {
      setError("Failed to load rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/"); return; }
    if (localStorage.getItem("role") !== "admin") { navigate("/dashboard"); return; }
    fetchRooms();
  }, [fetchRooms, navigate]);

  // ── Helpers ──────────────────────────────────────────────
  const isOccupied = (room) =>
    room.status === "occupied" || room.is_available === false;

  const openAdd = () => {
    setEditingRoom(null);
    setForm({ name: "", capacity: "", location: "", is_available: true });
    setFormError("");
    setFormSuccess("");
    setShowModal(true);
  };

  const openEdit = (room) => {
    setEditingRoom(room);
    setForm({
      name: room.name ?? "",
      capacity: room.capacity ?? "",
      location: room.location ?? "",
      is_available: room.is_available ?? room.status !== "occupied",
    });
    setFormError("");
    setFormSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setFormError("");
    setFormSuccess("");
  };

  // ── Submit add / edit ─────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    const payload = {
      name: form.name,
      capacity: parseInt(form.capacity, 10),
      location: form.location,
      is_available: form.is_available,
    };

    try {
      if (editingRoom) {
        await API.put(`/rooms/${editingRoom.id}/`, payload);
        setFormSuccess("Room updated successfully.");
      } else {
        await API.post("/rooms/", payload);
        setFormSuccess("Room added successfully.");
      }
      fetchRooms();
    } catch (err) {
      setFormError(
        err.response?.data?.error ??
        err.response?.data?.detail ??
        "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle availability ───────────────────────────────────
  const handleToggle = async (room) => {
    try {
      await API.patch(`/rooms/${room.id}/`, {
        is_available: !room.is_available,
      });
      fetchRooms();
    } catch {
      setError("Failed to toggle availability.");
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingRoom) return;
    setDeleteError("");
    setDeleteSubmitting(true);
    try {
      await API.delete(`/rooms/${deletingRoom.id}/`);
      setDeletingRoom(null);
      fetchRooms();
    } catch (err) {
      setDeleteError(
        err.response?.data?.error ??
        err.response?.data?.detail ??
        "Failed to delete room."
      );
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // ── Shared input style ────────────────────────────────────
  const inputStyle = {
    width: "100%", padding: "7px 10px", fontSize: 13,
    border: "0.5px solid #D9C9A0", borderRadius: 8,
    outline: "none", boxSizing: "border-box",
    background: "#FFFFFF", color: "#3A2000",
    fontFamily: "'Poppins', sans-serif",
  };

  const labelStyle = {
    display: "block", fontSize: 12, fontWeight: 500,
    color: "#5A0000", marginBottom: 5,
  };

  // ─────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", minHeight: "100vh", background: "#F7F3EE" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        * { font-family: 'Poppins', sans-serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ── Header ── */}
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
            fontSize: 13, color: "#FFFFFF", cursor: "pointer",
            fontFamily: "'Poppins', sans-serif", fontWeight: 500,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#C9991A"; e.currentTarget.style.borderColor = "#C9991A"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(201,153,26,0.5)"; }}
        >
          <i className="ti ti-arrow-left" /> Dashboard
        </button>
      </header>

      {/* ── Page body ── */}
      <div style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>

        {/* Page title + Add button */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: 10,
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 2px", color: "#5A0000" }}>
              Manage Rooms
            </h1>
            <p style={{ fontSize: 13, color: "#7A6030", margin: 0 }}>
              Add, edit, delete, or toggle room availability.
            </p>
          </div>
          <button
            onClick={openAdd}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#8B0000", color: "#FFFFFF",
              border: "none", borderRadius: 8,
              padding: "8px 16px", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "'Poppins', sans-serif",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#C9991A"}
            onMouseLeave={e => e.currentTarget.style.background = "#8B0000"}
          >
            <i className="ti ti-plus" /> Add Room
          </button>
        </div>

        {/* Global error */}
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

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: "grid", gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: "#EDE4D4", border: "0.5px solid #D9C9A0",
                borderRadius: 12, padding: "1rem", height: 72,
              }} />
            ))}
          </div>
        )}

        {/* ── Room list ── */}
        <div style={{ display: "grid", gap: 10 }}>
          {rooms.map(room => (
            <div key={room.id} style={{
              background: "#FFFFFF",
              border: "0.5px solid #D9C9A0",
              borderLeft: "3px solid #C9991A",
              borderRadius: 12, overflow: "hidden",
              transition: "box-shadow 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(139,0,0,0.08)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                padding: "0.9rem 1.25rem", gap: 12, flexWrap: "wrap",
              }}>
                {/* Room info */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 8,
                    background: isOccupied(room) ? "#F5E8E8" : "#EDFAF3",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <i className="ti ti-door" style={{
                      fontSize: 20,
                      color: isOccupied(room) ? "#8B0000" : "#1E7D4B",
                    }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 2px", color: "#1A5CA8" }}>
                      {room.name}
                    </p>
                    <p style={{ fontSize: 12, color: "#7A6030", margin: 0 }}>
                      <i className="ti ti-users" style={{ fontSize: 11, marginRight: 4 }} />
                      Capacity: {room.capacity}
                      {room.location && (
                        <> &nbsp;·&nbsp;
                          <i className="ti ti-map-pin" style={{ fontSize: 11, marginRight: 4 }} />
                          {room.location}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

                  {/* Availability badge / toggle */}
                  <button
                    onClick={() => handleToggle(room)}
                    title="Toggle availability"
                    style={{
                      fontSize: 11, fontWeight: 500,
                      padding: "3px 10px", borderRadius: 20, cursor: "pointer",
                      background: isOccupied(room) ? "#F5E8E8" : "#EDFAF3",
                      color: isOccupied(room) ? "#8B0000" : "#1E7D4B",
                      border: `0.5px solid ${isOccupied(room) ? "#D9A0A0" : "#A8DFC1"}`,
                      fontFamily: "'Poppins', sans-serif",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    {isOccupied(room) ? "Unavailable" : "Available"}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(room)}
                    title="Edit room"
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "#FDF0CC", border: "0.5px solid #D9C070",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#C9991A22"}
                    onMouseLeave={e => e.currentTarget.style.background = "#FDF0CC"}
                  >
                    <i className="ti ti-pencil" style={{ fontSize: 15, color: "#C9991A" }} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => { setDeletingRoom(room); setDeleteError(""); }}
                    title="Delete room"
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "#F5E8E8", border: "0.5px solid #D9A0A0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#8B000022"}
                    onMouseLeave={e => e.currentTarget.style.background = "#F5E8E8"}
                  >
                    <i className="ti ti-trash" style={{ fontSize: 15, color: "#8B0000" }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {!loading && rooms.length === 0 && !error && (
          <div style={{
            textAlign: "center", padding: "3rem 1rem",
            color: "#B0A080", fontSize: 13,
          }}>
            <i className="ti ti-building-off" style={{ fontSize: 32, display: "block", marginBottom: 8, color: "#C9991A" }} />
            No rooms yet. Click "Add Room" to get started.
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div
          onClick={closeModal}
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
              width: "100%", maxWidth: 460,
              boxShadow: "0 8px 32px rgba(139,0,0,0.15)",
              border: "0.5px solid #D9C9A0",
              animation: "fadeIn 0.18s ease",
            }}
          >
            {/* Modal header */}
            <div style={{
              background: "#8B0000", borderRadius: "16px 16px 0 0",
              padding: "1rem 1.25rem",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className={`ti ${editingRoom ? "ti-pencil" : "ti-building-plus"}`}
                  style={{ fontSize: 18, color: "#F5D98A" }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF" }}>
                  {editingRoom ? "Edit Room" : "Add New Room"}
                </span>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: "rgba(255,255,255,0.12)", border: "none",
                  borderRadius: 6, width: 28, height: 28,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#FFFFFF", fontSize: 16,
                }}
              >
                <i className="ti ti-x" />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "1.25rem" }}>

              {/* Success */}
              {formSuccess && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#EDFAF3", border: "0.5px solid #A8DFC1",
                  borderRadius: 8, padding: "8px 12px", marginBottom: 14,
                }}>
                  <i className="ti ti-circle-check" style={{ color: "#1E7D4B" }} />
                  <span style={{ fontSize: 12, color: "#1E7D4B" }}>{formSuccess}</span>
                </div>
              )}

              {/* Error */}
              {formError && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#F5E8E8", border: "0.5px solid #D9A0A0",
                  borderRadius: 8, padding: "8px 12px", marginBottom: 14,
                }}>
                  <i className="ti ti-alert-circle" style={{ color: "#8B0000" }} />
                  <span style={{ fontSize: 12, color: "#8B0000" }}>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Name */}
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Room Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    placeholder="e.g. Room 101"
                    style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = "#C9991A"}
                    onBlur={e => e.currentTarget.style.borderColor = "#D9C9A0"}
                  />
                </div>

                {/* Capacity + Location row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={labelStyle}>Capacity</label>
                    <input
                      type="number"
                      min="1"
                      value={form.capacity}
                      onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                      required
                      placeholder="e.g. 30"
                      style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = "#C9991A"}
                      onBlur={e => e.currentTarget.style.borderColor = "#D9C9A0"}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Location</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                      placeholder="e.g. Building A"
                      style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = "#C9991A"}
                      onBlur={e => e.currentTarget.style.borderColor = "#D9C9A0"}
                    />
                  </div>
                </div>

                {/* Availability toggle */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "#FDF5DF", border: "0.5px solid #D9C9A0",
                  borderRadius: 8, padding: "10px 14px", marginBottom: 16,
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 1px", color: "#5A0000" }}>
                      Available
                    </p>
                    <p style={{ fontSize: 11, color: "#7A6030", margin: 0 }}>
                      Allow students to reserve this room
                    </p>
                  </div>
                  <div
                    onClick={() => setForm(f => ({ ...f, is_available: !f.is_available }))}
                    style={{
                      width: 42, height: 24, borderRadius: 12, cursor: "pointer",
                      background: form.is_available ? "#1E7D4B" : "#D9A0A0",
                      position: "relative", transition: "background 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: "#FFFFFF",
                      position: "absolute", top: 3,
                      left: form.is_available ? 21 : 3,
                      transition: "left 0.2s",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    }} />
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      flex: 1, padding: "9px 0",
                      background: submitting ? "#C9991A99" : "#8B0000",
                      color: "#FFFFFF", border: "none", borderRadius: 8,
                      fontSize: 13, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      fontFamily: "'Poppins', sans-serif", transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#C9991A"; }}
                    onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = "#8B0000"; }}
                  >
                    <i className={`ti ${editingRoom ? "ti-device-floppy" : "ti-plus"}`} />
                    {submitting ? "Saving..." : editingRoom ? "Save Changes" : "Add Room"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    style={{
                      padding: "9px 16px", background: "none",
                      border: "0.5px solid #D9C9A0", borderRadius: 8,
                      fontSize: 13, color: "#8B0000", cursor: "pointer",
                      fontFamily: "'Poppins', sans-serif", fontWeight: 500,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#F5E8E8"; e.currentTarget.style.borderColor = "#D9A0A0"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "#D9C9A0"; }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deletingRoom && (
        <div
          onClick={() => setDeletingRoom(null)}
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
              width: "100%", maxWidth: 380,
              boxShadow: "0 8px 32px rgba(139,0,0,0.15)",
              border: "0.5px solid #D9A0A0",
              animation: "fadeIn 0.18s ease",
              padding: "1.5rem",
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "#F5E8E8", margin: "0 auto 14px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <i className="ti ti-trash" style={{ fontSize: 24, color: "#8B0000" }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, textAlign: "center", margin: "0 0 6px", color: "#5A0000" }}>
              Delete Room?
            </p>
            <p style={{ fontSize: 13, color: "#7A6030", textAlign: "center", margin: "0 0 16px" }}>
              <strong>{deletingRoom.name}</strong> will be permanently removed. This cannot be undone.
            </p>

            {deleteError && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#F5E8E8", border: "0.5px solid #D9A0A0",
                borderRadius: 8, padding: "8px 12px", marginBottom: 14,
              }}>
                <i className="ti ti-alert-circle" style={{ color: "#8B0000" }} />
                <span style={{ fontSize: 12, color: "#8B0000" }}>{deleteError}</span>
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleDelete}
                disabled={deleteSubmitting}
                style={{
                  flex: 1, padding: "9px 0",
                  background: deleteSubmitting ? "#D9A0A0" : "#8B0000",
                  color: "#FFFFFF", border: "none", borderRadius: 8,
                  fontSize: 13, fontWeight: 600,
                  cursor: deleteSubmitting ? "not-allowed" : "pointer",
                  fontFamily: "'Poppins', sans-serif", transition: "background 0.15s",
                }}
                onMouseEnter={e => { if (!deleteSubmitting) e.currentTarget.style.background = "#C9991A"; }}
                onMouseLeave={e => { if (!deleteSubmitting) e.currentTarget.style.background = "#8B0000"; }}
              >
                {deleteSubmitting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={() => setDeletingRoom(null)}
                style={{
                  flex: 1, padding: "9px 0", background: "none",
                  border: "0.5px solid #D9C9A0", borderRadius: 8,
                  fontSize: 13, color: "#8B0000", cursor: "pointer",
                  fontFamily: "'Poppins', sans-serif", fontWeight: 500,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F5E8E8"; e.currentTarget.style.borderColor = "#D9A0A0"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "#D9C9A0"; }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}