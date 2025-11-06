// src/app/api/items/export-ftp/route.ts
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getPool } from "@/lib/db";
import { Client } from "basic-ftp";
import { Readable } from "node:stream"; // แนะนำ prefix node:
                                          // เพื่อให้ TS ตีความ type ได้ชัด

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let client: Client | null = null;

  try {
    // 1) ดึงข้อมูลจาก SQL
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT Id, Name, Qty, UpdatedAt
      FROM dbo.Items
      ORDER BY Id DESC
    `);

    // 2) สร้าง Excel ในหน่วยความจำ
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Items");

    ws.columns = [
      { header: "ID", key: "Id", width: 10 },
      { header: "Name", key: "Name", width: 30 },
      { header: "Qty", key: "Qty", width: 10 },
      { header: "UpdatedAt", key: "UpdatedAt", width: 25 },
    ];
    // header เน้นให้อ่านง่าย (ทางเลือก)
    ws.getRow(1).font = { bold: true };

    result.recordset.forEach((row) => ws.addRow(row));

    const buffer = await wb.xlsx.writeBuffer();

    // 3) ตั้งชื่อไฟล์ตามเวลา
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const filename = `Items_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(
      now.getHours()
    )}${pad(now.getMinutes())}${pad(now.getSeconds())}.xlsx`;

    // 4) Upload ไป FTP
    client = new Client();
    await client.access({
      host: "10.236.36.211",
      port: 21,                 // 🔁 ปรับเป็น 21 (FTP ปกติ) — 23 คือ Telnet
      user: "ftp_sapdev",
      password: "fsa@123456789x",
      secure: false,           // ถ้า FTPS → secure: true (แล้วตั้งค่า cert ตามจริง)
    });

    // ไปโฟลเดอร์ปลายทาง (ถ้าไม่มีจะสร้างให้)
    await client.ensureDir("/220/Inbound/MM/TEST");
    // แปลง Buffer → Readable stream ให้ตรง type ของ basic-ftp
    const stream = Readable.from(buffer as unknown as Uint8Array);
    await client.uploadFrom(stream, filename);

    return NextResponse.json({
      status: "success",
      message: "Exported and uploaded to FTP",
      filename,
    });
  } catch (err: any) {
    console.error("Export FTP error:", err);
    return NextResponse.json({ error: err?.message ?? "error" }, { status: 500 });
  } finally {
    // ปิดการเชื่อมต่อเสมอ
    try { client?.close(); } catch {}
  }
}
