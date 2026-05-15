import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await API.post("/token/", { username, password });
      localStorage.setItem("token", response.data.access);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f3", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#fff", border: "0.5px solid #e0e0da", borderRadius: 12, padding: "2rem 1.75rem", width: "100%", maxWidth: 360 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.75rem" }}>
          <div style={{ width: 38, height: 38, background: "#E6F1FB", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-school" style={{ fontSize: 20, color: "#185FA5" }} />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 500, margin: "0 0 2px" }}>PUPSantaRosa</p>
            <p style={{ fontSize: 12, color: "#888", margin: 0 }}>Room Reservation System</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FCEBEB", border: "0.5px solid #F7C1C1", borderRadius: 8, padding: "8px 12px", marginBottom: "1rem" }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 16, color: "#A32D2D", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#A32D2D" }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Username */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 6 }}>Username</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <i className="ti ti-user" style={{ position: "absolute", left: 10, fontSize: 16, color: "#aaa", pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: "100%", padding: "8px 10px 8px 34px", fontSize: 13, border: "0.5px solid #ccc", borderRadius: 8, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <i className="ti ti-lock" style={{ position: "absolute", left: 10, fontSize: 16, color: "#aaa", pointerEvents: "none" }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "8px 34px 8px 34px", fontSize: 13, border: "0.5px solid #ccc", borderRadius: 8, outline: "none", boxSizing: "border-box" }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 10, background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 16, padding: 0, display: "flex" }}>
                <i className={showPassword ? "ti ti-eye-off" : "ti ti-eye"} />
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: 9, background: loading ? "#85B7EB" : "#185FA5", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <i className="ti ti-login" />
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <hr style={{ border: "none", borderTop: "0.5px solid #e0e0da", margin: "1.25rem 0" }} />
        <p style={{ fontSize: 11, color: "#aaa", textAlign: "center", margin: 0 }}>
          Contact your administrator if you need access.
        </p>
      </div>
    </div>
  );
}