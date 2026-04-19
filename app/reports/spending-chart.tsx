"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface SpendingChartProps {
  data: Array<{ month: string; income: number; expenses: number; savings: number }>;
}

export function SpendingChart({ data }: SpendingChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 12 }} />
        <YAxis tick={{ fill: "#71717a", fontSize: 12 }} tickFormatter={(v) => formatCurrency(v, "USD", true)} />
        <Tooltip
          contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
          formatter={(value: unknown) => [formatCurrency(Number(value)), ""]}
        />
        <Legend wrapperStyle={{ color: "#a1a1aa", fontSize: 12 }} />
        <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="savings" name="Saved" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
