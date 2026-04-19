"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface NetWorthChartProps {
  data: Array<{ date: Date | string; netWorth: number; totalAssets: number; totalLiabilities: number }>;
}

export function NetWorthChart({ data }: NetWorthChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    netWorth: d.netWorth,
    assets: d.totalAssets,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          tickFormatter={(v) => formatCurrency(v, "USD", true)}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }}
          labelStyle={{ color: "#64748b" }}
          formatter={(value: unknown) => [formatCurrency(Number(value)), ""]}
        />
        <Area type="monotone" dataKey="netWorth" stroke="#6366f1" strokeWidth={2} fill="url(#nwFill)" name="Net Worth" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
