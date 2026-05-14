import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";  // ← add this

export default function Notifications() {

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();  // ← add this

  useEffect(() => {

    const fetchNotifications = async () => {

      try {
        const res = await API.get("/notifications/");
        setNotifications(res.data);
      } catch (err) {
        console.log("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }

    };

    fetchNotifications();

  }, []);

  if (loading) {
    return <h2>Loading notifications...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>

      <button onClick={() => navigate("/dashboard")}>← Back</button>

      <h1>Notifications</h1>

      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        notifications.map((notif) => (
          <div
            key={notif.id}
            style={{
              border: "1px solid #ccc",
              margin: "10px 0",
              padding: "10px",
              borderRadius: "8px"
            }}
          >

            <h3>{notif.title}</h3>
            <p>{notif.message}</p>
            <small>
              {new Date(notif.created_at).toLocaleString()}
            </small>

          </div>
        ))
      )}

    </div>
  );
}