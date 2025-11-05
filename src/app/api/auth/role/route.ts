import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { role } = (await req.json()) as { role?: "user" | "manager" };
  if (role !== "user" && role !== "manager") 
  {
    return NextResponse.json({ error: "invalid role" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, role });
  // ตั้งคุกกี้ที่นี่ (เขียนได้แน่นอนใน Route Handler)
  res.cookies.set({
    name: "role",
    value: role,
    httpOnly: false,  // เดโม: ให้อ่านได้จาก client (จริงๆ โปรดล็อกตามนโยบาย)
    sameSite: "lax",
    path: "/",
  });
  return res;
}
