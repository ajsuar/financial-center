import { getCurrentNetWorth, getNetWorthHistory } from "@/lib/actions/networth";
import { takeNetWorthSnapshot } from "@/lib/actions/accounts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getAccountTypeLabel, isAssetAccount } from "@/lib/utils";
import { NetWorthChart } from "./net-worth-chart";
import { SnapshotButton } from "./snapshot-button";
import { TrendingUp, TrendingDown, Award } from "lucide-react";

const NET_WORTH_MILESTONES = [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];

export default async function NetWorthPage() {
  const [{ netWorth, totalAssets, totalLiabilities, accounts }, history] = await Promise.all([
    getCurrentNetWorth(),
    getNetWorthHistory(24),
  ]);

  const prevSnapshot = history.length >= 2 ? history[history.length - 2] : null;
  const change = prevSnapshot ? netWorth - prevSnapshot.netWorth : 0;

  const assets = accounts.filter((a) => isAssetAccount(a.type));
  const liabilities = accounts.filter((a) => !isAssetAccount(a.type));

  const nextMilestone = NET_WORTH_MILESTONES.find((m) => m > netWorth);
  const toNextMilestone = nextMilestone ? nextMilestone - netWorth : 0;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Net Worth</h1>
          <p className="text-sm text-zinc-400">Your complete financial picture</p>
        </div>
        <SnapshotButton />
      </div>

      {/* Big number */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-zinc-400">Total Net Worth</p>
            <p className="text-5xl font-bold text-zinc-100">{formatCurrency(netWorth)}</p>
            <div className="flex items-center justify-center gap-2">
              {change >= 0
                ? <TrendingUp className="h-4 w-4 text-emerald-400" />
                : <TrendingDown className="h-4 w-4 text-red-400" />}
              <span className={`text-sm font-medium ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {change >= 0 ? "+" : ""}{formatCurrency(change)} since last snapshot
              </span>
            </div>
            {nextMilestone && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
                <Award className="h-3.5 w-3.5 text-amber-400" />
                <span>{formatCurrency(toNextMilestone)} away from {formatCurrency(nextMilestone)} milestone</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {history.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Net Worth Over Time</CardTitle>
            <CardDescription>Historical snapshots (last 24 months)</CardDescription>
          </CardHeader>
          <CardContent>
            <NetWorthChart data={history} />
          </CardContent>
        </Card>
      )}

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="text-emerald-400">Assets</span>
              <span className="text-lg font-bold">{formatCurrency(totalAssets)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {assets.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{acc.icon ?? "🏦"}</span>
                  <div>
                    <p className="text-sm text-zinc-200">{acc.name}</p>
                    <p className="text-xs text-zinc-500">{getAccountTypeLabel(acc.type)}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-emerald-400">{formatCurrency(acc.balance)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Liabilities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="text-red-400">Liabilities</span>
              <span className="text-lg font-bold">{formatCurrency(totalLiabilities)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {liabilities.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{acc.icon ?? "💳"}</span>
                  <div>
                    <p className="text-sm text-zinc-200">{acc.name}</p>
                    <p className="text-xs text-zinc-500">{getAccountTypeLabel(acc.type)}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-red-400">{formatCurrency(Math.abs(acc.balance))}</p>
              </div>
            ))}
            {liabilities.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-4">🎉 No liabilities!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
