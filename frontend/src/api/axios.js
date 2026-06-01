import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Show session expired banner then redirect ─────────────────────────────
function showSessionExpiredBanner() {
  // Prevent duplicate banners
  if (document.getElementById("session-expired-banner")) return;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-100%); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shrink {
      from { width: 100%; }
      to   { width: 0%; }
    }
  `;
  document.head.appendChild(style);

  // Dim overlay
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.40);
    z-index: 9998;
    pointer-events: none;
  `;
  document.body.appendChild(overlay);

  // Banner
  const banner = document.createElement("div");
  banner.id = "session-expired-banner";
  banner.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 9999;
    background: #8B0000;
    border-bottom: 3px solid #C9991A;
    padding: 0.85rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    font-family: 'Poppins', sans-serif;
    animation: slideDown 0.25s ease;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  `;

  banner.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px;">
      <div style="
        width:34px; height:34px; border-radius:8px;
        background:rgba(201,153,26,0.2);
        border:0.5px solid rgba(201,153,26,0.5);
        display:flex; align-items:center; justify-content:center;
        flex-shrink:0;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="#F5D98A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div>
        <p style="font-size:13px; font-weight:600; color:#FFFFFF; margin:0 0 2px;">
          Session expired
        </p>
        <p style="font-size:12px; color:#F5D98A; margin:0;">
          You'll be redirected to the login page in a moment...
        </p>
      </div>
    </div>

    <div style="
      flex:1; min-width:120px; max-width:200px;
      height:4px; background:rgba(255,255,255,0.15);
      border-radius:2px; overflow:hidden;
    ">
      <div style="
        height:100%; background:#C9991A; border-radius:2px;
        animation: shrink 3s linear forwards;
      "></div>
    </div>

    <button id="session-signin-now" style="
      background:none;
      border:0.5px solid rgba(201,153,26,0.5);
      border-radius:8px; padding:5px 12px;
      font-size:12px; color:#F5D98A; cursor:pointer;
      font-family:'Poppins',sans-serif; font-weight:500;
      display:flex; align-items:center; gap:5px;
      flex-shrink:0;
    ">
      Sign in now
    </button>
  `;

  document.body.appendChild(banner);

  const doRedirect = () => {
    sessionStorage.setItem("sessionExpired", "true");
    window.location.href = "/";
  };

  // Auto redirect after 3 seconds
  const timer = setTimeout(doRedirect, 3000);

  // Manual redirect
  document.getElementById("session-signin-now")?.addEventListener("click", () => {
    clearTimeout(timer);
    doRedirect();
  });
}

// ── Handle 401 — token expired or invalid ────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const wasLoggedIn = !!localStorage.getItem("token");
      localStorage.clear();
      if (wasLoggedIn) {
        showSessionExpiredBanner();
      }
    }
    return Promise.reject(error);
  }
);

export default API;