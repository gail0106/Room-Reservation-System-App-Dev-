
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

export default function useVoiceCommands(navigate) {
  const [assistantActive, _setAssistantActive] = useState(false);
  const [isSpeaking, setIsSpeaking]             = useState(false);
  const [statusMessage, setStatusMessage]         = useState("");
  const [displayTranscript, setDisplayTranscript] = useState("");

  const assistantActiveRef = useRef(false);
  const isSpeakingRef      = useRef(false);
  const recognitionRef     = useRef(null);
  const restartPendingRef  = useRef(false);
  const commandMatchedRef  = useRef(false);
  const noCommandTimerRef  = useRef(null);
  const lastTranscriptRef  = useRef("");
  const cooldownRef        = useRef(false);
  const stopListeningRef   = useRef(null);
  const speakRef           = useRef(null);
  const navigateRef        = useRef(navigate);
  const resetTranscriptRef = useRef(null);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  const setAssistantActive = (val) => {
    assistantActiveRef.current = val;
    _setAssistantActive(val);
  };

  const startCooldown = useCallback((ms = 2000) => {
    cooldownRef.current = true;
    setTimeout(() => { cooldownRef.current = false; }, ms);
  }, []);

  const resumeListening = useCallback(() => {
    if (!assistantActiveRef.current || isSpeakingRef.current || restartPendingRef.current) return;
    restartPendingRef.current = true;
    try { recognitionRef.current?.abort(); } catch (_) {}
    setTimeout(() => {
      restartPendingRef.current = false;
      if (!assistantActiveRef.current || isSpeakingRef.current) return;
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    }, 80);
  }, []);

  const speak = useCallback((text, onDone) => {
    if (!window.speechSynthesis) { onDone?.(); return; }
    window.speechSynthesis.cancel();
    try { recognitionRef.current?.abort(); } catch (_) {}

    isSpeakingRef.current = true;
    setIsSpeaking(true);
    setDisplayTranscript("");

    const utter    = new SpeechSynthesisUtterance(text);
    utter.lang     = "en-US";
    utter.rate     = 1.12;
    utter.pitch    = 0.95;
    utter.volume   = 0.9;

    const finish = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      onDone?.();
      setTimeout(() => {
        if (assistantActiveRef.current) resumeListening();
      }, 400);
    };

    utter.onend   = finish;
    utter.onerror = finish;
    window.speechSynthesis.speak(utter);
  }, [resumeListening]);

  useEffect(() => { speakRef.current = speak; }, [speak]);

  const commands = useMemo(() => {
    // Navigation command — shows text + navigates
    const make = (phrases, message, path) => ({
      command: phrases,
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.6,
      callback: () => {
        commandMatchedRef.current = true;
        if (noCommandTimerRef.current) clearTimeout(noCommandTimerRef.current);
        resetTranscriptRef.current?.();
        lastTranscriptRef.current = "";
        commandMatchedRef.current = false;
        startCooldown(2500);
        setStatusMessage(message);
        setDisplayTranscript(message);
        setTimeout(() => {
          navigateRef.current?.(path);
        }, 800);
      },
    });

    // Reply command — speaks the response and stays active, no navigation
    const makeReply = (phrases, message) => ({
      command: phrases,
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.6,
      callback: () => {
        commandMatchedRef.current = true;
        if (noCommandTimerRef.current) clearTimeout(noCommandTimerRef.current);
        resetTranscriptRef.current?.();
        lastTranscriptRef.current = "";
        startCooldown(2500);
        setDisplayTranscript(message);
        speakRef.current?.(message); // speaks and resumes listening after
      },
    });

    return [
      makeReply(
        ["thanks", "thank you", "okay", "ok", "alright"],
        "No problem!"
      ),
     makeReply(
        ["Bye", "Goodbye", "That's all", "Stop"],
        "Alright, click the mic again to wake me up!"
     ),
      make(
        ["go to dashboard", "open dashboard", "show dashboard", "dashboard"],
        "Opening dashboard.", "/dashboard"
      ),
      make(
        ["go to rooms", "open rooms", "show rooms", "view rooms", "rooms"],
        "Opening rooms.", "/rooms"
      ),
      make(
        ["go to bookings", "open bookings", "my bookings", "show bookings", "view bookings", "bookings"],
        "Opening your bookings.", "/reservations"
      ),
      make(
        ["go to calendar", "open calendar", "show calendar", "view calendar", "calendar"],
        "Opening calendar.", "/calendar"
      ),
      make(
        ["go to notifications", "open notifications", "show notifications", "notifications"],
        "Opening notifications.", "/notifications"
      ),
      make(
        ["manage reservations", "admin reservations", "reservation management"],
        "Opening reservation management.", "/admin/reservations"
      ),
      make(
        ["manage rooms", "admin rooms", "room management"],
        "Opening room management.", "/admin/rooms"
      ),
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition({ commands });

  useEffect(() => { resetTranscriptRef.current = resetTranscript; }, [resetTranscript]);

  // ── Transcript watcher ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isSpeaking || !assistantActive || !transcript || cooldownRef.current) return;

    setDisplayTranscript(transcript);
    lastTranscriptRef.current = transcript;
    commandMatchedRef.current = false;

    if (noCommandTimerRef.current) clearTimeout(noCommandTimerRef.current);

    noCommandTimerRef.current = setTimeout(() => {
      if (
        cooldownRef.current         ||
        commandMatchedRef.current   ||
        !assistantActiveRef.current ||
        isSpeakingRef.current       ||
        lastTranscriptRef.current.trim().split(" ").length < 2
      ) return;

      setDisplayTranscript("Sorry, I didn't understand that.");
      lastTranscriptRef.current = "";
      resetTranscriptRef.current?.();
      setTimeout(() => stopListeningRef.current?.(), 1200);
    }, 900);
  }, [transcript, isSpeaking, assistantActive]);

  // ── Mic restart cleanup ────────────────────────────────────────────────────
  useEffect(() => {
    if (!listening) return;
    restartPendingRef.current = false;
    resetTranscriptRef.current?.();
    lastTranscriptRef.current = "";
    commandMatchedRef.current = false;
    if (noCommandTimerRef.current) clearTimeout(noCommandTimerRef.current);
    if (!statusMessage) setDisplayTranscript("");
    startCooldown(500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening]);

  // ── Status message auto-clear ──────────────────────────────────────────────
  useEffect(() => {
    if (!statusMessage) return;
    const t = setTimeout(() => setStatusMessage(""), 3000);
    return () => clearTimeout(t);
  }, [statusMessage]);

  // ── Browser support check ──────────────────────────────────────────────────
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      alert("Browser does not support speech recognition.");
    }
  }, [browserSupportsSpeechRecognition]);

  // ── Auto-restart when mic drops ────────────────────────────────────────────
  useEffect(() => {
    if (!assistantActive || listening || isSpeaking) return;
    const t = setTimeout(resumeListening, 600);
    return () => clearTimeout(t);
  }, [assistantActive, listening, isSpeaking, resumeListening]);

  // ── Capture recognition instance ──────────────────────────────────────────
  useEffect(() => {
    recognitionRef.current = SpeechRecognition.getRecognition();
  }, []);

  // ── Public API ─────────────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    if (noCommandTimerRef.current) clearTimeout(noCommandTimerRef.current);
    cooldownRef.current        = false;
    isSpeakingRef.current      = false;
    restartPendingRef.current  = false;
    assistantActiveRef.current = false;
    setIsSpeaking(false);
    setAssistantActive(false);
    setStatusMessage("");
    setDisplayTranscript("");
    resetTranscriptRef.current?.();
    lastTranscriptRef.current = "";
    try { recognitionRef.current?.abort(); } catch (_) {}
    SpeechRecognition.stopListening();
  }, []);

  useEffect(() => { stopListeningRef.current = stopListening; }, [stopListening]);

  const startListening = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (noCommandTimerRef.current) clearTimeout(noCommandTimerRef.current);
    commandMatchedRef.current = false;
    lastTranscriptRef.current = "";
    setAssistantActive(true);
    setStatusMessage("");
    setDisplayTranscript("");
    resetTranscriptRef.current?.();
    startCooldown(2500);
    speak("I'm Listening!");
  }, [speak, startCooldown]);

  return {
    displayTranscript,
    listening,
    isSpeaking,
    assistantActive,
    statusMessage,
    startListening,
    stopListening,
  };
}