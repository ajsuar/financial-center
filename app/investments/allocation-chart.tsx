"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface AllocationChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export function AllocationChart({ data }: AllocationChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#0f172a" }}
          formatter={(value: unknown, name: unknown) => [formatCurrency(Number(value)), String(name ?? "")]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
