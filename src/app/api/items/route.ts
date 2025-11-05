import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";
import { assertManagerOr403 } from "@/lib/auth";
import { broadcast } from "@/lib/sse";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/items
export async function GET() {
  try {
    const pool = await getPool();
    const rs = await pool.request().query(`
      SELECT
        Id,
        Name,
        Qty,
        CONVERT(varchar(19), UpdatedAt, 120) AS UpdatedAt
      FROM dbo.Items
      ORDER BY Id DESC;
    `);
    return NextResponse.json(rs.recordset, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/items error:", err);
    return NextResponse.json({ error: err?.message ?? "Unexpected error" }, { status: 500 });
  }
}

// POST /api/items  { name: string, qty: number }
export async function POST(req: Request) {
  // ⛔ ต้องเป็น manager เท่านั้น
  const forbid = assertManagerOr403(req);
  if (forbid) return forbid;

  try {
    const body = (await req.json()) as { name?: string; qty?: number };
    if (!body?.name || typeof body.qty !== "number") {
      return NextResponse.json({ error: "name & qty required" }, { status: 400 });
    }

    const pool = await getPool();
    const rs = await pool
      .request()
      .input("name", sql.NVarChar(100), body.name)
      .input("qty", sql.Int, body.qty)
      .query(`
        INSERT INTO dbo.Items (Name, Qty)
        VALUES (@name, @qty);
        SELECT SCOPE_IDENTITY() AS Id;
      `);
  broadcast({ type: "items_changed", action: "create" });

  return NextResponse.json({ id: rs.recordset[0].Id }, { status: 201 });
  
  } catch (err: any) {
    console.error("POST /api/items error:", err);
    return NextResponse.json({ error: err?.message ?? "Unexpected error" }, { status: 500 });
  }
}
