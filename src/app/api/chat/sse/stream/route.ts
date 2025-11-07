import { addClient } from "@/lib/sse";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const enc = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const remove = addClient(
        (chunk) => { if (!closed) try { controller.enqueue(chunk); } catch {} },
        () => { if (!closed) try { controller.close(); } catch {}; closed = true; }
      );
      const keep = setInterval(() => {
        if (!closed) controller.enqueue(enc.encode(`: ping\n\n`));
      }, 15000);

      const end = () => { clearInterval(keep); remove(); if (!closed) controller.close(); closed = true; };
      if (req.signal.aborted) end();
      else req.signal.addEventListener("abort", end, { once: true });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, must-revalidate",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
