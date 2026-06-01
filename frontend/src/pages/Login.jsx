import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";
import logo from "../assets/RoomMate.png";
import bgImage from "../assets/pupschool.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.message;

  useEffect(() => {
    if (sessionStorage.getItem("sessionExpired") === "true") {
      setSessionExpired(true);
      sessionStorage.removeItem("sessionExpired");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    setSessionExpired(false);
    try {
      const response = await API.post("auth/login/", { username, password });
      const user = response.data.data.user;
      localStorage.clear();
      localStorage.setItem("token", response.data.data.tokens.access);
      localStorage.setItem("role", user.role);
      localStorage.setItem("username", user.username);
      if (user?.email) {
        localStorage.setItem("email", user.email);
      }
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  const poppins = { fontFamily: "'Poppins', sans-serif" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        ...poppins,
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        position: "relative",
      }}>

        {/* Dark overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(90, 0, 0, 0.55)",
        }} />

        {/* Card */}
        <div style={{
          position: "relative",
          background: "#fff", border: "0.5px solid #C9A02A",
          borderRadius: 12, padding: "2rem 1.75rem",
          width: "100%", maxWidth: 360,
        }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.75rem" }}>
            <img
              src={logo}
              alt="RoomMate logo"
              style={{ width: 42, height: 42, objectFit: "contain", flexShrink: 0 }}
            />
            <div>
              <p style={{ ...poppins, fontSize: 18, fontWeight: 600, color: "#7A1C1C", margin: "0 0 2px" }}>
                Room<span style={{ color: "#F0C040" }}>Mate</span>
              </p>
              <p style={{ ...poppins, fontSize: 12, color: "#888", margin: 0, fontWeight: 600 }}>
                Room Reservation System
              </p>
            </div>
          </div>

          {/* Session expired banner */}
          {sessionExpired && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              background: "#FFF8EC", border: "0.5px solid #E0B030",
              borderLeft: "3px solid #C9991A", borderRadius: 8,
              padding: "10px 12px", marginBottom: "1rem",
              animation: "slideDown 0.2s ease",
            }}>
              <i className="ti ti-clock-exclamation" style={{ fontSize: 16, color: "#C9991A", flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ ...poppins, fontSize: 12, fontWeight: 600, color: "#7A4F00", margin: "0 0 2px" }}>
                  Session expired
                </p>
                <p style={{ ...poppins, fontSize: 11, color: "#9A6A20", margin: 0, lineHeight: 1.5 }}>
                  You were signed out due to inactivity. Please log in again to continue.
                </p>
              </div>
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#EDFAF3", border: "0.5px solid #A8DFC1", borderRadius: 8, padding: "8px 12px", marginBottom: "1rem" }}>
              <i className="ti ti-circle-check" style={{ fontSize: 16, color: "#1E7D4B", flexShrink: 0 }} />
              <span style={{ ...poppins, fontSize: 12, color: "#1E7D4B" }}>{successMessage}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FDF2F2", border: "0.5px solid #D49090", borderRadius: 8, padding: "8px 12px", marginBottom: "1rem" }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 16, color: "#7A1C1C", flexShrink: 0 }} />
              <span style={{ ...poppins, fontSize: 12, color: "#7A1C1C" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Username */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ ...poppins, display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 6 }}>
                Username
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <i className="ti ti-user" style={{ position: "absolute", left: 10, fontSize: 16, color: "#aaa", pointerEvents: "none" }} />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ ...poppins, width: "100%", padding: "8px 10px 8px 34px", fontSize: 13, border: "0.5px solid #ccc", borderRadius: 8, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ ...poppins, display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <i className="ti ti-lock" style={{ position: "absolute", left: 10, fontSize: 16, color: "#aaa", pointerEvents: "none" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ ...poppins, width: "100%", padding: "8px 34px 8px 34px", fontSize: 13, border: "0.5px solid #ccc", borderRadius: 8, outline: "none", boxSizing: "border-box" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 10, background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 16, padding: 0, display: "flex" }}>
                  <i className={showPassword ? "ti ti-eye-off" : "ti ti-eye"} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ ...poppins, width: "100%", padding: 9, background: loading ? "#B87070" : "#7A1C1C", color: loading ? "#FAEAEA" : "#F0C040", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <i className="ti ti-login" />
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <hr style={{ border: "none", borderTop: "0.5px solid #e0e0da", margin: "1.25rem 0" }} />

          <p style={{ ...poppins, fontSize: 12, color: "#666", textAlign: "center", margin: "0 0 0.75rem" }}>
            Don't have an account?{" "}
            <a href="/register"
              onClick={(e) => { e.preventDefault(); navigate("/register"); }}
              style={{ color: "#185FA5", fontWeight: 500, textDecoration: "none" }}
              onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
              onMouseLeave={(e) => e.target.style.textDecoration = "none"}
            >
              Create an account
            </a>
          </p>

          <p style={{ ...poppins, fontSize: 11, color: "#aaa", textAlign: "center", margin: 0 }}>
            Contact your administrator if you need access.
          </p>

        </div>
      </div>
    </>
  );
}