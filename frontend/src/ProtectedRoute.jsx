import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { isTokenExpired } from "../utils/tokenUtils";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  const [showBanner, setShowBanner] = useState(false);
  const [redirect, setRedirect]     = useState(false);

  useEffect(() => {
    if (!token || isTokenExpired(token)) {
      const wasLoggedIn = !!token;
      localStorage.clear();

      if (wasLoggedIn) {
        // Show banner for 3 seconds then redirect
        setShowBanner(true);
        const timer = setTimeout(() => {
          sessionStorage.setItem("sessionExpired", "true");
          setRedirect(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [token]);

  // Hard redirect after banner
  if (redirect) return <Navigate to="/" replace />;

  // No token at all — redirect immediately, no banner
  if (!token) return <Navigate to="/" replace />;

  // Role guard
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      {/* Session expired banner — overlays the current page */}
      {showBanner && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0,
          zIndex: 9999,
          background: "#8B0000",
          borderBottom: "3px solid #C9991A",
          padding: "0.85rem 1.5rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12, flexWrap: "wrap",
          fontFamily: "'Poppins', sans-serif",
          animation: "slideDown 0.25s ease",
        }}>
          <style>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-100%); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: "rgba(201,153,26,0.2)",
              border: "0.5px solid rgba(201,153,26,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <i className="ti ti-clock-exclamation" style={{ fontSize: 18, color: "#F5D98A" }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", margin: "0 0 2px" }}>
                Session expired
              </p>
              <p style={{ fontSize: 12, color: "#F5D98A", margin: 0 }}>
                You'll be redirected to the login page in a moment...
              </p>
            </div>
          </div>

          {/* Countdown bar */}
          <div style={{
            flex: 1, minWidth: 120, maxWidth: 200,
            height: 4, background: "rgba(255,255,255,0.15)",
            borderRadius: 2, overflow: "hidden",
          }}>
            <div style={{
              height: "100%", background: "#C9991A",
              borderRadius: 2,
              animation: "shrink 3s linear forwards",
            }} />
            <style>{`
              @keyframes shrink {
                from { width: 100%; }
                to   { width: 0%; }
              }
            `}</style>
          </div>

          {/* Manual redirect link */}
          <button
            onClick={() => { sessionStorage.setItem("sessionExpired", "true"); setRedirect(true); }}
            style={{
              background: "none", border: "0.5px solid rgba(201,153,26,0.5)",
              borderRadius: 8, padding: "5px 12px",
              fontSize: 12, color: "#F5D98A", cursor: "pointer",
              fontFamily: "'Poppins', sans-serif", fontWeight: 500,
              display: "flex", alignItems: "center", gap: 5,
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#C9991A"; e.currentTarget.style.color = "#FFFFFF"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#F5D98A"; }}
          >
            <i className="ti ti-login" style={{ fontSize: 13 }} />
            Sign in now
          </button>
        </div>
      )}

      {/* Dim overlay behind banner */}
      {showBanner && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 9998,
          pointerEvents: "none",
        }} />
      )}

      {children}
    </>
  );
}