import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register/", {
        username,
        email,
        password,
        role,
      });

      alert("Registration successful!");
      navigate("/");

    } catch (error) {
      console.log(error.response?.data);
      alert("Registration failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>Register</h1>

      <form onSubmit={handleRegister}>

        <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
        <br /><br />

        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <br /><br />

        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <br /><br />

        <select onChange={(e) => setRole(e.target.value)}>

          <option value="student">Student</option>
          <option value="admin">Admin</option>

        </select>

        <br /><br />

        <button type="submit">Register</button>

      </form>

    </div>
  );
}