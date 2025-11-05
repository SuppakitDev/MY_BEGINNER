"use client";
import { useEffect, useState } from "react";

export default function NotifyBell() {
  const [count, setCount] = useState(0);

  async function refreshCount() {
    try {
      const r = await fetch("/api/notifications/count", { cache: "no-store" });
      const j = await r.json();
      setCount(Number(j?.count ?? 0));
    } catch {}
  }

  useEffect(() => {
    let es: EventSource | null = null;
    let poll: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      refreshCount(); // โหลดครั้งแรก
      try {
        es = new EventSource("/api/notifications/stream");
        es.onmessage = () => refreshCount();           // มี event → ดึง count สด
        es.addEventListener("hello", () => {});        // connected
        es.onerror = () => {};                         // เงียบไว้ ให้ browser reconnect เอง
      } catch {
        // fallback polling
        poll = setInterval(refreshCount, 30000);
      }

      document.addEventListener("visibilitychange", onVis);
    };

    const onVis = () => {
      if (document.visibilityState === "visible") refreshCount();
    };

    start();
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (es) es.close();
      if (poll) clearInterval(poll);
    };
  }, []);

  return (
    <button
      type="button"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border
                 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-sm"
      aria-label={`Notifications${count ? ` (${count})` : ""}`}
      title="Notifications"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path fill="currentColor"
          d="M12 2a6 6 0 0 0-6 6v3.586l-1.293 1.293A1 1 0 0 0 5 14h14a1 1 0 0 0 .707-1.707L18.414 11.586V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3Z"/>
      </svg>

      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full
                         text-[11px] leading-5 text-white bg-red-500/90 text-center font-medium">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
