import { getMonthlySummary } from "@/lib/actions/transactions";
import { getNetWorthHistory } from "@/lib/actions/networth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { SpendingChart } from "./spending-chart";
import { NetWorthTrendChart } from "./net-worth-trend-chart";
import { BarChart3 } from "lucide-react";

async function getLast6MonthsSummaries() {
  const summaries = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const s = await getMonthlySummary(d.getFullYear(), d.getMonth() + 1);
    summaries.push({
      month: d.toLocaleString("default", { month: "short" }),
      income: s.income,
      expenses: s.expenses,
      savings: s.savings,
      savingsRate: s.savingsRate,
    });
  }
  return summaries;
}

export default async function ReportsPage() {
  const now = new Date();
  const [summaries, history, currentSummary] = await Promise.all([
    getLast6MonthsSummaries(),
    getNetWorthHistory(12),
    getMonthlySummary(now.getFullYear(), now.getMonth() + 1),
  ]);

  const avgSavingsRate = summaries.reduce((s, m) => s + m.savingsRate, 0) / summaries.length;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Reports & Analytics</h1>
        <p className="text-sm text-zinc-400">Financial trends and insights</p>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-zinc-400 mb-1">Avg. Savings Rate (6mo)</p>
            <p className="text-2xl font-bold text-indigo-400">{avgSavingsRate.toFixed(0)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-zinc-400 mb-1">Top Expense Category</p>
            <p className="text-lg font-bold text-zinc-100">
              {currentSummary.byCategory[0]?.icon} {currentSummary.byCategory[0]?.name ?? "—"}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {currentSummary.byCategory[0] ? formatCurrency(currentSummary.byCategory[0].amount) : "No data"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-zinc-400 mb-1">This Month Saved</p>
            <p className={`text-2xl font-bold ${currentSummary.savings >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {formatCurrency(currentSummary.savings)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income vs Expenses chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Income vs. Expenses (6 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <SpendingChart data={summaries} />
        </CardContent>
      </Card>

      {/* Net Worth trend */}
      {history.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Net Worth Trend (12 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <NetWorthTrendChart data={history} />
          </CardContent>
        </Card>
      )}

      {/* Category breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Spending by Category (This Month)</CardTitle>
          <CardDescription>{formatCurrency(currentSummary.expenses)} total expenses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentSummary.byCategory.slice(0, 8).map((cat) => {
            const pct = currentSummary.expenses > 0 ? (cat.amount / currentSummary.expenses) * 100 : 0;
            return (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5">
                    <span>{cat.icon}</span>
                    <span className="text-zinc-200">{cat.name}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 text-xs">{pct.toFixed(0)}%</span>
                    <span className="text-zinc-100 font-medium">{formatCurrency(cat.amount)}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {currentSummary.byCategory.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-8">No expense data for this month</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
