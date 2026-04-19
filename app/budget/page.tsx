import { getBudgetForMonth, getBudgetProgress, createMonthlyBudget } from "@/lib/actions/budgets";
import { getCategories } from "@/lib/actions/networth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { BudgetLineManager } from "./budget-line-manager";
import { CreateBudgetButton } from "./create-budget-button";
import { BudgetPieChart } from "./budget-pie-chart";
import { Wallet, AlertTriangle, TrendingDown, TrendingUp, CheckCircle2 } from "lucide-react";

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const month = parseInt(params.month ?? String(now.getMonth() + 1));
  const year = parseInt(params.year ?? String(now.getFullYear()));

  const [budget, categories] = await Promise.all([
    getBudgetForMonth(year, month),
    getCategories(),
  ]);

  const progress = budget ? await getBudgetProgress(budget.id, year, month) : null;
  const monthName = new Date(year, month - 1).toLocaleString("default", { month: "long" });
  const expenseCategories = categories.flatMap((c) =>
    c.type === "EXPENSE" ? [c, ...c.children.filter((ch) => ch.type === "EXPENSE")] : []
  );

  const overBudgetLines = progress?.lines.filter((l) => l.pct > 100) ?? [];
  const healthyLines = progress?.lines.filter((l) => l.pct <= 80) ?? [];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Budget</h1>
          <p className="text-sm text-slate-500">{monthName} {year}</p>
        </div>
        {!budget && <CreateBudgetButton month={month} year={year} />}
      </div>

      {!budget ? (
        <Card>
          <CardContent className="py-16 text-center text-slate-400">
            <Wallet className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-lg font-medium text-slate-700">No budget for {monthName} {year}</p>
            <p className="text-sm mt-1">Create a budget to start tracking your spending</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary cards */}
          {progress && (
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-slate-500 mb-1">Budgeted</p>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(progress.totalAllocated)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-slate-500 mb-1">Spent</p>
                  <p className={`text-xl font-bold ${progress.totalSpent > progress.totalAllocated ? "text-red-600" : "text-amber-600"}`}>
                    {formatCurrency(progress.totalSpent)}
                  </p>
                </CardContent>
              </Card>
              <Card className={progress.totalRemaining >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}>
                <CardContent className="pt-4">
                  <p className="text-xs text-slate-500 mb-1">Remaining</p>
                  <div className="flex items-center gap-1">
                    {progress.totalRemaining >= 0
                      ? <TrendingUp className="h-4 w-4 text-emerald-500" />
                      : <TrendingDown className="h-4 w-4 text-red-500" />}
                    <p className={`text-xl font-bold ${progress.totalRemaining >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                      {formatCurrency(Math.abs(progress.totalRemaining))}
                      {progress.totalRemaining < 0 && " over"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Overall progress bar */}
          {progress && (
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500 font-medium">Overall Budget</span>
                  <span className="text-slate-700 font-semibold">
                    {((progress.totalSpent / progress.totalAllocated) * 100).toFixed(0)}% used
                  </span>
                </div>
                <Progress
                  value={Math.min(100, (progress.totalSpent / progress.totalAllocated) * 100)}
                  className="h-2.5"
                  indicatorClassName={
                    progress.totalSpent > progress.totalAllocated ? "bg-red-500" :
                    progress.totalSpent > progress.totalAllocated * 0.8 ? "bg-amber-500" : "bg-emerald-500"
                  }
                />
                {overBudgetLines.length > 0 && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {overBudgetLines.length} categor{overBudgetLines.length > 1 ? "ies" : "y"} over budget
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pie Chart + Category Lines side by side */}
          {progress && progress.lines.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Pie Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Allocation Breakdown</CardTitle>
                  <CardDescription>Budget allocated by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <BudgetPieChart lines={progress.lines} />
                </CardContent>
              </Card>

              {/* Category lines */}
              <div className="lg:col-span-3 space-y-3">
                {progress.lines.map((line) => (
                  <Card key={line.id} className={line.pct > 100 ? "border-red-200 bg-red-50/50" : line.pct > 80 ? "border-amber-200" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{line.category.icon}</span>
                          <span className="text-sm font-medium text-slate-800">{line.category.name}</span>
                          {line.pct > 100 && (
                            <Badge variant="destructive" className="text-xs">Over budget</Badge>
                          )}
                          {line.pct > 80 && line.pct <= 100 && (
                            <Badge variant="warning" className="text-xs">Nearly full</Badge>
                          )}
                          {line.pct <= 50 && line.spent > 0 && (
                            <Badge variant="success" className="text-xs">On track</Badge>
                          )}
                        </div>
                        <div className="text-right text-xs">
                          <span className={line.spent > line.allocated ? "text-red-600 font-semibold" : "text-slate-700 font-medium"}>
                            {formatCurrency(line.spent)}
                          </span>
                          <span className="text-slate-400"> / {formatCurrency(line.allocated)}</span>
                        </div>
                      </div>
                      <Progress
                        value={Math.min(100, line.pct)}
                        className="h-2"
                        indicatorClassName={
                          line.pct > 100 ? "bg-red-500" :
                          line.pct > 80 ? "bg-amber-500" : "bg-indigo-500"
                        }
                      />
                      <div className="flex justify-between mt-1.5 text-xs text-slate-400">
                        <span>{line.pct.toFixed(0)}% used</span>
                        <span>{formatCurrency(line.remaining)} left</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Add budget lines */}
          <BudgetLineManager budgetId={budget.id} categories={expenseCategories} existingLines={budget.lines} />
        </>
      )}
    </div>
  );
}
