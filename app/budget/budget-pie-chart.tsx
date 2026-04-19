"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

const COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ec4899", "#3b82f6",
  "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16", "#f97316",
];

interface BudgetPieChartProps {
  lines: Array<{
    id: string;
    allocated: number;
    spent: number;
    category: { name: string; icon: string | null };
  }>;
}

export function BudgetPieChart({ lines }: BudgetPieChartProps) {
  const data = lines.map((line, i) => ({
    name: `${line.category.icon ?? ""} ${line.category.name}`,
    allocated: line.allocated,
    spent: line.spent,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="allocated"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} opacity={0.9} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }}
          formatter={(value: unknown, name: unknown) => [formatCurrency(Number(value)), String(name ?? "")]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ color: "#64748b", fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
