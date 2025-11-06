"use client";
import { useEffect, useRef, useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<{text:string;at:string}[]>([]);
  const [text, setText] = useState("");
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/chat/sse/stream");
    esRef.current = es;
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data?.type === "chat") {
          setMessages((prev) => [...prev, { text: data.text, at: data.at }]);
        }
      } catch {}
    };
    es.onerror = () => {}; // ให้ browser auto-reconnect
    return () => es.close();
  }, []);

  async function send() {
    const m = text.trim();
    if (!m) return;
    setText("");
    await fetch("/api/chat/sse/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: m }),
    });
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-3">
      <h1 className="text-xl font-bold">Realtime Chat (SSE)</h1>
      <div className="border rounded p-3 h-64 overflow-y-auto bg-neutral-900 text-neutral-100">
        {messages.map((m, i) => (
          <div key={i} className="mb-1">
            <span className="text-neutral-400 text-xs mr-2">
              {new Date(m.at).toLocaleTimeString()}
            </span>
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message…"
          className="flex-1 border rounded px-3 py-2 bg-neutral-800 text-neutral-100"
        />
        <button onClick={send} className="px-4 py-2 rounded bg-blue-600 text-white">
          Send
        </button>
      </div>
    </div>
  );
}
