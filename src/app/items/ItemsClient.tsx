"use client";

import { useEffect, useMemo, useState } from "react";
import { ExportButton } from "./ExportButton";
import { toast } from "sonner";
import ItemsChart from "@/components/ItemsChart";

type Item = { Id: number; Name: string; Qty: number; UpdatedAt: string };

function getCookie(name: string) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : undefined;
}

export default function ItemsClient() {
  const [role, setRole] = useState<"user" | "manager">("user");
  const [rows, setRows] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [qty, setQty] = useState<number | "">(0);
  const [adding, setAdding] = useState(false);
  const canEdit = useMemo(() => role === "manager", [role]);

  useEffect(() => {
    const r = getCookie("role");
    setRole(r === "manager" ? "manager" : "user");
    reload();
  }, []);

  async function reload() {
    const res = await fetch("/api/items", { cache: "no-store" });
    setRows(await res.json());
  }

  async function createItem(name: string, qty: number) {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, qty }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j?.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  async function handleCreate() {
    if (!canEdit) return;
    if (!name.trim()) return toast.error("Name is required");
    const q = Number(qty);
    if (!Number.isFinite(q) || q <= 0) return toast.error("Qty must be > 0");

    setAdding(true);
    try {
      await createItem(name.trim(), q);
      toast.success("Item added!");
      setName("");
      setQty(0);
      await reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Create failed");
    } finally {
      setAdding(false);
    }
  }

  async function updateQty(id: number, newQty: number) {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty: newQty }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      await reload();
      toast.success("Updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete item?")) return;
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      await reload();
      toast.success("Deleted");
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed");
    }
  }

  return (
    <section className="space-y-4">
      <div className="text-sm text-neutral-500 dark:text-neutral-400">
        Role: <b>{role}</b>
      </div>

      <div className="card p-4 space-y-3">
        <div className="text-sm text-neutral-600 dark:text-neutral-300">
          Create (Manager only)
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            disabled={!canEdit || adding}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="rounded-xl border px-3 py-2 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
          />
          <input
            disabled={!canEdit || adding}
            type="number"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value) || 0)}
            placeholder="Qty"
            className="rounded-xl border px-3 py-2 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
          />
          <button
            disabled={!canEdit || adding}
            onClick={handleCreate}
            aria-busy={adding}
            className="rounded-xl border border-green-300 text-green-700 px-4 py-2 
                       hover:bg-green-50 disabled:opacity-60"
          >
            {adding ? "Adding..." : "Add"}
          </button>
          <ExportButton />
        </div>
      </div>
    <ItemsChart rows={rows} />
      <div className="card overflow-hidden">
        <table className="table">
          <thead className="sticky top-0 bg-white dark:bg-neutral-900">
            <tr>
              <th className="px-4 py-2 w-16">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2 w-28 text-right">Qty</th>
              <th className="px-4 py-2 w-56">UpdatedAt</th>
              <th className="px-4 py-2 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.Id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                <td className="px-4 py-2">{r.Id}</td>
                <td className="px-4 py-2">{r.Name}</td>
                <td className="px-4 py-2 text-right tabular-nums">{r.Qty}</td>
                <td className="px-4 py-2 text-xs text-neutral-500 dark:text-neutral-400">
                  {r.UpdatedAt}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      disabled={!canEdit}
                      onClick={() => updateQty(r.Id, r.Qty + 1)}
                      className="rounded-lg border border-green-300 px-3 py-1 
                                 text-green-700 hover:bg-green-50 disabled:opacity-60"
                    >
                      +1
                    </button>
                    <button
                      disabled={!canEdit}
                      onClick={() => updateQty(r.Id, Math.max(0, r.Qty - 1))}
                      className="rounded-lg border border-yellow-400 px-3 py-1 
                                 text-yellow-700 hover:bg-yellow-50 disabled:opacity-60"
                    >
                      -1
                    </button>
                    <button
                      disabled={!canEdit}
                      onClick={() => remove(r.Id)}
                      className="rounded-lg border border-red-400 px-3 py-1 
                                 text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-neutral-500">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
    </section>
    
  );
}
