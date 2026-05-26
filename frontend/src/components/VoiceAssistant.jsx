import { useNavigate } from "react-router-dom";
import useVoiceCommands from "../voice/useVoiceCommands";

export default function VoiceAssistant() {
  const navigate = useNavigate();

  const {
    displayTranscript,   // <-- was transcript
    listening,
    isSpeaking,
    assistantActive,
    statusMessage,
    startListening,
    stopListening,
  } = useVoiceCommands(navigate);

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%   { transform: scale(1);    box-shadow: 0 0 0 0   rgba(201,153,26,0.7); }
          70%  { transform: scale(1.08); box-shadow: 0 0 0 18px rgba(201,153,26,0);   }
          100% { transform: scale(1);    box-shadow: 0 0 0 0   rgba(201,153,26,0);   }
        }
        @keyframes speakPulse {
          0%,100% { transform: scale(1);    box-shadow: 0 0 0 0   rgba(30,125,75,0.7); }
          70%     { transform: scale(1.08); box-shadow: 0 0 0 18px rgba(30,125,75,0);   }
        }
      `}</style>

      <button
        onClick={() => (assistantActive ? stopListening() : startListening())}
        title={assistantActive ? "Stop assistant" : "Start assistant"}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 64,
          height: 64,
          borderRadius: "50%",
          border: "none",
          background: isSpeaking ? "#1E7D4B" : listening ? "#C9991A" : "#8B0000",
          color: "#FFFFFF",
          fontSize: 28,
          cursor: "pointer",
          zIndex: 9999,
          boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
          transition: "background 0.3s ease",
          animation: isSpeaking
            ? "speakPulse 1.5s infinite"
            : listening
            ? "pulse 1.5s infinite"
            : "none",
        }}
      >
        <i className={isSpeaking ? "ti ti-volume" : "ti ti-microphone"} />
      </button>

      {assistantActive && (
        <div
          style={{
            position: "fixed",
            bottom: 100,
            right: 24,
            width: 280,
            background: "#FFF8E7",
            border: "1px solid #E0C070",
            borderRadius: 14,
            padding: "14px 16px",
            zIndex: 9999,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          }}
        >
          <p style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            color: "#8B6000",
            letterSpacing: "0.04em",
          }}>
            PUP Assistant Active
          </p>

          <p style={{
            margin: "8px 0 0",
            fontSize: 13,
            color: statusMessage ? "#1E7D4B" : "#5A0000",
            fontWeight: statusMessage ? 600 : 400,
            wordBreak: "break-word",
            minHeight: 22,
            transition: "color 0.2s ease",
          }}>
            {statusMessage || displayTranscript || "Awaiting voice command..."}
          </p>

          <div style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: isSpeaking ? "#1E7D4B" : listening ? "#C9991A" : "#999999",
              transition: "background 0.3s ease",
            }} />
            <span style={{ fontSize: 11, color: "#7A6030" }}>
              {isSpeaking ? "Speaking..." : listening ? "Listening..." : "Reconnecting..."}
            </span>
          </div>
        </div>
      )}
    </>
  );
}