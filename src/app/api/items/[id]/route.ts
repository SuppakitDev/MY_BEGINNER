// src/app/api/items/[id]/route.ts
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";
import { assertManagerOr403 } from "@/lib/auth";
import { broadcast } from "@/lib/sse";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PUT /api/items/:id  { name?: string, qty?: number }
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const forbid = assertManagerOr403(req);
  if (forbid) return forbid;

  try {
    const { id } = await ctx.params;
    const numericId = Number(id);
    const body = (await req.json()) as { name?: string; qty?: number };

    // ต้องมีอย่างน้อย 1 ฟิลด์
    if (!numericId || (body.name === undefined && typeof body.qty !== "number")) {
      return NextResponse.json({ error: "invalid input" }, { status: 400 });
    }

    const pool = await getPool();

    // ✅ ผูกพารามิเตอร์ทุกตัวเสมอ (ถ้าไม่ส่งมา ให้เป็น null)
    const q = pool.request()
      .input("id",   sql.Int, numericId)
      .input("name", sql.NVarChar(100), body.name ?? null)
      .input("qty",  sql.Int, body.qty  ?? null);

    const rs = await q.query(`
      UPDATE dbo.Items
      SET
        Name = COALESCE(@name, Name),
        Qty  = COALESCE(@qty,  Qty),
        UpdatedAt = SYSUTCDATETIME()
      WHERE Id = @id;

      SELECT @@ROWCOUNT AS Affected;
    `);

    if (!rs.recordset[0].Affected) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    broadcast({ type: "items_changed", action: "update" }); // หรือ "delete"
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("PUT /api/items/:id error:", err);
    return NextResponse.json({ error: err?.message ?? "Unexpected error" }, { status: 500 });
  }
}

// DELETE /api/items/:id
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const forbid = assertManagerOr403(req);
  if (forbid) return forbid;

  try {
    const { id } = await ctx.params;               // 👈 ต้อง await
    const numericId = Number(id);
    if (!numericId) {
      return NextResponse.json({ error: "invalid id" }, { status: 400 });
    }

    const pool = await getPool();
    const rs = await pool.request()
      .input("id", sql.Int, numericId)
      .query(`DELETE FROM dbo.Items WHERE Id = @id;`);

    // ใช้ rowsAffected แทน recordset
    broadcast({ type: "items_changed", action: "update" }); // หรือ "delete"
    const affected = rs.rowsAffected?.[0] ?? 0;
    if (!affected) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    // จับเคส FK constraint (SQL error 547)
    if (err?.number === 547) {
      return NextResponse.json(
        { error: "conflict: item is referenced by other records (FK constraint)" },
        { status: 409 }
      );
    }
    console.error("DELETE /api/items/:id error:", err);
    return NextResponse.json({ error: err?.message ?? "Unexpected error" }, { status: 500 });
  }
}
