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
          contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
          formatter={(value: unknown, name: unknown) => [formatCurrency(Number(value)), String(name ?? "")]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
