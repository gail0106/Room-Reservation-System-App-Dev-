import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import API from "../api/axios";

const groq1 = createGroq({ apiKey: import.meta.env.VITE_GROQ_API_KEY });
const groq2 = createGroq({ apiKey: import.meta.env.VITE_GROQ_API_KEY_2 });

let cachedRooms     = null;
let cachedRoomsFull = null;

async function getRoomList() {
  if (cachedRooms) return cachedRooms;
  try {
    const res  = await API.get("/rooms/");
    const data = res.data?.data ?? res.data ?? [];
    cachedRoomsFull = data;                    // full objects for matchRoom
    cachedRooms     = data.map((r) => r.name); // names for prompt
    return cachedRooms;
  } catch {
    return [];
  }
}

export async function getRoomListWithDetails() {
  if (cachedRoomsFull) return cachedRoomsFull;
  await getRoomList();
  return cachedRoomsFull ?? [];
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

5. search_rooms → { "intent": "search_rooms", "room": "<room name or null>", "capacity": <number or null>, "location": "<Nth Floor or null>" }

RULES:
Rooms: ${roomList} (numbers: ${roomNumbers}). Spoken digits like "one oh one" = 101. Invalid room = null.
Dates: resolve relative dates (tomorrow, next Monday, this Friday) using today. Any sentence order.
Times: 24h format. First time = start_time, second = end_time. Both required or return all nulls. Never infer end_time.
Purpose: extract what follows "for", "for a", "to use for", "para sa" (e.g. "for a meeting" → "meeting", "para sa klase" → "klase"). If none mentioned, use "Voice reservation".
Language: English and Filipino. "bukas"=tomorrow, "ngayon"=today, "mula"=from, "hanggang"=to/until, "para sa"=for, "i-book/mag-reserve/i-reserve"=reserve, "buksan/pumunta sa"=navigate, "salamat"=thanks. Reply in same language as user.
Reserve trigger phrases: "book/reserve a room", "can I book/reserve", "make a reservation", "mag-reserve ng room" → return nulls version.
Converse: greetings, thanks, bye, compliments, "what can you do", "help", "salamat", "kamusta". Short warm replies in same language as user, never say you're an AI.
Navigate "manage_reservations": "manage reservations", "admin reservations". "manage_rooms": "manage rooms", "admin rooms". "bookings": "my bookings", "my reservations".
Validation: only return full reserve_room if room + date + start_time + end_time all present. Otherwise all nulls.
Search triggers: "find a room", "look for a room", "search for a room", "I want to look for", "I want to find", "maghanap ng room", "hanap ng room".
Search rules: capacity = minimum needed (e.g. "for 40 people" → 40). Location normalize to "1st Floor", "2nd Floor" etc. Extract room name same as reserve rules. All fields optional — return null for any not mentioned.
Hours: reservations only allowed 6:00 AM to 10:00 PM (06:00–22:00). If user requests a time outside this range, still extract the intent but set start_time/end_time to null and add "time_error": "Reservations are only allowed from 6 AM to 10 PM." to the response.`;
}

async function tryGenerate(client, system, transcript) {
  const { text } = await generateText({
    model: client("llama-3.3-70b-versatile"),
    system,
    prompt: transcript,
    temperature: 0.7,
    maxTokens: 120,
  });
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

export async function parseIntent(transcript) {
  const rooms  = await getRoomList();
  const system = buildSystemPrompt(rooms);

  try {
    return await tryGenerate(groq1, system, transcript);
  } catch (err) {
    // Check all possible shapes the rate limit error can take
    const message = err?.message ?? err?.cause?.message ?? "";
    const status  = err?.status ?? err?.cause?.status ?? err?.statusCode ?? 0;

    const isRateLimit =
      status === 429 ||
      message.includes("Rate limit") ||
      message.includes("429") ||
      message.includes("Too Many Requests");

    const isMissingKey =
      message.includes("API key is missing") ||
      message.includes("AI_LoadAPIKeyError");

    if (isRateLimit && !isMissingKey) {
      console.warn("Primary key rate limited, switching to backup key...");
      return await tryGenerate(groq2, system, transcript);
    }

    throw err;
  }
}

export function invalidateRoomCache() {
  cachedRooms     = null;
  cachedRoomsFull = null;
}