"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,            // ⬅️ เพิ่ม
} from "recharts";

type Item = { Id: number; Name: string; Qty: number; UpdatedAt: string };

const COLORS = [
  "#4ade80", // green
  "#60a5fa", // blue
  "#f472b6", // pink
  "#fb923c", // orange
  "#facc15", // yellow
  "#a78bfa", // purple
  "#34d399", // emerald
  "#f87171", // red
  "#22d3ee", // cyan
  "#f59e0b", // amber
];

export default function ItemsChart({ rows }: { rows: Item[] }) {
  // แปลงข้อมูลสำหรับ chart (เลือก top 10 กันชื่อยาว/ข้อมูลเยอะ)
  const data = rows
    .map(r => ({ name: r.Name, qty: r.Qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  return (
    <div className="w-full h-80 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
      <div className="text-sm mb-2 text-neutral-600 dark:text-neutral-300">
        Top 10 Qty by Item
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-20} textAnchor="end" height={50} interval={0} />
          <YAxis />
          <Tooltip />

          <Bar dataKey="qty">
            {data.map((d, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}

            {/*
            // ⬇️ ตัวอย่างทำ “สีตามเงื่อนไข” (สลับมาใช้แทนโค้ดด้านบนได้)
            {data.map((d, i) => {
              let c = "#4ade80";        // ปกติ = เขียว
              if (d.qty < 10) c = "#facc15";  // น้อย = เหลือง
              if (d.qty < 5)  c = "#f87171";  // ต่ำมาก = แดง
              return <Cell key={i} fill={c} />;
            })}
            */}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
