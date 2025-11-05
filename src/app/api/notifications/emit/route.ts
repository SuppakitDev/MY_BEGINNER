import { broadcast, clientsCount } from "@/lib/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(()=>({}));
  broadcast({ type: "notify", ...body, ts: Date.now() });
  return new Response(JSON.stringify({ ok: true, subscribers: clientsCount() }), {
    headers: { "Content-Type": "application/json" }
  });
}
