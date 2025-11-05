import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT Id, Name, Qty, UpdatedAt
      FROM dbo.Items
      ORDER BY Id DESC
    `);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Items");

    sheet.columns = [
      { header: "ID", key: "Id", width: 10 },
      { header: "Name", key: "Name", width: 30 },
      { header: "Qty", key: "Qty", width: 10 },
      { header: "UpdatedAt", key: "UpdatedAt", width: 25 },
    ];

    result.recordset.forEach((row) => {
      sheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename="Items.xlsx"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err: any) {
    console.error("Export error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
