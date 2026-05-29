import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import API from "../api/axios";

const groq = createGroq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
});

// Fetches room list once and caches it for the session
let cachedRooms = null;

async function getRoomList() {
  if (cachedRooms) return cachedRooms;
  try {
    const res  = await API.get("/rooms/");
    const data = res.data?.data ?? res.data ?? [];
    cachedRooms = data.map((r) => r.name); // ["Room 101", "Room 102", ...]
    return cachedRooms;
  } catch {
    return []; // fail silently, Groq will handle unknown rooms
  }
}

function buildSystemPrompt(rooms) {
  const roomList    = rooms.join(", ");
  const roomNumbers = rooms.map((r) => r.replace("Room ", "")).join(", ");

  return `You are a voice intent parser for a room reservation system. Reply ONLY with valid JSON, no markdown.

Today: ${new Date().toISOString().split("T")[0]}

INTENTS:

1. navigate → { "intent": "navigate", "page": "dashboard"|"rooms"|"bookings"|"calendar"|"notifications"|"manage_reservations"|"manage_rooms" }

2. reserve_room (full) → { "intent": "reserve_room", "room": "Room 101", "date": "YYYY-MM-DD", "start_time": "HH:MM", "end_time": "HH:MM", "purpose": "<extracted or Voice reservation>" }
   reserve_room (no details) → { "intent": "reserve_room", "room": null, "date": null, "start_time": null, "end_time": null, "purpose": null }

3. converse → { "intent": "converse", "reply": "<1-2 sentence spoken reply>" }

4. unknown → { "intent": "unknown" }

RULES:
Rooms: ${roomList} (numbers: ${roomNumbers}). Spoken digits like "one oh one" = 101. Invalid room = null.
Dates: resolve relative dates (tomorrow, next Monday, this Friday) using today. Any sentence order.
Times: 24h format. First time = start_time, second = end_time. Both required or return all nulls. Never infer end_time.
Purpose: extract what follows "for", "for a", "to use for" (e.g. "for a meeting" → "meeting", "for a class" → "class"). If none mentioned, use "Voice reservation".
Reserve trigger phrases: "book/reserve a room", "can I book/reserve", "make a reservation" → return nulls version.
Converse: greetings, thanks, bye, compliments, "what can you do", "help". Short warm replies, never say you're an AI. Vary responses. For goodbyes say "See you later!" or similar. For greetings mention you help with rooms and navigation.
Navigate "manage_reservations": "manage reservations", "admin reservations". "manage_rooms": "manage rooms", "admin rooms". "bookings": "my bookings", "my reservations".
Validation: only return full reserve_room if room + date + start_time + end_time all present. Otherwise all nulls.`;
}

export async function parseIntent(transcript) {
  const rooms  = await getRoomList();
  const system = buildSystemPrompt(rooms);

  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system,
    prompt: transcript,
    temperature: 0.7,
  });

  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// Call this after a successful reservation or room management action
// so the cache refreshes and picks up any new rooms
export function invalidateRoomCache() {
  cachedRooms = null;
}