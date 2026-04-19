import { getAccounts } from "@/lib/actions/accounts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getAccountTypeLabel, isAssetAccount, isLiabilityAccount } from "@/lib/utils";
import { AddAccountDialog } from "./add-account-dialog";
import { EditAccountDialog } from "./edit-account-dialog";

export default async function AccountsPage() {
  const accounts = await getAccounts();

  const assets = accounts.filter((a) => isAssetAccount(a.type));
  const liabilities = accounts.filter((a) => isLiabilityAccount(a.type));

  const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = Math.abs(liabilities.reduce((s, a) => s + a.balance, 0));
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Accounts</h1>
          <p className="text-sm text-zinc-400">Manage your financial accounts</p>
        </div>
        <AddAccountDialog />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-zinc-400 mb-1">Total Assets</p>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(totalAssets)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-zinc-400 mb-1">Total Liabilities</p>
            <p className="text-xl font-bold text-red-400">{formatCurrency(totalLiabilities)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-zinc-400 mb-1">Net Worth</p>
            <p className={`text-xl font-bold ${netWorth >= 0 ? "text-zinc-100" : "text-red-400"}`}>
              {formatCurrency(netWorth)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assets */}
      {assets.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Assets</h2>
          <div className="space-y-2">
            {assets.map((acc) => (
              <Card key={acc.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{acc.icon ?? "🏦"}</span>
                    <div>
                      <p className="font-medium text-zinc-100">{acc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">{getAccountTypeLabel(acc.type)}</Badge>
                        {acc.institution && <span className="text-xs text-zinc-500">{acc.institution}</span>}
                        {acc.isShared && <Badge variant="outline" className="text-xs">Shared</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-semibold text-emerald-400">{formatCurrency(acc.balance)}</p>
                    <EditAccountDialog account={acc} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Liabilities */}
      {liabilities.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Liabilities</h2>
          <div className="space-y-2">
            {liabilities.map((acc) => (
              <Card key={acc.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{acc.icon ?? "💳"}</span>
                    <div>
                      <p className="font-medium text-zinc-100">{acc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="destructive" className="text-xs">{getAccountTypeLabel(acc.type)}</Badge>
                        {acc.institution && <span className="text-xs text-zinc-500">{acc.institution}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-semibold text-red-400">{formatCurrency(Math.abs(acc.balance))}</p>
                    <EditAccountDialog account={acc} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
