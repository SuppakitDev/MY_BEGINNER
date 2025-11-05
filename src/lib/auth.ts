import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type Role = "user" | "manager";

// อ่าน cookie "role" จาก request headers โดยตรง (ไม่ใช้ cookies()/headers())
export function getRoleFromRequest(req: Request): Role {
  const cookie = req.headers.get("cookie") ?? "";
  const parts = cookie.split(/;\s*/);
  for (const p of parts) {
    const [k, ...rest] = p.split("=");
    if (k === "role") {
      const val = decodeURIComponent(rest.join("="));
      return val === "manager" ? "manager" : "user";
    }
  }
  return "user";
}

// ใช้ใน API: บล็อกถ้าไม่ได้เป็น manager
export function assertManagerOr403(req: Request): Response | null {
  const role = getRoleFromRequest(req);
  if (role !== "manager") {
    return new Response(JSON.stringify({ error: "Forbidden: manager only" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}

// ใช้ใน API: บล็อกถ้าไม่ใช่ manager
// export function requireManager() {
//   const role = getRole();
//   if (role !== "manager") {
//     return NextResponse.json({ error: "Forbidden: manager only" }, { status: 403 });
//   }
//   return null;
// }
