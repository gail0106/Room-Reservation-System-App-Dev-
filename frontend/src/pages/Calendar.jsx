import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import API from "../api/axios";

function Calendar() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await API.get("/reservations/calendar/");
      setEvents(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-5">
      <div className="flex items-center gap-4 mb-5">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Room Reservation Calendar</h1>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="80vh"
      />
    </div>
  );
}

export default Calendar;