import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import logo from "../assets/RoomMate.png";
import bgImage from "../assets/pupschool.png";

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

  const poppins = { fontFamily: "'Poppins', sans-serif" };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');`}</style>

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
                Room<span style={{ color: "#C9991A" }}>Mate</span>
              </p>
              <p style={{ ...poppins, fontSize: 12, color: "#888", margin: 0 }}>Room Reservation System</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FDF2F2", border: "0.5px solid #D49090", borderRadius: 8, padding: "8px 12px", marginBottom: "1rem" }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 16, color: "#7A1C1C", flexShrink: 0 }} />
              <span style={{ ...poppins, fontSize: 12, color: "#7A1C1C" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister}>

            {/* Username */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ ...poppins, display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 6 }}>Username</label>
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

            {/* Email */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ ...poppins, display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 6 }}>Email</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <i className="ti ti-mail" style={{ position: "absolute", left: 10, fontSize: 16, color: "#aaa", pointerEvents: "none" }} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ ...poppins, width: "100%", padding: "8px 10px 8px 34px", fontSize: 13, border: "0.5px solid #ccc", borderRadius: 8, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ ...poppins, display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <i className="ti ti-lock" style={{ position: "absolute", left: 10, fontSize: 16, color: "#aaa", pointerEvents: "none" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...poppins, width: "100%", padding: "8px 34px 8px 34px", fontSize: 13, border: "0.5px solid #ccc", borderRadius: 8, outline: "none", boxSizing: "border-box" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 10, background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 16, padding: 0, display: "flex" }}>
                  <i className={showPassword ? "ti ti-eye-off" : "ti ti-eye"} />
                </button>
              </div>
            </div>

            {/* Role */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ ...poppins, display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 6 }}>Role</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <i className="ti ti-id-badge" style={{ position: "absolute", left: 10, fontSize: 16, color: "#aaa", pointerEvents: "none" }} />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ ...poppins, width: "100%", padding: "8px 10px 8px 34px", fontSize: 13, border: "0.5px solid #ccc", borderRadius: 8, outline: "none", boxSizing: "border-box", background: "#fff", appearance: "none", cursor: "pointer" }}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
                <i className="ti ti-chevron-down" style={{ position: "absolute", right: 10, fontSize: 14, color: "#aaa", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ ...poppins, width: "100%", padding: 9, background: loading ? "#B87070" : "#7A1C1C", color: loading ? "#FAEAEA" : "#F0C040", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <i className="ti ti-user-plus" />
              {loading ? "Creating account..." : "Create account"}
            </button>

          </form>

          <hr style={{ border: "none", borderTop: "0.5px solid #e0e0da", margin: "1.25rem 0" }} />

          {/* Back to Login */}
          <p style={{ ...poppins, fontSize: 12, color: "#666", textAlign: "center", margin: 0 }}>
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
    </>
  );
}