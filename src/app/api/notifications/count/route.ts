import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pool = await getPool();
    const rs = await pool.request().query(`
      SELECT COUNT(*) AS cnt
      FROM dbo.Items
      -- ถ้าต้องการเงื่อนไขเพิ่ม เติม WHERE ได้ เช่น WHERE Qty > 0
    `);
    const count = Number(rs.recordset[0]?.cnt ?? 0);
    return NextResponse.json({ count }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/notifications/count error:", err);
    return NextResponse.json({ error: err?.message ?? "error" }, { status: 500 });
  }
}
