"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface NetWorthTrendChartProps {
  data: Array<{ date: Date | string; netWorth: number }>;
}

export function NetWorthTrendChart({ data }: NetWorthTrendChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    value: d.netWorth,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 12 }} />
        <YAxis tick={{ fill: "#71717a", fontSize: 12 }} tickFormatter={(v) => formatCurrency(v, "USD", true)} />
        <Tooltip
          contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
          formatter={(value: unknown) => [formatCurrency(Number(value)), "Net Worth"]}
        />
        <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
