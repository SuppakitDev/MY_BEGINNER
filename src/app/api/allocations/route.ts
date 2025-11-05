import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

// บังคับใช้ Node.js runtime (อย่าใช้ edge)
export const runtime = "nodejs";
// ให้เป็น dynamic เสมอ (ไม่ cache)
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // const minQty = Number(searchParams.get("minQty") ?? 0);
    // const top = Math.min(Number(searchParams.get("top") ?? 50), 500);

    const pool = await getPool();

    // ตัวอย่าง query: ดึงจากตารางสมมุติ wmwhse2.SKUXLOC
    // ปรับชื่อตาราง/ฟิลด์ให้ตรงกับของจริงได้เลย
    const result = await pool
      .request()
    //   .input("minQty", sql.Int, minQty)
    //   .input("top", sql.Int, top)
      .query(`select top(10)* from dbo.Items`);

    return NextResponse.json(result.recordset, { status: 200 });
  } catch (err: any) {
    console.error("API /allocations error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
