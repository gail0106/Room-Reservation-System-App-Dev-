import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useVoiceCommands from "../voice/useVoiceCommands";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faMagnifyingGlass,
  faCompass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

export default function VoiceButton() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);

  const helpRef = useRef(null);

  const {
    displayTranscript,
    listening,
    isSpeaking,
    assistantActive,
    startListening,
    stopListening,
  } = useVoiceCommands(navigate);

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (helpRef.current && !helpRef.current.contains(event.target)) {
      setShowHelp(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  const getState = () => {
    if (listening) return "listening";
    if (isSpeaking) return "speaking";
    if (assistantActive) return "active";
    return "inactive";
  };

  const state = getState();

  const commands = [
    {
      icon: faCalendar,
      label: "Make a reservation",
      example: '"Reserve a room", "Book a room"',
    },
    {
      icon: faMagnifyingGlass,
      label: "Search for a room",
      example: '"Find a room on the 2nd floor for 40 people"',
    },
    {
      icon: faCompass,
      label: "Navigate pages",
      example: '"Open dashboard", "Go to rooms", "My bookings"',
    },
    {
      icon: faXmark,
      label: "Cancel a reservation",
      example: '"Cancel my booking", "I want to cancel"',
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700&display=swap');

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

        /* ── Help panel ── */
        .help-panel {
          width: 272px;
          background: #F7F3EE;
          border: 1.5px solid #C9991A;
          border-radius: 16px;
          padding: 14px 16px;
          box-shadow: 0 12px 40px rgba(139,0,0,0.18), 0 2px 8px rgba(201,153,26,0.12);
          animation: box-in 0.22s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
          overflow: hidden;
        }

        /* dark red top bar accent */
        .help-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #8B0000, #C9991A);
          border-radius: 16px 16px 0 0;
        }

        /* tail pointing down toward mic */
        .help-panel::after {
          content: '';
          position: absolute;
          bottom: -9px;
          right: 28px;
          border-left: 9px solid transparent;
          border-right: 9px solid transparent;
          border-top: 9px solid #C9991A;
        }

        .help-title {
          font-family: 'Syne', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #8B0000;
          margin: 4px 0 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .help-title::after {
          content: '';
          flex: 1;
          height: 0.5px;
          background: #C9991A;
          opacity: 0.4;
        }

        .help-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin-bottom: 0;
        }

        .help-item-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #5A0000;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.02em;
        }

        .help-item-example {
          font-size: 10.5px;
          color: #7A6030;
          line-height: 1.55;
          padding-left: 22px;
          font-style: italic;
          font-family: 'DM Mono', monospace;
        }

        .help-divider {
          height: 0.5px;
          background: #D9C9A0;
          margin: 8px 0;
        }

        /* ── Help button — floats above mic ── */
        .help-btn {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1.5px solid #C9991A;
          background: #8B0000;
          color: #F5D98A;
          font-size: 10px;
          font-weight: 700;
          font-family: 'Syne', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          position: absolute;
          top: -11px;
          right: -3px;
          z-index: 10;
          line-height: 1;
          box-shadow: 0 2px 8px rgba(139,0,0,0.4);
        }
        .help-btn:hover {
          background: #C9991A;
          color: #fff;
          border-color: #F5D98A;
          transform: scale(1.1);
        }
        .help-btn.active {
          background: #C9991A;
          color: #fff;
          border-color: #F5D98A;
        }

        /* ── Transcript box ── */
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

        .voice-bottom-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

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
        .voice-circle.speaking .mic-icon {
          animation: mic-bob 0.55s ease-in-out infinite alternate;
        }
        @keyframes mic-bob {
          from { transform: scale(1);    }
          to   { transform: scale(1.14); }
        }
      `}</style>

      <div className="voice-float">

        {/* Help panel */}
        {showHelp && (
          <div className="help-panel" ref={helpRef}>
            <p className="help-title">Voice Command Guides</p>
            {commands.map((cmd, i) => (
              <div key={i}>
                {i > 0 && <div className="help-divider" />}
                <div className="help-item">
                  <span className="help-item-label">
                    <FontAwesomeIcon icon={cmd.icon} />
                    {cmd.label}
                  </span>
                  <span className="help-item-example">{cmd.example}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transcript bubble */}
        {displayTranscript && (
          <div className="transcript-box">
            <p className="transcript-label">Transcript</p>
            <p className="transcript-text">
              {displayTranscript}
              {listening && <span className="cursor" />}
            </p>
          </div>
        )}

        {/* Label + mic row */}
        <div className="voice-bottom-row">
          <span className={`voice-label ${state}`}>
            {state === "listening" && "Listening…"}
            {state === "speaking"  && "Speaking…"}
            {state === "inactive"  && "Voice off"}
            {state === "active"    && "Ready"}
          </span>

          <div className={`voice-ring ${state}`} style={{ position: "relative" }}>

            {/* ? button — floats above mic */}
            <button
              className={`help-btn ${showHelp ? "active" : ""}`}
              onClick={() => setShowHelp(v => !v)}
              aria-label="Voice command help"
            >
              ?
            </button>

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