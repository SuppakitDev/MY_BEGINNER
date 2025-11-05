"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  async function signIn(role: "user" | "manager") {
    const res = await fetch("/api/auth/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      alert("Set role failed");
      return;
    }
    router.push("/");      // กลับหน้าแรก หรือจะไป /items ก็ได้
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="font-heading text-2xl mb-2">Sign in (Demo)</h1>

      <div className="card p-4 space-y-2">
        <div className="text-sm">Login as <b>User</b> (read-only)</div>
        <button onClick={() => signIn("user")} className="rounded-xl border px-3 py-2">
          Continue as User
        </button>
      </div>

      <div className="card p-4 space-y-2">
        <div className="text-sm">Login as <b>Manager</b> (can edit)</div>
        <button onClick={() => signIn("manager")} className="rounded-xl border px-3 py-2">
          Continue as Manager
        </button>
      </div>
    </main>
  );
}
