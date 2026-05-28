import { useNavigate } from "react-router-dom";
import useVoiceCommands from "../voice/useVoiceCommands";
 
export default function VoiceButton() {
  const navigate = useNavigate();
  const {
    displayTranscript,
    listening,
    isSpeaking,
    assistantActive,
    startListening,
    stopListening,
  } = useVoiceCommands(navigate);
 
  const getState = () => {
    if (listening) return "listening";
    if (isSpeaking) return "speaking";
    if (assistantActive) return "active";
    return "inactive";
  };
 
  const state = getState();
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700&display=swap');
 
        /* ── Fixed floating container ── */
        .voice-float {
          position: fixed;
          bottom: 32px;
          right: 32px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          font-family: 'DM Mono', monospace;
        }
 
        /* ── Transcript dialogue box ── */
        .transcript-box {
          width: 260px;
          background: rgba(12, 12, 12, 0.93);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px;
          padding: 12px 15px;
          position: relative;
          box-shadow: 0 12px 40px rgba(0,0,0,0.45);
          animation: box-in 0.22s cubic-bezier(0.34,1.56,0.64,1);
          backdrop-filter: blur(12px);
        }
        @keyframes box-in {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
 
        /* speech-bubble tail — points down-right toward the mic */
        .transcript-box::after {
          content: '';
          position: absolute;
          bottom: -8px;
          right: 28px;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid rgba(12,12,12,0.93);
        }
 
        .transcript-label {
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          margin: 0 0 5px;
        }
        .transcript-text {
          font-size: 13px;
          line-height: 1.6;
          color: rgba(255,255,255,0.9);
          margin: 0;
          word-break: break-word;
        }
 
        /* blinking cursor while listening */
        .cursor {
          display: inline-block;
          width: 2px;
          height: 13px;
          background: #4ade80;
          margin-left: 3px;
          vertical-align: middle;
          animation: blink 0.85s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
 
        /* ── Bottom row: label + ring ── */
        .voice-bottom-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
 
        /* ── Status label ── */
        .voice-label {
          font-family: 'Syne', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          transition: color 0.3s;
          white-space: nowrap;
        }
        .voice-label.inactive  { color: #7f1d1d; }
        .voice-label.speaking  { color: #ca8a04; }
        .voice-label.listening { color: #15803d; }
        .voice-label.active    { color: #991b1b; }
 
        /* ── Outer ring (holds pulse rings) ── */
        .voice-ring {
          position: relative;
          width: 68px;
          height: 68px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: transform 0.15s ease;
        }
        .voice-ring:hover  { transform: scale(1.07); }
        .voice-ring:active { transform: scale(0.96); }
 
        /* Pulse rings — only when listening */
        .voice-ring::before,
        .voice-ring::after {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          opacity: 0;
          border: 2px solid transparent;
        }
        .voice-ring.listening::before {
          border-color: #4ade80;
          animation: pulse-ring 1.5s ease-out infinite;
        }
        .voice-ring.listening::after {
          border-color: #4ade80;
          animation: pulse-ring 1.5s ease-out infinite 0.48s;
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);    opacity: 0.65; }
          100% { transform: scale(1.65); opacity: 0;    }
        }
 
        /* ── Circle button ── */
        .voice-circle {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          outline: none;
          transition: background 0.35s ease, box-shadow 0.35s ease;
        }
 
        .voice-circle.inactive {
          background: radial-gradient(circle at 35% 30%, #991b1b, #450a0a);
          box-shadow: 0 6px 22px rgba(127,29,29,0.55), inset 0 1px 0 rgba(255,255,255,0.07);
        }
        .voice-circle.active {
          background: radial-gradient(circle at 35% 30%, #991b1b, #450a0a);
          box-shadow: 0 6px 22px rgba(127,29,29,0.55), inset 0 1px 0 rgba(255,255,255,0.07);
        }
        .voice-circle.speaking {
          background: radial-gradient(circle at 35% 30%, #fde047, #b45309);
          box-shadow: 0 6px 26px rgba(253,224,71,0.5), inset 0 1px 0 rgba(255,255,255,0.12);
        }
        .voice-circle.listening {
          background: radial-gradient(circle at 35% 30%, #4ade80, #14532d);
          box-shadow: 0 6px 26px rgba(74,222,128,0.5), inset 0 1px 0 rgba(255,255,255,0.12);
        }
 
        /* glass sheen */
        .voice-circle::before {
          content: '';
          position: absolute;
          top: -38%;
          left: -38%;
          width: 75%;
          height: 75%;
          background: radial-gradient(circle, rgba(255,255,255,0.16), transparent 65%);
          border-radius: 50%;
          pointer-events: none;
        }
 
        /* ── Mic icon ── */
        .mic-icon {
          width: 26px;
          height: 26px;
          position: relative;
          z-index: 1;
          transition: transform 0.2s ease;
        }
        .voice-circle:hover .mic-icon { transform: scale(1.1); }
        .mic-icon svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
        }
 
        /* bob animation while speaking */
        .voice-circle.speaking .mic-icon {
          animation: mic-bob 0.55s ease-in-out infinite alternate;
        }
        @keyframes mic-bob {
          from { transform: scale(1);    }
          to   { transform: scale(1.14); }
        }
      `}</style>
 
      <div className="voice-float">
 
        {/* Transcript bubble — above the mic row */}
        {displayTranscript && (
          <div className="transcript-box">
            <p className="transcript-label">Transcript</p>
            <p className="transcript-text">
              {displayTranscript}
              {listening && <span className="cursor" />}
            </p>
          </div>
        )}
 
        {/* Label + mic button on same row */}
        <div className="voice-bottom-row">
          <span className={`voice-label ${state}`}>
            {state === "listening" && "Listening…"}
            {state === "speaking"  && "Speaking…"}
            {state === "inactive"  && "Voice off"}
            {state === "active"    && "Ready"}
          </span>
 
          <div className={`voice-ring ${state}`}>
            <button
              className={`voice-circle ${state}`}
              onClick={assistantActive ? stopListening : startListening}
              aria-label={assistantActive ? "Stop assistant" : "Start assistant"}
            >
              <span className="mic-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="9" y="2" width="6" height="11" rx="3" fill="white" opacity="0.95"/>
                  <path d="M5 11a7 7 0 0 0 14 0" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.95"/>
                  <line x1="12" y1="18" x2="12" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
                  <line x1="9"  y1="21" x2="15" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
                </svg>
              </span>
            </button>
          </div>
        </div>
 
      </div>
    </>
  );
}