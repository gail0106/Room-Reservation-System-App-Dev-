import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Reservations from "./pages/Reservations";
import AdminReservations from "./pages/AdminReservations";
import Calendar from "./pages/Calendar";
import Notifications from "./pages/Notifications";

function App() {

  return (

    <Routes>

      <Route path="/" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/rooms" element={<Rooms />} />

      <Route path="/reservations" element={<Reservations />} />

      <Route path="/adminreservations" element={<AdminReservations />} />

      <Route path="/calendar" element={<Calendar />} />

      <Route path="/notifications" element={<Notifications />} />

    </Routes>

  );
}

export default App;