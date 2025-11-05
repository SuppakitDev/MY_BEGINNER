import ThemeToggle from "@/components/ThemeToggle";
import { Card } from "@/components/ui/Card";
import { SimpleTable } from "@/components/ui/SimpleTable";
import SendEmailForm from "@/components/SendEmailForm";
import { headers } from "next/headers";
import Link from "next/link";
import NotifyBell from "@/components/NotifyBell";


type Row = {
  Reservation: string;
  // sku: string;
  // loc: string;
  // qty: number;
  // status: "OK" | "WARN" | "ERROR";
};

async function fetchRows(): Promise<Row[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL!;
  const res = await fetch(`${base}/api/allocations`, { cache: "no-store" });
  return res.json();
}

export default async function Page() {
  const rows = await fetchRows();

  return (
    <main className="mx-auto max-w-7xl p-6 space-y-6">
            <div className="flex gap-3">
  <Link href="/items" className="rounded-xl border px-3 py-2">Items</Link>
  <Link href="/login" className="rounded-xl border px-3 py-2">Login</Link>
</div>
<div className="text-green-500 font-bold">
  Hello from new feature branch 🚀
</div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl">Operations Dashboard
        <NotifyBell />
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Snapshot of inventory and process KPIs
          </p>
        </div>
        <ThemeToggle />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Total Items" value="1,558" />
        <Card title="Orders Today" value="87" />
        <Card title="Backorders" value="12" />
        <Card title="Fulfillment SLA" value="98.3%" />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg">Allocated by Location</h2>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {rows.length} rows
          </span>
        </div>
        {/* <SimpleTable rows={rows} /> */}
      </section>
      <section>
        <SendEmailForm/>
      </section>
    </main>
  );
}



