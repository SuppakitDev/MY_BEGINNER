// Simple in-memory SSE hub (instance เดียว)
type Client = { id: number; enqueue: (chunk: Uint8Array) => void; close: () => void };
let clients: Client[] = [];
let seq = 1;
const te = new TextEncoder();

export function addClient(enqueue: (c: Uint8Array)=>void, close: ()=>void) {
  const id = seq++;
  clients.push({ id, enqueue, close });
  // hello event
  enqueue(te.encode(`event: hello\ndata: "connected"\n\n`));
  return () => {
    clients = clients.filter(c => c.id !== id);
    try { close(); } catch {}
  };
}

export function broadcast(data: any) {
  const payload = te.encode(`data: ${JSON.stringify(data)}\n\n`);
  for (const c of clients) c.enqueue(payload);
}

export function clientsCount() { return clients.length; }
