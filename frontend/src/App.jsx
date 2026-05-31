import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Reservations from "./pages/Reservations";
import AdminReservations from "./pages/AdminReservations";
import AdminRooms from "./pages/AdminRooms";
import Calendar from "./pages/Calendar";
import Notifications from "./pages/Notifications";
import ProtectedRoute from "./routes/ProtectedRoute";
import VoiceAssistant from "./components/VoiceAssistant";



function App() {

  return (
    <>
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* All logged-in users */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
      <Route path="/reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

      {/* Admin only */}
      <Route path="/admin/reservations" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminReservations />
        </ProtectedRoute>
      } />
      <Route path="/admin/rooms" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminRooms />
        </ProtectedRoute>
      } />
    </Routes>

    </>
  );
}

export default App;