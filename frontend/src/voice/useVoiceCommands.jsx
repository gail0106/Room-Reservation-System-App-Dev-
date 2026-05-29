import { useState, useRef, useCallback, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { parseIntent } from "../lib/parseIntent";
import API from "../api/axios";

// ── ISO helper ────────────────────────────────────────────────────────────
const toISO = (dateStr, timeStr) => {
  const date = new Date(`${dateStr}T${timeStr}`);
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00${sign}${pad(offset / 60)}:${pad(offset % 60)}`;
};

export default function useVoiceCommands(navigate) {
  const [assistantActive, setAssistantActive]     = useState(false);
  const [isSpeaking, setIsSpeaking]               = useState(false);
  const [displayTranscript, setDisplayTranscript] = useState("");

  const assistantActiveRef = useRef(false);
  const isSpeakingRef      = useRef(false);
  const processingRef      = useRef(false);
  const transcriptTimerRef = useRef(null);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  // ── speak ─────────────────────────────────────────────────────────────────
  const speak = useCallback((text, onDone) => {
    if (!window.speechSynthesis) { onDone?.(); return; }

    window.speechSynthesis.cancel();
    SpeechRecognition.stopListening();

    isSpeakingRef.current = true;
    setIsSpeaking(true);

    const utterance  = new SpeechSynthesisUtterance(text);
    utterance.lang   = "en-US";
    utterance.rate   = 1.1;
    utterance.pitch  = 0.95;

    const finish = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      onDone?.();
      if (assistantActiveRef.current) {
        setTimeout(() => {
          SpeechRecognition.startListening({ continuous: true, language: "en-US" });
        }, 400);
      }
    };

    utterance.onend   = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
  }, []);

  // ── matchRoom ─────────────────────────────────────────────────────────────
  const matchRoom = async (roomName) => {
    const roomsResponse = await API.get("/rooms/");
    const roomList = roomsResponse.data?.data ?? roomsResponse.data ?? [];
    return roomList.find((r) =>
      r.name.toLowerCase().includes(roomName.toLowerCase()) ||
      roomName.toLowerCase().includes(r.name.toLowerCase())
    );
  };

  // ── processTranscript ─────────────────────────────────────────────────────
  const processTranscript = useCallback(async (text) => {
    if (!text || processingRef.current) return;

    processingRef.current = true;
    setDisplayTranscript(text);
    SpeechRecognition.stopListening();

    try {
      const data = await parseIntent(text);
      console.log("Intent:", data);

      // ── NAVIGATE ─────────────────────────────────────────────────────────
      if (data.intent === "navigate") {
        const routes = {
          dashboard:           "/dashboard",
          rooms:               "/rooms",
          bookings:            "/reservations",
          calendar:            "/calendar",
          notifications:       "/notifications",
          manage_reservations: "/admin/reservations",
          manage_rooms:        "/admin/rooms",
        };
        const path = routes[data.page];
        if (path) {
          const pageName = data.page.replace(/_/g, " ");
          speak(`Opening ${pageName}.`, () => navigate(path));
        } else {
          speak("I'm not sure which page you mean.");
        }
        return;
      }

      // ── CONVERSE ──────────────────────────────────────────────────────
      if (data.intent === "converse") {
      speak(data.reply);
      return;
}
// ── RESERVE ROOM ──────────────────────────────────────────────────────
if (data.intent === "reserve_room") {

  // Full sentence — all details present, book directly
  if (data.room && data.date && data.start_time && data.end_time) {
    const matched = await matchRoom(data.room);
    if (!matched) {
      speak(`Sorry, I couldn't find a room called ${data.room}.`);
      return;
    }
    try {
        const payload = {
        room:       matched.id,
        start_time: toISO(data.date, data.start_time),
        end_time:   toISO(data.date, data.end_time),
        purpose:    data.purpose, // always set by Groq, no fallback needed
      };
    console.log("Payload being sent:", payload); // 👈 add this
      await API.post("/reservations/", {
        room:       matched.id,
        start_time: toISO(data.date, data.start_time),
        end_time:   toISO(data.date, data.end_time),
      });
      speak(
        `Done! ${matched.name} has been reserved from ${data.start_time} to ${data.end_time}. Redirecting to your bookings.`,
        () => navigate("/reservations")
      );
    } catch (err) {
      console.log("Error response:", err.response?.data); // 👈 add this
      const reason = err.response?.data?.error ?? err.response?.data?.detail ?? "Something went wrong.";
      speak(`Reservation failed. ${reason}`);
    }
    return;
  }

  // Has some details but missing room — caught sentence too late
  if (!data.room && (data.date || data.start_time || data.end_time)) {
    setDisplayTranscript('Try saying: "Room 101 tomorrow from 2pm to 4pm"');
    speak("I didn't catch that completely. Please try again.");
    return;
  }

  // No details at all — first time asking
  setDisplayTranscript('Try saying: "Room 101 tomorrow from 2pm to 4pm"');
  speak("Sure! Just say the full command.");
  return;
}

      // ── UNKNOWN ───────────────────────────────────────────────────────────
      speak("I didn't understand that. Please try again.");

    } catch (err) {
      console.error("processTranscript error:", err);
      speak("Something went wrong. Please try again.");
    } finally {
      processingRef.current = false;
      resetTranscript();
    }
  }, [speak, navigate, resetTranscript]);

  // ── transcript watcher ────────────────────────────────────────────────────
  useEffect(() => {
    if (!assistantActive || isSpeaking || !transcript.trim()) return;

    setDisplayTranscript(transcript);

    if (transcriptTimerRef.current) clearTimeout(transcriptTimerRef.current);

    transcriptTimerRef.current = setTimeout(() => {
      if (transcript.trim().split(" ").length < 2) return;
      processTranscript(transcript.trim());
    }, 900);

    return () => clearTimeout(transcriptTimerRef.current);
  }, [transcript, assistantActive, isSpeaking, processTranscript]);

  // ── auto-restart mic if it drops ──────────────────────────────────────────
  useEffect(() => {
    if (!assistantActive || listening || isSpeaking || processingRef.current) return;
    const t = setTimeout(() => {
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    }, 600);
    return () => clearTimeout(t);
  }, [assistantActive, listening, isSpeaking]);

  // ── browser support check ─────────────────────────────────────────────────
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      alert("Your browser doesn't support speech recognition. Try Chrome.");
    }
  }, [browserSupportsSpeechRecognition]);

  // ── startListening ────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    window.speechSynthesis?.cancel();
    resetTranscript();
    processingRef.current      = false;
    assistantActiveRef.current = true;
    setAssistantActive(true);
    setDisplayTranscript("");
    speak("I'm listening!");
  }, [speak, resetTranscript]);

  // ── stopListening ─────────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    window.speechSynthesis?.cancel();
    SpeechRecognition.stopListening();
    if (transcriptTimerRef.current) clearTimeout(transcriptTimerRef.current);
    assistantActiveRef.current = false;
    isSpeakingRef.current      = false;
    processingRef.current      = false;
    setAssistantActive(false);
    setIsSpeaking(false);
    setDisplayTranscript("");
    resetTranscript();
  }, [resetTranscript]);

  return {
    displayTranscript,
    listening,
    isSpeaking,
    assistantActive,
    startListening,
    stopListening,
  };
}