"use client";

import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface NetWorthMiniChartProps {
  data: Array<{ date: Date | string; netWorth: number }>;
}

export function NetWorthMiniChart({ data }: NetWorthMiniChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short" }),
    value: d.netWorth,
  }));

  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="nwGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload?.[0]) {
              return (
                <div className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 shadow-sm">
                  {formatCurrency(payload[0].value as number)}
                </div>
              );
            }
            return null;
          }}
        />
        <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#nwGradient)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
