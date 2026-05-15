import { useEffect, useState } from "react";
import API from "../api/axios";

function AdminReservations() {

  const [reservations, setReservations] = useState([]);

  const fetchReservations = async () => {

    try {

      const response = await API.get("/reservations/");

      setReservations(response.data);

    } catch (error) {

      console.error(error);
    }
  };

  useEffect(() => {

    fetchReservations();

  }, []);

  const handleApproval = async (id, status) => {

    try {

      await API.patch(`/reservations/${id}/approve/`, {
        status: status,
      });

      fetchReservations();

    } catch (error) {

      console.error(error);
    }
  };

  return (

    <div>

      <h1>Admin Reservations</h1>

      {reservations
        .filter((reservation) => reservation.status === "pending")
        .map((reservation) => (

          <div key={reservation.id}>

            <p>Room: {reservation.room}</p>

            <p>User: {reservation.user}</p>

            <p>Status: {reservation.status}</p>

            <button
              onClick={() =>
                handleApproval(reservation.id, "approved")
              }
            >
              Approve
            </button>

            <button
              onClick={() =>
                handleApproval(reservation.id, "rejected")
              }
            >
              Reject
            </button>

            <hr />

          </div>
        ))}
    </div>
  );
}

export default AdminReservations;