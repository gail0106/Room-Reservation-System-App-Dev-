import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      backgroundColor: '#f59e0b',
      color: 'white',
      textAlign: 'center',
      fontSize: '14px',
      padding: '8px 16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      You are offline. Showing cached data - some features may be unavailable.
    </div>
  );
}