// src/app/api/notifications/stream/route.ts
import { addClient } from "@/lib/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  let closed = false; // กัน enqueue หลังปิดแล้ว

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const remove = addClient(
        (chunk) => {
          if (closed) return;
          try { controller.enqueue(chunk); } catch { /* already closed */ }
        },
        () => {
          if (closed) return;
          closed = true;
          try { controller.close(); } catch {}
        }
      );

      // keep-alive กัน proxy ปิดคอนเนคชัน
      const keep = setInterval(() => {
        if (closed) return;
        try { controller.enqueue(encoder.encode(`: ping\n\n`)); }
        catch {
          clearInterval(keep);
          
          closed = true;
          remove();
        }
      }, 15000);

      // เมื่อ client ปิดการเชื่อมต่อ (เช่น ปิดแท็บ)
      const onAbort = () => {
        clearInterval(keep);
        if (!closed) {
          closed = true;
          remove();
          try { controller.close(); } catch {}
        }
      };

      if (req.signal.aborted) onAbort();
      else req.signal.addEventListener("abort", onAbort, { once: true });
    },

    cancel() {
      // เรียกเมื่อ consumer ยกเลิก stream
      closed = true;
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, must-revalidate",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // สำหรับ Nginx
    },
  });
}
