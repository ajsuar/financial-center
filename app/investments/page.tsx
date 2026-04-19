import { getPortfolioSummary } from "@/lib/actions/investments";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { AllocationChart } from "./allocation-chart";
import { TrendingUp, TrendingDown } from "lucide-react";

const ASSET_CLASS_LABELS: Record<string, string> = {
  US_STOCK: "US Stocks",
  INTL_STOCK: "International",
  BOND: "Bonds",
  REAL_ESTATE: "Real Estate",
  CASH: "Cash",
  CRYPTO: "Crypto",
  COMMODITY: "Commodities",
  OTHER: "Other",
};

const ASSET_CLASS_COLORS: Record<string, string> = {
  US_STOCK: "#6366f1",
  INTL_STOCK: "#3b82f6",
  BOND: "#10b981",
  REAL_ESTATE: "#f59e0b",
  CASH: "#71717a",
  CRYPTO: "#f97316",
  COMMODITY: "#84cc16",
  OTHER: "#9ca3af",
};

export default async function InvestmentsPage() {
  const { accounts, allHoldings, totalValue, totalCostBasis, totalGain, gainPct, allocation } =
    await getPortfolioSummary();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Investments</h1>
        <p className="text-sm text-zinc-400">Portfolio overview and holdings</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-zinc-400 mb-1">Total Portfolio Value</p>
            <p className="text-2xl font-bold text-zinc-100">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-zinc-400 mb-1">Total Cost Basis</p>
            <p className="text-2xl font-bold text-zinc-100">{formatCurrency(totalCostBasis)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-zinc-400 mb-1">Total Gain / Loss</p>
            <div className="flex items-center gap-2">
              {totalGain >= 0
                ? <TrendingUp className="h-5 w-5 text-emerald-400" />
                : <TrendingDown className="h-5 w-5 text-red-400" />}
              <p className={`text-2xl font-bold ${totalGain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {totalGain >= 0 ? "+" : ""}{formatCurrency(totalGain)}
              </p>
              <Badge variant={totalGain >= 0 ? "success" : "destructive"} className="text-xs">
                {gainPct >= 0 ? "+" : ""}{gainPct.toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Allocation Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {allocation.length > 0 ? (
              <>
                <AllocationChart
                  data={allocation.map((a) => ({
                    name: ASSET_CLASS_LABELS[a.assetClass] ?? a.assetClass,
                    value: a.value,
                    color: ASSET_CLASS_COLORS[a.assetClass] ?? "#9ca3af",
                  }))}
                />
                <div className="space-y-1.5 mt-4">
                  {allocation.map((a) => (
                    <div key={a.assetClass} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: ASSET_CLASS_COLORS[a.assetClass] ?? "#9ca3af" }}
                        />
                        <span className="text-zinc-300">{ASSET_CLASS_LABELS[a.assetClass] ?? a.assetClass}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-400">{a.pct.toFixed(1)}%</span>
                        <span className="text-zinc-500 ml-2">{formatCurrency(a.value, "USD", true)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-8">No holdings</p>
            )}
          </CardContent>
        </Card>

        {/* Holdings Table */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Holdings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-800">
              {allHoldings.map((holding) => {
                const gain = holding.currentValue - holding.costBasis;
                const gainPct = holding.costBasis > 0 ? (gain / holding.costBasis) * 100 : 0;
                return (
                  <div key={holding.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {holding.ticker && (
                            <Badge variant="secondary" className="text-xs font-mono">{holding.ticker}</Badge>
                          )}
                          <p className="text-sm font-medium text-zinc-100 truncate">{holding.name}</p>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {holding.quantity.toFixed(2)} shares · Basis {formatCurrency(holding.costBasis, "USD", true)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-zinc-100">{formatCurrency(holding.currentValue)}</p>
                        <p className={`text-xs font-medium ${gain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {gain >= 0 ? "+" : ""}{formatCurrency(gain, "USD", true)} ({gainPct >= 0 ? "+" : ""}{gainPct.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {allHoldings.length === 0 && (
                <div className="py-12 text-center text-zinc-500">
                  <p className="text-3xl mb-2">📈</p>
                  <p className="text-sm">No investment holdings yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
