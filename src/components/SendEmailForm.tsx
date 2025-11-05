"use client";
import { useState } from "react";

type SendPayload = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string;      // base64
    encoding?: "base64";
    contentType?: string;
  }>;
};

export default function SendEmailForm() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("Test from dashboard");
  const [message, setMessage] = useState("<b>Hello</b> from Next.js API 👋");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ok?: boolean; msg: string} | null>(null);

  async function fileToBase64(f: File): Promise<{content: string; contentType: string}> {
    const buf = await f.arrayBuffer();
    const bytes = new Uint8Array(buf);
    // แปลง base64 แบบไม่ใช้ lib
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    const content = btoa(bin);
    return { content, contentType: f.type || "application/octet-stream" };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload: SendPayload = {
        to: to.trim(),
        subject: subject.trim(),
        html: message, // หรือจะส่ง text ก็ได้
      };

      if (file) {
        const { content, contentType } = await fileToBase64(file);
        payload.attachments = [{
          filename: file.name,
          content,
          encoding: "base64",
          contentType,
        }];
      }

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Failed to send email");
      }
      setResult({ ok: true, msg: `✅ Sent! messageId: ${data.messageId}` });
      setFile(null);
    } catch (err: any) {
      setResult({ ok: false, msg: `❌ ${err?.message || "Send failed"}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card p-5 space-y-4">
      <div className="space-y-1">
        <label className="block text-sm text-neutral-600 dark:text-neutral-300">To</label>
        <input
          type="email"
          required
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="you@company.local"
          className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-neutral-900
                     border-neutral-200 dark:border-neutral-800 outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm text-neutral-600 dark:text-neutral-300">Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-neutral-900
                     border-neutral-200 dark:border-neutral-800 outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm text-neutral-600 dark:text-neutral-300">
          Message (HTML)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-neutral-900
                     border-neutral-200 dark:border-neutral-800 outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700 font-mono text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm text-neutral-600 dark:text-neutral-300">Attachment (optional)</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm"
        />
        {file && (
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Selected: {file.name} ({Math.round(file.size / 1024)} KB)
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium
                     border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900
                     hover:shadow-sm disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Email"}
        </button>

        {result && (
          <span className={result.ok ? "text-green-600 dark:text-green-400 text-sm" : "text-rose-600 dark:text-rose-400 text-sm"}>
            {result.msg}
          </span>
        )}
      </div>
    </form>
  );
}
