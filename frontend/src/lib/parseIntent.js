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
    cachedRoomsFull = data;
    cachedRooms     = data.map((r) => r.name);
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
3. cancel_reservation → { "intent": "cancel_reservation", "room": "<room name or null>", "date": "<YYYY-MM-DD or null>" }
4. search_rooms → { "intent": "search_rooms", "room": "<room name or null>", "capacity": <number or null>, "location": "<Nth Floor or null>" }
5. converse → { "intent": "converse", "reply": "<1-2 sentence spoken reply, warm and accommodating>" }
6. unknown → { "intent": "unknown" }

RULES:
Rooms: ${roomList} (numbers: ${roomNumbers}). Spoken digits like "one oh one" = 101. Invalid room = null.
Dates: resolve relative dates (tomorrow, next Monday, this Friday) using today. Any sentence order.
Times: 24h format. First time = start_time, second = end_time. Both required or return all nulls. Never infer end_time.
Hours: reservations only allowed 06:00-22:00. If outside range, still extract intent but set start_time/end_time to null and add "time_error": "Reservations are only allowed from 6 AM to 10 PM."
Purpose: extract what follows "for", "for a", "para sa". If none, use "Voice reservation".
Cancel triggers: "cancel my booking", "cancel my reservation", "i-cancel", "bawiin". Extract room+date if mentioned, otherwise return nulls.
Search triggers: "find a room", "look for", "search for", "maghanap". Extract capacity as minimum, location as "Nth Floor".
Language: English and Filipino. "bukas"=tomorrow, "ngayon"=today, "mula"=from, "hanggang"=to/until, "para sa"=for, "salamat"=thanks. Reply in same language as user.
Converse: greetings, thanks, bye, help, kamusta, salamat. Short warm replies, never say you're an AI.
Navigate "manage_reservations": "manage reservations". "manage_rooms": "manage rooms". "bookings": "my bookings", "my reservations".
Validation: only return full reserve_room if room+date+start_time+end_time all present. Otherwise all nulls.`;
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
    const message = err?.message ?? err?.cause?.message ?? "";
    const status  = err?.status ?? err?.cause?.status ?? err?.statusCode ?? 0;

    const isRateLimit =
      status === 429 ||
      message.includes("Rate limit") ||
      message.includes("429") ||
      message.includes("Too Many Requests");

    const isInvalidKey =
      status === 401 ||
      message.includes("Invalid API Key") ||
      message.includes("AI_APICallError");

    const isMissingKey =
      message.includes("API key is missing") ||
      message.includes("AI_LoadAPIKeyError");

    // ✅ now includes isInvalidKey in the condition
    if ((isRateLimit || isInvalidKey) && !isMissingKey) {
      console.warn("Primary key failed, switching to backup key...");
      return await tryGenerate(groq2, system, transcript);
    }

    throw err;
  }
}

export function invalidateRoomCache() {
  cachedRooms     = null;
  cachedRoomsFull = null;
}