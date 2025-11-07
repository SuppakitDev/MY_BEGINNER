import { broadcast } from "@/lib/sse";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const msg = String(body?.message ?? "").trim();
  if (!msg) return Response.json({ error: "empty" }, { status: 400 });

  const payload = {
    type: "chat",
    text: msg,
    at: new Date().toISOString(),
  };
  broadcast(payload);
  return Response.json({ ok: true });
}
