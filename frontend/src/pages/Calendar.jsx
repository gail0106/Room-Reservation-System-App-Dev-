import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import API from "../api/axios";

const statusColors = {
  approved: { bg: "#1D9E75", border: "#0F6E56", light: "#EDFAF3", text: "#1E7D4B", lightBorder: "#A8DFC1" },
  pending:   { bg: "#BA7517", border: "#854F0B", light: "#FAEEDA", text: "#854F0B", lightBorder: "#F0CA8A" },
  completed: { bg: "#378ADD", border: "#185FA5", light: "#E6F1FB", text: "#185FA5", lightBorder: "#A8C8F0" },
  cancelled: { bg: "#D94F4F", border: "#A32D2D", light: "#FCEBEB", text: "#A32D2D", lightBorder: "#F7C1C1" },
};

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const h = date.getHours();
  const m = date.getMinutes();
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  if (m === 0) return `${hour} ${period}`;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function renderEventContent(eventInfo) {
  const { event } = eventInfo;
  const start = formatTime(event.start);
  const end = event.end ? formatTime(event.end) : null;
  const room = event.title;
  const label = end ? `${start} - ${end} ${room}` : `${start} ${room}`;
  const statusKey = event.extendedProps?.status;
  const status = statusColors[statusKey] ?? statusColors.confirmed;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 5,
      padding: "2px 6px",
      borderRadius: 4,
      background: status.bg,
      borderLeft: `3px solid ${status.border}`,
      overflow: "hidden",
      width: "100%",
    }}>
      <span style={{
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: "#fff",
        opacity: 0.85,
        flexShrink: 0,
      }} />
      <span style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        fontSize: 11,
        color: "#fff",
        fontWeight: 500,
      }}>
        {label}
      </span>
    </div>
  );
}

function EventModal({ event, onClose }) {
  if (!event) return null;

  const status = statusColors[event.extendedProps?.status] ?? statusColors.confirmed;
  const start = event.start ? formatTime(event.start) : "—";
  const end = event.end ? formatTime(event.end) : "—";
  const date = event.start ? formatFullDate(event.start) : "—";
  const statusKey = event.extendedProps?.status ?? "confirmed";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 1000, backdropFilter: "blur(2px)" }}
      />

      {/* Modal */}
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#fff", border: "0.5px solid #e0e0da", borderRadius: 14, width: "100%", maxWidth: 380, zIndex: 1001, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>

        {/* Colored top bar */}
        <div style={{ height: 5, background: status.bg }} />

        <div style={{ padding: "1.25rem 1.5rem" }}>

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: status.light, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="ti ti-building" style={{ fontSize: 18, color: status.text }} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 2px" }}>{event.title}</p>
                <span style={{ fontSize: 11, fontWeight: 500, background: status.light, color: status.text, border: `0.5px solid ${status.lightBorder}`, borderRadius: 20, padding: "2px 8px", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: status.bg, display: "inline-block" }} />
                  {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
                </span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18, padding: 0, lineHeight: 1, flexShrink: 0 }}>
              <i className="ti ti-x" />
            </button>
          </div>

          {/* Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.75rem 1rem", background: "#f5f5f3", borderRadius: 8 }}>
              <i className="ti ti-calendar" style={{ fontSize: 15, color: "#888", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 10, color: "#aaa", margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Date</p>
                <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{date}</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.75rem 1rem", background: "#f5f5f3", borderRadius: 8 }}>
              <i className="ti ti-clock" style={{ fontSize: 15, color: "#888", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 10, color: "#aaa", margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Time</p>
                <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{start} — {end}</p>
              </div>
            </div>

            {event.extendedProps?.reserved_by && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.75rem 1rem", background: "#f5f5f3", borderRadius: 8 }}>
                <i className="ti ti-user" style={{ fontSize: 15, color: "#888", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 10, color: "#aaa", margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Reserved by</p>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{event.extendedProps.reserved_by}</p>
                </div>
              </div>
            )}

            {event.extendedProps?.purpose && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "0.75rem 1rem", background: "#f5f5f3", borderRadius: 8 }}>
                <i className="ti ti-notes" style={{ fontSize: 15, color: "#888", flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 10, color: "#aaa", margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Purpose</p>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{event.extendedProps.purpose}</p>
                </div>
              </div>
            )}

          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{ width: "100%", marginTop: "1.25rem", padding: "8px", background: "none", border: "0.5px solid #e0e0da", borderRadius: 8, fontSize: 12, color: "#666", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f5f5f3"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    try {
      const response = await API.get("/reservations/calendar/");
      const colored = response.data.map((ev) => {
        const s = statusColors[ev.status] ?? statusColors.confirmed;
        return { ...ev, backgroundColor: s.bg, borderColor: s.border, textColor: "#fff" };
      });
      setEvents(colored);
    } catch (error) {
      setError("Failed to load calendar events.");
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
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
          onMouseEnter={e => e.currentTarget.style.background = "#f5f5f3"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >
          <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
          Back to Dashboard
        </button>
      </header>

      <div style={{ padding: "1.5rem", maxWidth: 1000, margin: "0 auto" }}>

        {/* Page title */}
        <div style={{ marginBottom: "1.25rem" }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 2px" }}>Reservation Calendar</h1>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>Click any reservation to view full details.</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FCEBEB", border: "0.5px solid #F7C1C1", borderRadius: 8, padding: "8px 12px", marginBottom: "1rem" }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 16, color: "#A32D2D", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#A32D2D" }}>{error}</span>
          </div>
        )}

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "1rem", flexWrap: "wrap" }}>
          {Object.entries(statusColors).map(([status, { bg }]) => (
            <div key={status} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: bg, display: "inline-block" }} />
              <span style={{ fontSize: 11, color: "#666", textTransform: "capitalize" }}>{status}</span>
            </div>
          ))}
        </div>

        {/* Calendar card */}
        <div style={{ background: "#fff", border: "0.5px solid #e0e0da", borderRadius: 12, padding: "1.25rem", overflow: "hidden" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#888", fontSize: 13, padding: "2rem 0", justifyContent: "center" }}>
              <i className="ti ti-loader" style={{ fontSize: 16 }} />
              Loading calendar...
            </div>
          ) : (
            <>
              <style>{`
                .fc { font-family: sans-serif; font-size: 13px; }
                .fc-toolbar-title { font-size: 15px !important; font-weight: 500 !important; color: #333; }
                .fc-button { background: none !important; border: 0.5px solid #e0e0da !important; color: #666 !important; font-size: 12px !important; border-radius: 8px !important; padding: 4px 10px !important; box-shadow: none !important; }
                .fc-button:hover { background: #f5f5f3 !important; }
                .fc-button-active, .fc-button-primary:not(:disabled).fc-button-active { background: #E6F1FB !important; color: #185FA5 !important; border-color: #A8C8F0 !important; }
                .fc-today-button { background: #185FA5 !important; color: #fff !important; border-color: #185FA5 !important; }
                .fc-today-button:hover { background: #1470bb !important; }
                .fc-daygrid-day.fc-day-today { background: #EDFAF3 !important; }
                .fc-col-header-cell { font-size: 11px; font-weight: 500; color: #888; text-transform: uppercase; letter-spacing: 0.04em; padding: 8px 0 !important; border-color: #e0e0da !important; }
                .fc-daygrid-day { border-color: #e0e0da !important; }
                .fc-scrollgrid { border-color: #e0e0da !important; }
                .fc-scrollgrid td, .fc-scrollgrid th { border-color: #e0e0da !important; }
                .fc-event { border-radius: 4px !important; font-size: 11px !important; cursor: pointer; }
                .fc-event:hover { opacity: 0.85; }
                .fc-daygrid-day-number { font-size: 12px; color: #555; padding: 6px 8px !important; }
                .fc-daygrid-event-harness { margin-bottom: 2px !important; }
              `}</style>
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={events}
                eventContent={renderEventContent}
                eventClick={handleEventClick}
                height="75vh"
                headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
              />
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}

export default Calendar;