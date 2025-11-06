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
  "#00d34dff", // green
  "#0965d6ff", // blue
  "#ec007aff", // pink
  "#f77810ff", // orange
  "#f1c202ff", // yellow
  "#8c68f8ff", // purple
  "#00ffa2ff", // emerald
  "#f84444ff", // red
  "#0cd4f3ff", // cyan
  "#fda000ff", // amber
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
