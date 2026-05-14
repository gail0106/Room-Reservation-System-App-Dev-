import { useState } from "react";

import { useNavigate } from "react-router-dom";

import API from "../api/axios";

export default function Login() {

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const response = await API.post("/token/", {

        username,
        password,

      });

      localStorage.setItem(
        "token",
        response.data.access
      );

      navigate("/dashboard");

    } catch (err) {

      setError("Invalid username or password");

    }
  };

  return (

    <div>

      <h1>Login</h1>

      <form onSubmit={handleLogin}>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br /><br />

        <button type="submit">
          Login
        </button>

      </form>

      {error && <p>{error}</p>}

    </div>
  );
}