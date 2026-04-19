import { getBudgetForMonth, getBudgetProgress, createMonthlyBudget } from "@/lib/actions/budgets";
import { getCategories } from "@/lib/actions/networth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { BudgetLineManager } from "./budget-line-manager";
import { CreateBudgetButton } from "./create-budget-button";
import { Wallet, AlertTriangle } from "lucide-react";

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

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Budget</h1>
          <p className="text-sm text-zinc-400">{monthName} {year}</p>
        </div>
        {!budget && <CreateBudgetButton month={month} year={year} />}
      </div>

      {!budget ? (
        <Card>
          <CardContent className="py-16 text-center text-zinc-500">
            <Wallet className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
            <p className="text-lg font-medium text-zinc-300">No budget for {monthName} {year}</p>
            <p className="text-sm mt-1">Create a budget to start tracking your spending</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary */}
          {progress && (
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-zinc-400 mb-1">Budgeted</p>
                  <p className="text-xl font-bold text-zinc-100">{formatCurrency(progress.totalAllocated)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-zinc-400 mb-1">Spent</p>
                  <p className={`text-xl font-bold ${progress.totalSpent > progress.totalAllocated ? "text-red-400" : "text-amber-400"}`}>
                    {formatCurrency(progress.totalSpent)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-zinc-400 mb-1">Remaining</p>
                  <p className={`text-xl font-bold ${progress.totalRemaining >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {formatCurrency(Math.abs(progress.totalRemaining))}
                    {progress.totalRemaining < 0 && " over"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Overall progress */}
          {progress && (
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">Overall Budget</span>
                  <span className="text-zinc-300 font-medium">
                    {((progress.totalSpent / progress.totalAllocated) * 100).toFixed(0)}% used
                  </span>
                </div>
                <Progress
                  value={Math.min(100, (progress.totalSpent / progress.totalAllocated) * 100)}
                  indicatorClassName={
                    progress.totalSpent > progress.totalAllocated ? "bg-red-500" :
                    progress.totalSpent > progress.totalAllocated * 0.8 ? "bg-amber-500" : "bg-emerald-500"
                  }
                />
              </CardContent>
            </Card>
          )}

          {/* Category Lines */}
          <div className="space-y-3">
            {progress?.lines.map((line) => (
              <Card key={line.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{line.category.icon}</span>
                      <span className="text-sm font-medium text-zinc-100">{line.category.name}</span>
                      {line.pct > 100 && (
                        <Badge variant="destructive" className="text-xs">Over budget</Badge>
                      )}
                      {line.pct > 80 && line.pct <= 100 && (
                        <Badge variant="warning" className="text-xs">Nearly full</Badge>
                      )}
                    </div>
                    <div className="text-right text-xs text-zinc-400">
                      <span className={line.spent > line.allocated ? "text-red-400" : "text-zinc-200"}>
                        {formatCurrency(line.spent)}
                      </span>
                      {" / "}{formatCurrency(line.allocated)}
                    </div>
                  </div>
                  <Progress
                    value={Math.min(100, line.pct)}
                    className="h-1.5"
                    indicatorClassName={
                      line.pct > 100 ? "bg-red-500" :
                      line.pct > 80 ? "bg-amber-500" : "bg-indigo-500"
                    }
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add budget lines */}
          <BudgetLineManager budgetId={budget.id} categories={expenseCategories} existingLines={budget.lines} />
        </>
      )}
    </div>
  );
}
