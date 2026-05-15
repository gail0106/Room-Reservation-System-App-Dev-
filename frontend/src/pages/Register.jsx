import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/register/", { username, email, password, role });
      navigate("/", { state: { message: "Account created! You can now sign in." } });
    } catch (error) {
      setError("Registration failed. Please try again.");
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

        <form onSubmit={handleRegister}>

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

          {/* Email */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 6 }}>Email</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <i className="ti ti-mail" style={{ position: "absolute", left: 10, fontSize: 16, color: "#aaa", pointerEvents: "none" }} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "8px 10px 8px 34px", fontSize: 13, border: "0.5px solid #ccc", borderRadius: 8, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1rem" }}>
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

          {/* Role */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 6 }}>Role</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <i className="ti ti-id-badge" style={{ position: "absolute", left: 10, fontSize: 16, color: "#aaa", pointerEvents: "none" }} />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: "100%", padding: "8px 10px 8px 34px", fontSize: 13, border: "0.5px solid #ccc", borderRadius: 8, outline: "none", boxSizing: "border-box", background: "#fff", appearance: "none", cursor: "pointer" }}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
              <i className="ti ti-chevron-down" style={{ position: "absolute", right: 10, fontSize: 14, color: "#aaa", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: 9, background: loading ? "#85B7EB" : "#185FA5", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <i className="ti ti-user-plus" />
            {loading ? "Creating account..." : "Create account"}
          </button>

        </form>

        <hr style={{ border: "none", borderTop: "0.5px solid #e0e0da", margin: "1.25rem 0" }} />

        {/* Back to Login */}
        <p style={{ fontSize: 12, color: "#666", textAlign: "center", margin: 0 }}>
          Already have an account?{" "}
          
          <a href="/"
            onClick={(e) => { e.preventDefault(); navigate("/"); }}
            style={{ color: "#185FA5", fontWeight: 500, textDecoration: "none" }}
            onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
            onMouseLeave={(e) => e.target.style.textDecoration = "none"}
          >
            Sign in
          </a>
        </p>

      </div>
    </div>
  );
}