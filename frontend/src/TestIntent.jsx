import { useEffect, useState } from "react";
import { parseIntent } from "./lib/parseIntent";

export default function TestIntent() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const test = async (transcript) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await parseIntent(transcript);
      setResult(data);
      console.log(data); // also check browser console
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>parseIntent Test</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 300 }}>
        <button onClick={() => test("go to the rooms page")}>
          Test: navigate
        </button>
        <button onClick={() => test("book room A tomorrow 2pm to 4pm")}>
          Test: reserve_room
        </button>
        <button onClick={() => test("asdfghjkl random noise")}>
          Test: unknown
        </button>
      </div>

      {loading && <p>Calling Groq...</p>}

      {result && (
        <pre style={{ marginTop: 16, background: "#f0f0f0", padding: 16 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}