import { useState, useRef, useCallback, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { parseIntent, getRoomListWithDetails } from "../lib/parseIntent";
import API from "../api/axios";

const toISO = (dateStr, timeStr) => {
  const date = new Date(`${dateStr}T${timeStr}`);
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00${sign}${pad(offset / 60)}:${pad(offset % 60)}`;
};

const toReadableTime = (time) => {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hour   = h % 12 || 12;
  return m === 0 ? `${hour}${period}` : `${hour}:${String(m).padStart(2, "0")}${period}`;
};

const isAllowedTime = (timeStr) => {
  const [h] = timeStr.split(":").map(Number);
  return h >= 6 && h < 22;
};

// ── Cancel flow steps ─────────────────────────────────────────────────────
const CANCEL_STEP = {
  NONE:       "none",
  AWAITING:   "awaiting",   // waiting for room + date
  CONFIRMING: "confirming", // found a match, waiting for yes/no
};

export default function useVoiceCommands(navigate) {
  const [assistantActive, setAssistantActive]     = useState(false);
  const [isSpeaking, setIsSpeaking]               = useState(false);
  const [displayTranscript, setDisplayTranscript] = useState("");

  const assistantActiveRef  = useRef(false);
  const isSpeakingRef       = useRef(false);
  const processingRef       = useRef(false);
  const transcriptTimerRef  = useRef(null);

  // ── Cancel flow refs ──────────────────────────────────────────────────────
  const cancelStepRef       = useRef(CANCEL_STEP.NONE);
  const cancelTargetRef     = useRef(null); // stores matched reservation object

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

  // ── matchRoom — uses cache ────────────────────────────────────────────────
  const matchRoom = useCallback(async (roomName) => {
    const roomList = await getRoomListWithDetails();
    return roomList.find((r) =>
      r.name.toLowerCase().includes(roomName.toLowerCase()) ||
      roomName.toLowerCase().includes(r.name.toLowerCase())
    );
  }, []);

  // ── processTranscript ─────────────────────────────────────────────────────
  const processTranscript = useCallback(async (text) => {
    if (!text || processingRef.current) return;

    processingRef.current = true;
    setDisplayTranscript(text);
    SpeechRecognition.stopListening();

    try {

      // ── CANCEL FLOW: confirming step (yes/no) ─────────────────────────────
      // Handle this BEFORE parseIntent to avoid extra API call
      if (cancelStepRef.current === CANCEL_STEP.CONFIRMING) {
        const lower = text.toLowerCase().trim();
        const isYes = ["yes", "yeah", "yep", "oo", "oo nga", "confirm", "sure", "go"].some(w => lower.includes(w));
        const isNo  = ["no", "nope", "hindi", "nah", "huwag", "cancel"].some(w => lower.includes(w));

        if (isYes) {
          const reservation = cancelTargetRef.current;
          try {
            await API.patch(`/reservations/${reservation.id}/cancel/`);
            cancelStepRef.current = CANCEL_STEP.NONE;
            cancelTargetRef.current = null;
            speak("Done! Your reservation has been cancelled successfully.");
          } catch (err) {
            cancelStepRef.current = CANCEL_STEP.NONE;
            cancelTargetRef.current = null;
            const reason = err.response?.data?.error ?? "Something went wrong.";
            speak(`Cancellation failed. ${reason}`);
          }
          processingRef.current = false;
          resetTranscript();
          return;
        }

        if (isNo) {
          cancelStepRef.current   = CANCEL_STEP.NONE;
          cancelTargetRef.current = null;
          speak("Alright! No changes made. Let me know if there's anything else I can help you with.");
          processingRef.current = false;
          resetTranscript();
          return;
        }

        // Neither yes nor no — re-ask
        speak("Sorry, I didn't catch that. Please say yes to confirm or no to keep the reservation.");
        processingRef.current = false;
        resetTranscript();
        return;
      }

      // ── CANCEL FLOW: awaiting room + date ─────────────────────────────────
      if (cancelStepRef.current === CANCEL_STEP.AWAITING) {
        const data = await parseIntent(text);

        // Extract room and date from cancel_reservation or reserve_room intent
        const room = data.room ?? null;
        const date = data.date ?? null;

        if (!room || !date) {
          speak("I need both the room and the date. Try saying something like Room 101 on June 30.");
          processingRef.current = false;
          resetTranscript();
          return;
        }

        // Fetch user's reservations and match by room name + date
        try {
          const res = await API.get("/reservations/");
          const list = res.data?.data ?? res.data ?? [];

          const matched = list.find((r) => {
            const reservationDate = new Date(r.start_time).toISOString().split("T")[0];
            const roomMatch = r.room_name?.toLowerCase().includes(room.toLowerCase()) ||
                              room.toLowerCase().includes(r.room_name?.toLowerCase() ?? "");
            const dateMatch = reservationDate === date;
            const statusOk  = ["pending", "approved"].includes(r.status);
            return roomMatch && dateMatch && statusOk;
          });

          if (!matched) {
            cancelStepRef.current = CANCEL_STEP.NONE;
            speak(`I couldn't find a pending or approved reservation for ${room} on that date. Double-check your bookings and try again.`);
            processingRef.current = false;
            resetTranscript();
            return;
          }

          // Found a match — ask for confirmation
          cancelTargetRef.current = matched;
          cancelStepRef.current   = CANCEL_STEP.CONFIRMING;

          const startTime = new Date(matched.start_time);
          const endTime   = new Date(matched.end_time);
          const timeStr   = `${toReadableTime(`${String(startTime.getHours()).padStart(2,"0")}:${String(startTime.getMinutes()).padStart(2,"0")}`)} to ${toReadableTime(`${String(endTime.getHours()).padStart(2,"0")}:${String(endTime.getMinutes()).padStart(2,"0")}`)}`;
          const dateStr   = startTime.toLocaleDateString("en-US", { month: "long", day: "numeric" });

          setDisplayTranscript(`Found: ${matched.room_name} on ${dateStr} from ${timeStr}. Say yes to cancel or no to keep it.`);
          speak(`I found your reservation for ${matched.room_name} on ${dateStr} from ${timeStr}. Are you sure you want to cancel it? Say yes or no.`);
          processingRef.current = false;
          resetTranscript();
          return;

        } catch {
          cancelStepRef.current = CANCEL_STEP.NONE;
          speak("Something went wrong while looking up your reservations. Please try again.");
          processingRef.current = false;
          resetTranscript();
          return;
        }
      }

      // ── NORMAL INTENT PARSING ─────────────────────────────────────────────
      const data = await parseIntent(text);
      console.log("Intent:", data);

      if (data.time_error) {
        setDisplayTranscript("Reservations are only allowed from 6:00 AM to 10:00 PM.");
        speak(data.time_error);
        processingRef.current = false;
        resetTranscript();
        return;
      }

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
        processingRef.current = false;
        resetTranscript();
        return;
      }

      // ── CONVERSE ──────────────────────────────────────────────────────────
      if (data.intent === "converse") {
        speak(data.reply);
        processingRef.current = false;
        resetTranscript();
        return;
      }

      // ── CANCEL RESERVATION — trigger ──────────────────────────────────────
      if (data.intent === "cancel_reservation") {
        // If they already gave room + date in the same sentence
        if (data.room && data.date) {
          cancelStepRef.current = CANCEL_STEP.AWAITING;
          // Re-process the same text through the AWAITING handler
          // by setting step and re-calling with same text
          processingRef.current = false;
          resetTranscript();
          // Slight delay so step is set before re-entry
          setTimeout(() => processTranscript(text), 100);
          return;
        }
        // No details — ask for them
        cancelStepRef.current = CANCEL_STEP.AWAITING;
        setDisplayTranscript("Tell me the room and date of the reservation you want to cancel.");
        speak("Sure! Just tell me the room and date of the reservation you'd like to cancel.");
        processingRef.current = false;
        resetTranscript();
        return;
      }

      // ── RESERVE ROOM ──────────────────────────────────────────────────────
      if (data.intent === "reserve_room") {
        if (!data.room && !data.date && !data.start_time && !data.end_time) {
          setDisplayTranscript('Try saying: "Reserve Room 101 on May 30 from 2pm to 4pm"');
          speak("Sure! Just say the full command.");
          processingRef.current = false;
          resetTranscript();
          return;
        }
        if (!data.room && (data.date || data.start_time || data.end_time)) {
          setDisplayTranscript('Try saying: "Reserve Room 101 on May 30 from 2pm to 4pm"');
          speak("I didn't catch that completely. Please try again.");
          processingRef.current = false;
          resetTranscript();
          return;
        }
        if (data.room && data.date && data.start_time && data.end_time) {
          const matched = await matchRoom(data.room);
          if (!matched) {
            speak(`Sorry, I couldn't find a room called ${data.room}.`);
            processingRef.current = false;
            resetTranscript();
            return;
          }
          if (!isAllowedTime(data.start_time) || !isAllowedTime(data.end_time)) {
            setDisplayTranscript("Reservations are only allowed from 6:00 AM to 10:00 PM.");
            speak("Sorry, reservations are only allowed between 6 in the morning and 10 in the evening.");
            processingRef.current = false;
            resetTranscript();
            return;
          }
          try {
            await API.post("/reservations/", {
              room:       matched.id,
              start_time: toISO(data.date, data.start_time),
              end_time:   toISO(data.date, data.end_time),
              purpose:    data.purpose,
            });
            resetTranscript();
            processingRef.current = false;
            speak(
              `Done! ${matched.name} has been reserved from ${toReadableTime(data.start_time)} to ${toReadableTime(data.end_time)}. Redirecting to your bookings.`,
              () => navigate("/reservations")
            );
          } catch (err) {
            const reason = err.response?.data?.error ?? err.response?.data?.detail ?? "Something went wrong.";
            speak(`Reservation failed. ${reason}`);
            processingRef.current = false;
            resetTranscript();
          }
          return;
        }
      }

      // ── SEARCH ROOMS ──────────────────────────────────────────────────────
      if (data.intent === "search_rooms") {
        const allRooms = await getRoomListWithDetails();
        let filtered = allRooms;
        if (data.room)     filtered = filtered.filter((r) => r.name.toLowerCase().includes(data.room.toLowerCase()));
        if (data.capacity) filtered = filtered.filter((r) => r.capacity >= data.capacity);
        if (data.location) filtered = filtered.filter((r) => r.location.toLowerCase().includes(data.location.toLowerCase()));

        if (filtered.length === 0) {
          speak("Sorry, I couldn't find any rooms matching your criteria.");
          processingRef.current = false;
          resetTranscript();
          return;
        }

        const roomNumbers = filtered.map((r) => r.name.replace("Room ", "")).join(", ");
        const phrases = filtered.length === 1
          ? [
              `Here's what I found — Room ${roomNumbers}.`,
              `I found one available room, that's Room ${roomNumbers}.`,
              `Got one for you — Room ${roomNumbers}.`,
            ]
          : [
              `Here's what I found — Rooms ${roomNumbers}.`,
              `I found ${filtered.length} rooms that match — ${roomNumbers}.`,
              `Got ${filtered.length} options for you — Rooms ${roomNumbers}.`,
            ];
        const spokenResult = phrases[Math.floor(Math.random() * phrases.length)];

        const params = new URLSearchParams();
        if (data.room)     params.set("room", data.room);
        if (data.capacity) params.set("capacity", data.capacity);
        if (data.location) params.set("location", data.location);

        resetTranscript();
        processingRef.current = false;
        navigate(`/rooms?${params.toString()}`);
        setTimeout(() => speak(spokenResult), 600);
        return;
      }

      // ── UNKNOWN ───────────────────────────────────────────────────────────
      speak("I didn't understand that. Please try again.");
      processingRef.current = false;
      resetTranscript();

    } catch (err) {
      console.error("processTranscript error:", err);
      speak("Something went wrong. Please try again.");
      processingRef.current = false;
      resetTranscript();
    }
  }, [speak, navigate, resetTranscript, matchRoom]);

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
    cancelStepRef.current      = CANCEL_STEP.NONE;
    cancelTargetRef.current    = null;
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
    cancelStepRef.current      = CANCEL_STEP.NONE;
    cancelTargetRef.current    = null;
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