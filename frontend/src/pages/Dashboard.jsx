import { useNavigate } from "react-router-dom";

export default function Dashboard() {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>Room Reservation Dashboard</h1>

      <p>Welcome user 👋</p>

      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>

        <button onClick={() => navigate("/rooms")}>
          View Rooms
        </button>

        <button onClick={() => navigate("/reservations")}>
          My Reservations
        </button>

        <button onClick={() => navigate("/calendar")}>
          Calendar
        </button>

        <button onClick={() => navigate("/notifications")}>
          Notifications
        </button>

        <button onClick={handleLogout}>
          Logout
        </button>

      </div>

    </div>
  );
}