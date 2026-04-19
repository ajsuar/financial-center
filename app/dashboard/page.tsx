import { getCurrentNetWorth } from "@/lib/actions/networth";
import { getMonthlySummary } from "@/lib/actions/transactions";
import { getGoals } from "@/lib/actions/goals";
import { getAccounts } from "@/lib/actions/accounts";
import { getNetWorthHistory } from "@/lib/actions/networth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, getGoalProgress } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Target,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { NetWorthMiniChart } from "@/components/dashboard/net-worth-mini-chart";

export default async function DashboardPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [netWorthData, summary, goals, accounts, history] = await Promise.all([
    getCurrentNetWorth(),
    getMonthlySummary(year, month),
    getGoals(),
    getAccounts(),
    getNetWorthHistory(12),
  ]);

  const prevMonth = history.length >= 2 ? history[history.length - 2]?.netWorth : null;
  const netWorthChange = prevMonth ? netWorthData.netWorth - prevMonth : 0;
  const netWorthChangePct = prevMonth && prevMonth !== 0 ? (netWorthChange / Math.abs(prevMonth)) * 100 : 0;

  const activeGoals = goals.filter((g) => !g.isCompleted).slice(0, 3);
  const recentTransactions = summary.transactions.slice(0, 8);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">{formatDate(now, "month-year")}</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <Card className="col-span-1 lg:col-span-2 bg-gradient-to-br from-indigo-50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              Net Worth
              <span className={`text-xs ml-2 font-medium ${netWorthChange >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {netWorthChange >= 0 ? "+" : ""}{formatCurrency(netWorthChange, "USD", true)}{" "}
                ({netWorthChange >= 0 ? "+" : ""}{netWorthChangePct.toFixed(1)}%) this month
              </span>
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-slate-900">
              {formatCurrency(netWorthData.netWorth)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm mb-3">
              <span className="text-emerald-600">Assets {formatCurrency(netWorthData.totalAssets, "USD", true)}</span>
              <span className="text-slate-300">·</span>
              <span className="text-red-500">Liabilities {formatCurrency(netWorthData.totalLiabilities, "USD", true)}</span>
            </div>
            {history.length > 1 && <NetWorthMiniChart data={history} />}
          </CardContent>
        </Card>

        {/* Monthly Income */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              Income this month
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">
              {formatCurrency(summary.income)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Savings rate: <span className="text-slate-700 font-medium">{summary.savingsRate.toFixed(0)}%</span>
            </p>
          </CardContent>
        </Card>

        {/* Monthly Expenses */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <ArrowDownLeft className="h-3 w-3 text-red-500" />
              Spent this month
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-red-500">
              {formatCurrency(summary.expenses)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Saved: <span className="text-emerald-600 font-medium">{formatCurrency(summary.savings)}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-indigo-500" />
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeGoals.map((goal) => {
              const pct = getGoalProgress(goal.currentAmount, goal.targetAmount);
              return (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                      <span>{goal.emoji}</span>
                      {goal.name}
                    </span>
                    <span className="text-xs text-slate-500">{pct.toFixed(0)}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" indicatorClassName="bg-indigo-500" />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{formatCurrency(goal.currentAmount, "USD", true)}</span>
                    <span>{formatCurrency(goal.targetAmount, "USD", true)}</span>
                  </div>
                </div>
              );
            })}
            {activeGoals.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No active goals</p>
            )}
            <Link href="/goals" className="block text-xs text-indigo-600 hover:text-indigo-700 text-center pt-1">
              View all goals →
            </Link>
          </CardContent>
        </Card>

        {/* Spending by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4 text-amber-500" />
              Top Spending
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.byCategory.slice(0, 5).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm">{cat.icon}</span>
                  <span className="text-sm text-slate-700 truncate">{cat.name}</span>
                </div>
                <span className="text-sm font-medium text-slate-800 shrink-0">
                  {formatCurrency(cat.amount)}
                </span>
              </div>
            ))}
            {summary.byCategory.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No expenses yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-slate-800 truncate">{tx.description}</p>
                  <p className="text-xs text-slate-400">{formatDate(tx.date)}</p>
                </div>
                <span className={`text-sm font-medium shrink-0 ${tx.type === "INCOME" ? "text-emerald-600" : "text-red-500"}`}>
                  {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(Math.abs(tx.amount))}
                </span>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No transactions yet</p>
            )}
            <Link href="/transactions" className="block text-xs text-indigo-600 hover:text-indigo-700 text-center pt-1">
              View all transactions →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PiggyBank className="h-4 w-4 text-emerald-500" />
            Accounts Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {accounts.map((acc) => (
              <div key={acc.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xl">{acc.icon ?? "🏦"}</span>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 truncate">{acc.name}</p>
                  <p className={`text-sm font-semibold ${acc.balance < 0 ? "text-red-500" : "text-slate-900"}`}>
                    {formatCurrency(acc.balance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
