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
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(v) => formatCurrency(v, "USD", true)} />
        <Tooltip
          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }}
          formatter={(value: unknown) => [formatCurrency(Number(value)), ""]}
        />
        <Legend wrapperStyle={{ color: "#64748b", fontSize: 12 }} />
        <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="savings" name="Saved" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
