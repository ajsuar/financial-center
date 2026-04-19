import { getAccounts } from "@/lib/actions/accounts";
import { getMonthlySummary } from "@/lib/actions/transactions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { EditBalanceDialog } from "@/app/net-worth/edit-balance-dialog";
import { PiggyBank, ShieldCheck, TrendingUp } from "lucide-react";

export default async function SavingsPage() {
  const now = new Date();
  const accounts = await getAccounts();
  const summary = await getMonthlySummary(now.getFullYear(), now.getMonth() + 1);

  const savingsAccounts = accounts.filter((a) => a.type === "SAVINGS");
  const totalSavings = savingsAccounts.reduce((s, a) => s + a.balance, 0);

  const monthlyExpenses = summary.expenses;
  const emergencyFundTarget = monthlyExpenses * 6;
  const emergencyFundPct = emergencyFundTarget > 0
    ? Math.min(100, (totalSavings / emergencyFundTarget) * 100)
    : 0;
  const monthsCovered = monthlyExpenses > 0 ? totalSavings / monthlyExpenses : 0;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Savings</h1>
        <p className="text-sm text-slate-500">Savings accounts and emergency fund tracker</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <PiggyBank className="h-4 w-4 text-emerald-500" />
              <p className="text-xs text-slate-500">Total Savings</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalSavings)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-slate-500">Emergency Fund</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{monthsCovered.toFixed(1)} months</p>
            <p className="text-xs text-slate-400 mt-0.5">Target: 6 months</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              <p className="text-xs text-slate-500">Savings Rate</p>
            </div>
            <p className="text-2xl font-bold text-indigo-600">{summary.savingsRate.toFixed(0)}%</p>
            <p className="text-xs text-slate-400 mt-0.5">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Fund Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-500" />
            Emergency Fund Progress
          </CardTitle>
          <CardDescription>
            {monthsCovered >= 6
              ? "🎉 You have a fully funded emergency fund!"
              : `${(6 - monthsCovered).toFixed(1)} more months needed to reach 6-month goal`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress
            value={emergencyFundPct}
            indicatorClassName={
              emergencyFundPct >= 100 ? "bg-emerald-500" :
              emergencyFundPct >= 50 ? "bg-blue-500" : "bg-indigo-500"
            }
          />
          <div className="flex justify-between text-sm text-slate-500">
            <span>{formatCurrency(totalSavings)} saved</span>
            <span>Target: {formatCurrency(emergencyFundTarget)}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[1, 3, 6].map((months) => (
              <div
                key={months}
                className={`rounded-lg p-3 text-center border ${totalSavings >= monthlyExpenses * months ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}
              >
                <p className="text-lg">{totalSavings >= monthlyExpenses * months ? "✅" : "⬜"}</p>
                <p className="text-xs text-slate-600 mt-1">{months} month{months > 1 ? "s" : ""}</p>
                <p className="text-xs text-slate-400">{formatCurrency(monthlyExpenses * months, "USD", true)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Savings Accounts */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Savings Accounts</h2>
        <div className="space-y-3">
          {savingsAccounts.map((acc) => (
            <Card key={acc.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{acc.icon ?? "💰"}</span>
                  <div>
                    <p className="font-medium text-slate-900">{acc.name}</p>
                    <p className="text-xs text-slate-400">{acc.institution ?? "Savings"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(acc.balance)}</p>
                  <EditBalanceDialog account={acc} />
                </div>
              </CardContent>
            </Card>
          ))}
          {savingsAccounts.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-slate-400">
                <p>No savings accounts. Add one in <a href="/accounts" className="text-indigo-600 hover:underline">Accounts</a>.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
