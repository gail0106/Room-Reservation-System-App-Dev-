import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import API from "../api/axios";

import logo from "../assets/RoomMate.png";
import VoiceAssistant from "../components/VoiceAssistant";

const statusColors = {
  approved:  { bg: "#1D9E75", border: "#0F6E56", light: "#EDFAF3", text: "#1E7D4B", lightBorder: "#A8DFC1" },
  pending:   { bg: "#BA7517", border: "#854F0B", light: "#FAEEDA", text: "#854F0B", lightBorder: "#F0CA8A" },
  completed: { bg: "#378ADD", border: "#185FA5", light: "#E6F1FB", text: "#185FA5", lightBorder: "#A8C8F0" },
  cancelled: { bg: "#D94F4F", border: "#A32D2D", light: "#FCEBEB", text: "#A32D2D", lightBorder: "#F7C1C1" },
  rejected:  { bg: "#D94F4F", border: "#A32D2D", light: "#FCEBEB", text: "#A32D2D", lightBorder: "#F7C1C1" },
};

// ── New: dynamic color based on date ──────────────────────
function getEventColors(ev) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const evDate = new Date(ev.start);
  const evDay  = new Date(evDate.getFullYear(), evDate.getMonth(), evDate.getDate());

  // Past → gray regardless of status
  if (evDay < today) {
    return { bg: "#AAAAAA", border: "#888888", text: "#FFFFFF" };
  }
  // Today → green
  if (evDay.getTime() === today.getTime()) {
    return { bg: "#1D9E75", border: "#0F6E56", text: "#FFFFFF" };
  }
  // Future → use status color, fallback to gold
  const s = statusColors[ev.status] ?? { bg: "#C9991A", border: "#8B6000" };
  return { bg: s.bg, border: s.border, text: "#FFFFFF" };
}

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
  const label = end ? `${start} - ${end} ${event.title}` : `${start} ${event.title}`;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      padding: "2px 6px", borderRadius: 4,
      background: event.backgroundColor,
      borderLeft: `3px solid ${event.borderColor}`,
      overflow: "hidden", width: "100%",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", opacity: 0.85, flexShrink: 0 }} />
      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 11, color: "#fff", fontWeight: 500 }}>
        {label}
      </span>
    </div>
  );
}

function EventModal({ event, onClose }) {
  if (!event) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const evDay = event.start ? new Date(new Date(event.start).getFullYear(), new Date(event.start).getMonth(), new Date(event.start).getDate()) : null;

  let timeLabel = "Future";
  let timeLabelColor = "#1A5CA8";
  if (evDay) {
    if (evDay < today) { timeLabel = "Past"; timeLabelColor = "#888888"; }
    else if (evDay.getTime() === today.getTime()) { timeLabel = "Today"; timeLabelColor = "#1E7D4B"; }
  }

  const statusKey = event.extendedProps?.status ?? "pending";
  const status = statusColors[statusKey] ?? statusColors.pending;
  const start = event.start ? formatTime(event.start) : "—";
  const end = event.end ? formatTime(event.end) : "—";
  const date = event.start ? formatFullDate(event.start) : "—";

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, backdropFilter: "blur(2px)" }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#FFFFFF", border: "0.5px solid #D9C9A0",
        borderRadius: 14, width: "100%", maxWidth: 380,
        zIndex: 1001, overflow: "hidden",
        boxShadow: "0 8px 32px rgba(139,0,0,0.15)",
      }}>
        <div style={{ height: 5, background: evDay && evDay < today ? "#AAAAAA" : evDay && evDay.getTime() === today.getTime() ? "#1D9E75" : status.bg }} />

        <div style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: status.light, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="ti ti-building" style={{ fontSize: 18, color: status.text }} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px", color: "#3A2000" }}>{event.title}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 500,
                    background: status.light, color: status.text,
                    border: `0.5px solid ${status.lightBorder}`,
                    borderRadius: 20, padding: "2px 8px",
                    display: "inline-flex", alignItems: "center", gap: 4,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: status.bg, display: "inline-block" }} />
                    {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: timeLabelColor, background: "#F7F3EE",
                    borderRadius: 20, padding: "2px 8px",
                    border: "0.5px solid #D9C9A0",
                  }}>
                    {timeLabel}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#B0A080", fontSize: 18, padding: 0, lineHeight: 1 }}>
              <i className="ti ti-x" />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.75rem 1rem", background: "#FDF5DF", borderRadius: 8, border: "0.5px solid #EDE4D4" }}>
              <i className="ti ti-calendar" style={{ fontSize: 15, color: "#C9991A", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 10, color: "#B0A080", margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Date</p>
                <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: "#3A2000" }}>{date}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.75rem 1rem", background: "#FDF5DF", borderRadius: 8, border: "0.5px solid #EDE4D4" }}>
              <i className="ti ti-clock" style={{ fontSize: 15, color: "#C9991A", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 10, color: "#B0A080", margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Time</p>
                <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: "#3A2000" }}>{start} — {end}</p>
              </div>
            </div>
            {event.extendedProps?.reserved_by && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.75rem 1rem", background: "#FDF5DF", borderRadius: 8, border: "0.5px solid #EDE4D4" }}>
                <i className="ti ti-user" style={{ fontSize: 15, color: "#C9991A", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 10, color: "#B0A080", margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Reserved by</p>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: "#3A2000" }}>{event.extendedProps.reserved_by}</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              width: "100%", marginTop: "1.25rem", padding: "8px",
              background: "none", border: "0.5px solid #D9C9A0",
              borderRadius: 8, fontSize: 12, color: "#8B0000",
              cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontWeight: 500,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#8B0000"; e.currentTarget.style.color = "#FFFFFF"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#8B0000"; }}
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
      const allowed = ["approved", "completed"];
      const colored = response.data
        .filter(ev => allowed.includes(ev.status))
        .map((ev) => {
          const colors = getEventColors(ev);
          return { ...ev, backgroundColor: colors.bg, borderColor: colors.border, textColor: colors.text };
        });
      setEvents(colored);
    } catch {

      setError("Failed to load calendar events.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", minHeight: "100vh", background: "#F7F3EE" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'); * { font-family: 'Poppins', sans-serif; }`}</style>

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
          <i className="ti ti-arrow-left" style={{ fontSize: 14 }} /> Back to Dashboard
        </button>
      </header>

      <div style={{ padding: "1.5rem", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 2px", color: "#5A0000" }}>Reservation Calendar</h1>
          <p style={{ fontSize: 13, color: "#7A6030", margin: 0 }}>Click any reservation to view full details.</p>
        </div>

        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#F5E8E8", border: "0.5px solid #D9A0A0",
            borderRadius: 8, padding: "8px 12px", marginBottom: "1rem",
          }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 16, color: "#8B0000" }} />
            <span style={{ fontSize: 12, color: "#8B0000" }}>{error}</span>
          </div>
        )}

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "1rem", flexWrap: "wrap" }}>
          {[
            { dot: "#AAAAAA", label: "Past (Approved)" },
            { dot: "#1D9E75", label: "Today / Upcoming (Approved)" },
            { dot: "#378ADD", label: "Completed" },
          ].map(({ dot, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot, display: "inline-block" }} />
              <span style={{ fontSize: 11, color: "#7A6030" }}>{label}</span>
            </div>
          ))}
        </div>

        <div style={{
          background: "#FFFFFF", border: "0.5px solid #D9C9A0",
          borderRadius: 12, padding: "1.25rem", overflow: "hidden",
        }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#7A6030", fontSize: 13, padding: "2rem 0", justifyContent: "center" }}>
              <i className="ti ti-loader" style={{ fontSize: 16, color: "#C9991A" }} />
              Loading calendar...
            </div>
          ) : (
            <>
              <style>{`
                .fc { font-family: 'Poppins', sans-serif; font-size: 13px; }
                .fc-toolbar-title { font-size: 15px !important; font-weight: 600 !important; color: #5A0000; }
                .fc-button {
                  background: none !important; border: 0.5px solid #D9C9A0 !important;
                  color: #8B0000 !important; font-size: 12px !important;
                  border-radius: 8px !important; padding: 4px 10px !important;
                  box-shadow: none !important; font-family: 'Poppins', sans-serif !important; font-weight: 500 !important;
                }
                .fc-button:hover { background: #FDF5DF !important; border-color: #C9991A !important; }
                .fc-today-button { background: #8B0000 !important; color: #fff !important; border-color: #8B0000 !important; }
                .fc-today-button:hover { background: #C9991A !important; border-color: #C9991A !important; }
                .fc-daygrid-day.fc-day-today { background: #FDF5DF !important; }
                .fc-col-header-cell {
                  font-size: 11px; font-weight: 600; color: #8B0000;
                  text-transform: uppercase; letter-spacing: 0.05em;
                  padding: 8px 0 !important; border-color: #EDE4D4 !important;
                }
                .fc-daygrid-day { border-color: #EDE4D4 !important; }
                .fc-scrollgrid { border-color: #EDE4D4 !important; }
                .fc-scrollgrid td, .fc-scrollgrid th { border-color: #EDE4D4 !important; }
                .fc-event { border-radius: 4px !important; font-size: 11px !important; cursor: pointer; }
                .fc-event:hover { opacity: 0.85; }
                .fc-daygrid-day-number { font-size: 12px; color: #5A0000; padding: 6px 8px !important; font-weight: 500; }
                .fc-daygrid-event-harness { margin-bottom: 2px !important; }
              `}</style>
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={events}
                eventContent={renderEventContent}
                eventClick={(info) => setSelectedEvent(info.event)}
                height="75vh"
                headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
              />
            </>
          )}
        </div>
      </div>

      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
     <VoiceAssistant />
    </div>
  );
}

export default Calendar;